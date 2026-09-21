import type { Plan } from "@/lib/limits";

export type PaidPlan = Extract<Plan, "essentiel" | "business">;
export type BillingInterval = "monthly" | "yearly";

const PRICE_ENV_KEYS: Record<PaidPlan, Record<BillingInterval, string>> = {
  essentiel: {
    monthly: "STRIPE_PRICE_ESSENTIEL_MONTHLY",
    yearly: "STRIPE_PRICE_ESSENTIEL_YEARLY",
  },
  business: {
    monthly: "STRIPE_PRICE_BUSINESS_MONTHLY",
    yearly: "STRIPE_PRICE_BUSINESS_YEARLY",
  },
};

export function getPriceId(plan: PaidPlan, interval: BillingInterval): string {
  const key = PRICE_ENV_KEYS[plan][interval];
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable d'environnement ${key} manquante.`);
  }
  return value;
}

// Retrouve la formule (et l'intervalle) correspondant à un price ID Stripe,
// pour synchroniser organizations.plan depuis les webhooks.
export function planFromPriceId(priceId: string): { plan: PaidPlan; interval: BillingInterval } | null {
  for (const plan of Object.keys(PRICE_ENV_KEYS) as PaidPlan[]) {
    for (const interval of Object.keys(PRICE_ENV_KEYS[plan]) as BillingInterval[]) {
      if (process.env[PRICE_ENV_KEYS[plan][interval]] === priceId) {
        return { plan, interval };
      }
    }
  }
  return null;
}

// Identifiant stable du coupon de parrainage (1 mois offert), créé à la
// volée s'il n'existe pas encore sur le compte Stripe connecté.
export const REFERRAL_COUPON_ID = "growthis-parrainage-1-mois";
