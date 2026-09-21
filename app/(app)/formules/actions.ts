"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { getStripe } from "@/lib/stripe/client";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { getPriceId, REFERRAL_COUPON_ID, type BillingInterval, type PaidPlan } from "@/lib/stripe/plans";
import { ensureReferralCoupon } from "@/lib/stripe/referral";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." } as const;

  const { currentId, orgs } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  if (!currentId || !org) return { error: "Aucune organisation active." } as const;
  if (org.role !== "owner") {
    return { error: "Seul le propriétaire de l'organisation peut gérer l'abonnement." } as const;
  }

  return { supabase, user, currentId } as const;
}

export async function checkoutPlan(plan: PaidPlan, interval: BillingInterval, referralCode: string) {
  const context = await requireOwner();
  if ("error" in context) return context;
  const { supabase, user, currentId } = context;

  const { data: fullOrg } = await supabase
    .from("organizations")
    .select("id, name, stripe_customer_id, referral_code")
    .eq("id", currentId)
    .single();
  if (!fullOrg) return { error: "Organisation introuvable." };

  const stripe = getStripe();
  const customerId = await getOrCreateStripeCustomer(supabase, fullOrg, user.email ?? "");

  const normalizedCode = referralCode.trim().toUpperCase();
  let discounts: { coupon: string }[] | undefined;
  if (normalizedCode && normalizedCode !== fullOrg.referral_code) {
    const { data: referrer } = await supabase
      .from("organizations")
      .select("id")
      .eq("referral_code", normalizedCode)
      .maybeSingle();

    if (referrer && referrer.id !== currentId) {
      const { data: existingRedemption } = await supabase
        .from("referral_redemptions")
        .select("id")
        .eq("referred_organization_id", currentId)
        .maybeSingle();

      if (!existingRedemption) {
        await supabase.from("referral_redemptions").insert({
          code: normalizedCode,
          referrer_organization_id: referrer.id,
          referred_organization_id: currentId,
        });
        await ensureReferralCoupon(stripe);
        discounts = [{ coupon: REFERRAL_COUPON_ID }];
      }
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: getPriceId(plan, interval), quantity: 1 }],
    discounts,
    success_url: `${APP_URL}/formules?checkout=succes`,
    cancel_url: `${APP_URL}/formules?checkout=annule`,
    client_reference_id: currentId,
    subscription_data: { metadata: { organization_id: currentId } },
  });

  if (!session.url) return { error: "Impossible de créer la session de paiement." };
  redirect(session.url);
}

export async function openBillingPortal() {
  const context = await requireOwner();
  if ("error" in context) return context;
  const { supabase, currentId } = context;

  const { data: fullOrg } = await supabase
    .from("organizations")
    .select("stripe_customer_id")
    .eq("id", currentId)
    .single();
  if (!fullOrg?.stripe_customer_id) {
    return { error: "Aucun abonnement Stripe pour cette organisation." };
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: fullOrg.stripe_customer_id,
    return_url: `${APP_URL}/formules`,
  });
  redirect(session.url);
}

export async function pauseSubscription(months: number) {
  if (!Number.isInteger(months) || months < 1 || months > 3) {
    return { error: "La pause doit durer entre 1 et 3 mois." };
  }

  const context = await requireOwner();
  if ("error" in context) return context;
  const { supabase, currentId } = context;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id, status")
    .eq("organization_id", currentId)
    .single();

  if (!subscription?.stripe_subscription_id || subscription.status !== "actif") {
    return { error: "Seul un abonnement actif peut être mis en pause." };
  }

  const resumesAt = Math.floor(Date.now() / 1000) + months * 30 * 24 * 60 * 60;
  const stripe = getStripe();
  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    pause_collection: { behavior: "void", resumes_at: resumesAt },
  });

  await supabase
    .from("subscriptions")
    .update({
      status: "en_pause",
      paused_until: new Date(resumesAt * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", currentId);

  return { success: true };
}

export async function resumeSubscription() {
  const context = await requireOwner();
  if ("error" in context) return context;
  const { supabase, currentId } = context;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id, status")
    .eq("organization_id", currentId)
    .single();

  if (!subscription?.stripe_subscription_id || subscription.status !== "en_pause") {
    return { error: "Aucune pause en cours pour cet abonnement." };
  }

  const stripe = getStripe();
  await stripe.subscriptions.update(subscription.stripe_subscription_id, { pause_collection: "" });

  await supabase
    .from("subscriptions")
    .update({ status: "actif", paused_until: null, updated_at: new Date().toISOString() })
    .eq("organization_id", currentId);

  return { success: true };
}
