import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { REFERRAL_COUPON_ID } from "@/lib/stripe/plans";
import { ensureReferralCoupon } from "@/lib/stripe/referral";
import { syncSubscriptionFromStripe } from "@/lib/stripe/subscription-sync";
import { createServiceClient } from "@/lib/supabase/service";
import { sendPaymentFailedEmail, sendReferralRewardEmail } from "@/lib/email/resend";

// Stripe exige le corps brut (non parsé) pour vérifier la signature.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Configuration webhook manquante." }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await syncSubscriptionFromStripe(supabase, subscription);
        await rewardReferrerIfPending(stripe, supabase, subscription);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscriptionFromStripe(supabase, subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscriptionFromStripe(supabase, subscription);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : invoice.parent?.subscription_details?.subscription?.id;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSubscriptionFromStripe(supabase, subscription);
        const organizationId = subscription.metadata?.organization_id;
        if (organizationId) {
          await notifyPaymentFailed(supabase, organizationId);
        }
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

// Applique la récompense de parrainage (1 mois offert) au parrain dès que le
// filleul a effectivement démarré un abonnement payant.
async function rewardReferrerIfPending(
  stripe: Stripe,
  supabase: ReturnType<typeof createServiceClient>,
  referredSubscription: Stripe.Subscription,
) {
  const referredOrganizationId = referredSubscription.metadata?.organization_id;
  if (!referredOrganizationId) return;

  const { data: redemption } = await supabase
    .from("referral_redemptions")
    .select("id, referrer_organization_id")
    .eq("referred_organization_id", referredOrganizationId)
    .is("rewarded_at", null)
    .maybeSingle();

  if (!redemption) return;

  const { data: referrerSub } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id, status")
    .eq("organization_id", redemption.referrer_organization_id)
    .maybeSingle();

  if (referrerSub?.stripe_subscription_id && referrerSub.status === "actif") {
    await ensureReferralCoupon(stripe);
    await stripe.subscriptions.update(referrerSub.stripe_subscription_id, {
      discounts: [{ coupon: REFERRAL_COUPON_ID }],
    });
  }

  await supabase
    .from("referral_redemptions")
    .update({ rewarded_at: new Date().toISOString() })
    .eq("id", redemption.id);

  const { data: referrerOrg } = await supabase
    .from("organizations")
    .select("name, created_by")
    .eq("id", redemption.referrer_organization_id)
    .maybeSingle();
  if (referrerOrg) {
    const { data: authUser } = await supabase.auth.admin.getUserById(referrerOrg.created_by);
    if (authUser.user?.email) {
      await sendReferralRewardEmail({ to: authUser.user.email, orgName: referrerOrg.name });
    }
  }
}

async function notifyPaymentFailed(supabase: ReturnType<typeof createServiceClient>, organizationId: string) {
  const { data: org } = await supabase
    .from("organizations")
    .select("name, created_by")
    .eq("id", organizationId)
    .maybeSingle();
  if (!org) return;

  await supabase.from("notifications").insert({
    organization_id: organizationId,
    type: "paiement_echec",
    message: "Le paiement de votre abonnement a échoué. Mettez à jour votre moyen de paiement.",
    link: "/formules",
  });

  const { data: authUser } = await supabase.auth.admin.getUserById(org.created_by);
  if (authUser.user?.email) {
    await sendPaymentFailedEmail({ to: authUser.user.email, orgName: org.name });
  }
}
