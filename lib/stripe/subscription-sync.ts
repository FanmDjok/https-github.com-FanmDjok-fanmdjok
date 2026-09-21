import "server-only";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { planFromPriceId } from "@/lib/stripe/plans";

type SubscriptionStatus = Database["public"]["Tables"]["subscriptions"]["Row"]["status"];

function mapStatus(subscription: Stripe.Subscription): SubscriptionStatus {
  // pause_collection laisse subscription.status à "active" côté Stripe : on
  // distingue nous-mêmes l'état "en pause" pour l'affichage.
  if (subscription.pause_collection) return "en_pause";
  switch (subscription.status) {
    case "trialing":
      return "essai";
    case "active":
      return "actif";
    case "past_due":
    case "unpaid":
      return "impayé";
    case "canceled":
    case "incomplete_expired":
      return "annulé";
    default:
      return "aucun";
  }
}

// Point d'entrée unique pour refléter l'état d'un abonnement Stripe dans
// notre base : appelé par le webhook à chaque événement customer.subscription.*
// et checkout.session.completed. organizations.plan reste la source de
// vérité lue partout ailleurs dans l'app (limites, affichage) — cette
// fonction la met à jour en cohérence avec subscriptions.status.
export async function syncSubscriptionFromStripe(
  supabase: SupabaseClient<Database>,
  subscription: Stripe.Subscription,
) {
  const organizationId = subscription.metadata?.organization_id;
  if (!organizationId) return;

  const priceId = subscription.items.data[0]?.price.id;
  const resolved = priceId ? planFromPriceId(priceId) : null;
  const status = mapStatus(subscription);
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  await supabase.from("subscriptions").upsert({
    organization_id: organizationId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId ?? null,
    status,
    current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    paused_until: subscription.pause_collection?.resumes_at
      ? new Date(subscription.pause_collection.resumes_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  });

  // La formule effective de l'organisation ne change que sur un signal fort :
  // un abonnement actif/en essai/en pause fait foi de la formule souscrite,
  // une annulation repasse en Gratuit. "impayé" garde la formule le temps de
  // la relance automatique Stripe plutôt que de couper l'accès immédiatement.
  if (resolved && (status === "actif" || status === "essai" || status === "en_pause")) {
    await supabase
      .from("organizations")
      .update({ plan: resolved.plan, trial_ends_at: null })
      .eq("id", organizationId);
  } else if (status === "annulé") {
    await supabase.from("organizations").update({ plan: "gratuit" }).eq("id", organizationId);
  }
}
