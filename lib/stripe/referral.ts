import "server-only";
import type Stripe from "stripe";
import { REFERRAL_COUPON_ID } from "@/lib/stripe/plans";

// Coupon idempotent (1 mois offert) : créé au premier parrainage, réutilisé
// ensuite. On tente d'abord de le récupérer pour éviter un appel de création
// inutile à chaque parrainage.
export async function ensureReferralCoupon(stripe: Stripe): Promise<void> {
  try {
    await stripe.coupons.retrieve(REFERRAL_COUPON_ID);
  } catch {
    await stripe.coupons.create({
      id: REFERRAL_COUPON_ID,
      name: "Parrainage Growthis — 1 mois offert",
      percent_off: 100,
      duration: "once",
    });
  }
}
