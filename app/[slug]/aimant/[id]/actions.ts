"use server";

import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import { sendLeadMagnetEmail } from "@/lib/email/resend";

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 jours
const ATTRIBUTION_COOKIE = "gr_attr";

export async function submitLeadCapture(
  magnetId: string,
  formData: FormData,
): Promise<{ success?: boolean; downloadUrl?: string; error?: string }> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const consent = formData.get("consent") === "on";

  if (!name || !email) {
    return { error: "Merci de renseigner votre prénom et votre email." };
  }
  if (!consent) {
    return { error: "Le consentement est requis pour recevoir le document." };
  }

  const supabase = createServiceClient();

  const { data: magnetRows } = await supabase.rpc("get_public_lead_magnet", { p_id: magnetId });
  const magnet = magnetRows?.[0];
  if (!magnet) return { error: "Cet aimant n'est plus disponible." };

  // Attribution : si ce visiteur est arrivé via un lien suivi (bouton de la
  // page lien en bio généré pour une publication), on le rattache.
  const cookieStore = await cookies();
  const attributionCode = cookieStore.get(ATTRIBUTION_COOKIE)?.value;
  let trackedLinkId: string | null = null;
  let network: string | null = null;
  if (attributionCode) {
    const { data: link } = await supabase
      .from("tracked_links")
      .select("id, post_targets(network)")
      .eq("code", attributionCode)
      .eq("organization_id", magnet.organization_id)
      .maybeSingle();
    if (link) {
      trackedLinkId = link.id;
      network = (link.post_targets as unknown as { network: string } | null)?.network ?? null;
    }
  }

  const { error: insertError } = await supabase.from("leads").insert({
    organization_id: magnet.organization_id,
    name,
    email,
    consent: true,
    source: magnet.title,
    network,
    lead_magnet_id: magnet.id,
    tracked_link_id: trackedLinkId,
  });
  if (insertError) {
    return { error: "Impossible d'enregistrer votre demande. Merci de réessayer." };
  }

  const { data: magnetRow } = await supabase
    .from("lead_magnets")
    .select("storage_path")
    .eq("id", magnetId)
    .maybeSingle();

  if (!magnetRow?.storage_path) {
    return { error: "Le document n'est pas encore disponible. Merci de réessayer plus tard." };
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("lead-magnets")
    .createSignedUrl(magnetRow.storage_path, SIGNED_URL_TTL_SECONDS);

  if (signError || !signed) {
    return { error: "Impossible de générer le lien de téléchargement." };
  }

  try {
    await sendLeadMagnetEmail({
      to: email,
      firstName: name,
      orgName: magnet.org_name,
      magnetTitle: magnet.title,
      downloadUrl: signed.signedUrl,
    });
  } catch {
    // L'email a pu échouer : le prospect est déjà enregistré et reçoit le
    // lien de téléchargement immédiat ci-dessous.
  }

  return { success: true, downloadUrl: signed.signedUrl };
}
