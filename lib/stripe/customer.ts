import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getStripe } from "@/lib/stripe/client";

// Retrouve le client Stripe de l'organisation, ou le crée s'il n'existe pas
// encore. Persisté immédiatement pour éviter de créer un doublon si
// l'utilisateur relance un paiement après une première tentative abandonnée.
export async function getOrCreateStripeCustomer(
  supabase: SupabaseClient<Database>,
  organization: { id: string; name: string; stripe_customer_id: string | null },
  email: string,
): Promise<string> {
  if (organization.stripe_customer_id) {
    return organization.stripe_customer_id;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    name: organization.name,
    email,
    metadata: { organization_id: organization.id },
  });

  await supabase
    .from("organizations")
    .update({ stripe_customer_id: customer.id })
    .eq("id", organization.id);

  return customer.id;
}
