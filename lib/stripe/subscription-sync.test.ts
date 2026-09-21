import { describe, it, expect, beforeEach } from "vitest";
import type Stripe from "stripe";
import { createFakeSupabase } from "@/test/fake-supabase";
import { syncSubscriptionFromStripe } from "./subscription-sync";

process.env.STRIPE_PRICE_ESSENTIEL_MONTHLY = "price_essentiel_mensuel";
process.env.STRIPE_PRICE_BUSINESS_MONTHLY = "price_business_mensuel";

function subscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    id: "sub_1",
    status: "active",
    cancel_at_period_end: false,
    pause_collection: null,
    metadata: { organization_id: "org-1" },
    items: {
      data: [
        {
          price: { id: "price_essentiel_mensuel" },
          current_period_end: 1893456000,
        },
      ],
    },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

describe("syncSubscriptionFromStripe", () => {
  let updates: { table: string; patch: Record<string, unknown> }[];
  let supabase: ReturnType<typeof createFakeSupabase>;

  beforeEach(() => {
    updates = [];
    const record = (table: string, patch: Record<string, unknown>) => updates.push({ table, patch });
    supabase = createFakeSupabase({ onUpdate: record, onInsert: record });
  });

  it("ignore un abonnement sans organization_id dans les métadonnées", async () => {
    await syncSubscriptionFromStripe(supabase as never, subscription({ metadata: {} }));
    expect(updates).toHaveLength(0);
  });

  it("un abonnement actif fait passer l'organisation sur la formule correspondant au prix", async () => {
    await syncSubscriptionFromStripe(supabase as never, subscription());

    const orgUpdate = updates.find((u) => u.table === "organizations");
    expect(orgUpdate?.patch).toMatchObject({ plan: "essentiel", trial_ends_at: null });
  });

  it("un abonnement en pause (pause_collection) ne rétrograde pas la formule", async () => {
    await syncSubscriptionFromStripe(
      supabase as never,
      subscription({ pause_collection: { behavior: "void", resumes_at: 1893456000 } as never }),
    );

    const orgUpdate = updates.find((u) => u.table === "organizations");
    expect(orgUpdate?.patch).toMatchObject({ plan: "essentiel" });
    const subUpdate = updates.find((u) => u.table === "subscriptions");
    expect(subUpdate?.patch).toMatchObject({ status: "en_pause" });
  });

  it("un abonnement annulé repasse l'organisation en Gratuit", async () => {
    await syncSubscriptionFromStripe(supabase as never, subscription({ status: "canceled" }));

    const orgUpdate = updates.find((u) => u.table === "organizations");
    expect(orgUpdate?.patch).toEqual({ plan: "gratuit" });
  });

  it("un abonnement impayé (past_due) garde la formule le temps de la relance Stripe", async () => {
    await syncSubscriptionFromStripe(supabase as never, subscription({ status: "past_due" }));

    const orgUpdate = updates.find((u) => u.table === "organizations");
    expect(orgUpdate).toBeUndefined(); // ni upgrade ni downgrade

    const subUpdate = updates.find((u) => u.table === "subscriptions");
    expect(subUpdate?.patch).toMatchObject({ status: "impayé" });
  });

  it("un prix inconnu (non mappé) ne modifie pas la formule de l'organisation", async () => {
    await syncSubscriptionFromStripe(
      supabase as never,
      subscription({
        items: { data: [{ price: { id: "price_inconnu" }, current_period_end: 1893456000 }] } as never,
      }),
    );

    expect(updates.find((u) => u.table === "organizations")).toBeUndefined();
  });
});
