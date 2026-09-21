"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId, ORG_COOKIE } from "@/lib/organizations";
import { getStripe } from "@/lib/stripe/client";

async function emptyBucketPrefix(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: string,
  prefix: string,
) {
  const { data: files } = await supabase.storage.from(bucket).list(prefix);
  if (!files || files.length === 0) return;
  await supabase.storage.from(bucket).remove(files.map((f) => `${prefix}/${f.name}`));
}

// Supprime définitivement une organisation et toutes ses données (RGPD,
// droit à l'effacement). Les tables liées ont toutes organization_id en
// "on delete cascade" : supprimer la ligne organizations suffit côté base ;
// seuls les fichiers de Storage doivent être nettoyés explicitement.
export async function deleteOrganization(confirmationSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { currentId, orgs } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  if (!currentId || !org) return { error: "Aucune organisation active." };
  if (org.role !== "owner") {
    return { error: "Seul le propriétaire de l'organisation peut la supprimer." };
  }
  if (confirmationSlug.trim() !== org.slug) {
    return { error: "Le texte de confirmation ne correspond pas." };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("organization_id", currentId)
    .maybeSingle();

  if (subscription?.stripe_subscription_id) {
    try {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    } catch {
      // Un abonnement déjà résilié ou une clé Stripe absente ne doit pas
      // empêcher la suppression des données de l'organisation.
    }
  }

  await emptyBucketPrefix(supabase, "media", currentId);
  await emptyBucketPrefix(supabase, "lead-magnets", currentId);

  const { error: deleteError } = await supabase.from("organizations").delete().eq("id", currentId);
  if (deleteError) return { error: "La suppression a échoué. Merci de réessayer." };

  const cookieStore = await cookies();
  cookieStore.delete(ORG_COOKIE);

  const remaining = orgs.filter((o) => o.id !== currentId);
  redirect(remaining[0] ? "/" : "/onboarding");
}
