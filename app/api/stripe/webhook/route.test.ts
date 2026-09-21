import { describe, it, expect, vi, beforeEach } from "vitest";
import Stripe from "stripe";
import { createFakeSupabase } from "@/test/fake-supabase";

const WEBHOOK_SECRET = "whsec_test_secret";
process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;

// Instance Stripe réelle (constructEvent/generateTestHeaderString sont des
// opérations cryptographiques locales, sans appel réseau) dont on ne mocke
// que les appels qui, eux, contactent l'API Stripe.
const realStripe = new Stripe("sk_test_fake_key_for_unit_tests");
const subscriptionsRetrieve = vi.fn();
realStripe.subscriptions.retrieve = subscriptionsRetrieve as never;

vi.mock("@/lib/stripe/client", () => ({ getStripe: () => realStripe }));

let fakeSupabase: ReturnType<typeof createFakeSupabase>;
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => fakeSupabase }));

const syncSubscriptionFromStripe = vi.fn();
vi.mock("@/lib/stripe/subscription-sync", () => ({
  syncSubscriptionFromStripe: (...args: unknown[]) => syncSubscriptionFromStripe(...args),
}));

vi.mock("@/lib/stripe/referral", () => ({ ensureReferralCoupon: vi.fn() }));
vi.mock("@/lib/email/resend", () => ({
  sendPaymentFailedEmail: vi.fn(),
  sendReferralRewardEmail: vi.fn(),
}));

function signedRequest(body: object, options?: { badSignature?: boolean }) {
  const payload = JSON.stringify(body);
  const signature = options?.badSignature
    ? "t=1,v1=signature-invalide"
    : realStripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });

  return new Request("https://growthis.io/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": signature },
    body: payload,
  });
}

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fakeSupabase = createFakeSupabase({});
  });

  it("rejette une signature invalide sans toucher à la base", async () => {
    const { POST } = await import("./route");
    const response = await POST(signedRequest({ id: "evt_1", type: "ping" }, { badSignature: true }));

    expect(response.status).toBe(400);
    expect(syncSubscriptionFromStripe).not.toHaveBeenCalled();
  });

  it("synchronise l'abonnement sur customer.subscription.updated", async () => {
    const subscription = {
      id: "sub_123",
      metadata: { organization_id: "org-1" },
      items: { data: [{ price: { id: "price_essentiel" }, current_period_end: 1893456000 }] },
    };
    const { POST } = await import("./route");
    const response = await POST(
      signedRequest({
        id: "evt_2",
        type: "customer.subscription.updated",
        data: { object: subscription },
      }),
    );

    expect(response.status).toBe(200);
    expect(syncSubscriptionFromStripe).toHaveBeenCalledTimes(1);
    expect(syncSubscriptionFromStripe.mock.calls[0][1]).toMatchObject({ id: "sub_123" });
  });

  it("checkout.session.completed récupère l'abonnement complet puis le synchronise", async () => {
    const subscription = { id: "sub_456", metadata: { organization_id: "org-2" }, items: { data: [] } };
    subscriptionsRetrieve.mockResolvedValue(subscription);

    const { POST } = await import("./route");
    const response = await POST(
      signedRequest({
        id: "evt_3",
        type: "checkout.session.completed",
        data: { object: { mode: "subscription", subscription: "sub_456" } },
      }),
    );

    expect(response.status).toBe(200);
    expect(subscriptionsRetrieve).toHaveBeenCalledWith("sub_456");
    expect(syncSubscriptionFromStripe).toHaveBeenCalledWith(fakeSupabase, subscription);
  });

  it("ignore un checkout.session.completed en mode paiement unique (pas d'abonnement)", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      signedRequest({
        id: "evt_4",
        type: "checkout.session.completed",
        data: { object: { mode: "payment", subscription: null } },
      }),
    );

    expect(response.status).toBe(200);
    expect(subscriptionsRetrieve).not.toHaveBeenCalled();
    expect(syncSubscriptionFromStripe).not.toHaveBeenCalled();
  });

  it("répond 400 si STRIPE_WEBHOOK_SECRET n'est pas configuré", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const { POST } = await import("./route");
    const response = await POST(signedRequest({ id: "evt_5", type: "ping" }));
    expect(response.status).toBe(400);
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });
});
