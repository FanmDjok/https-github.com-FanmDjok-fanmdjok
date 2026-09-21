import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

// Instancié paresseusement : permet au reste de l'application de fonctionner
// (build, autres routes) même si STRIPE_SECRET_KEY n'est pas encore renseignée.
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY n'est pas configurée.");
  }
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return cached;
}
