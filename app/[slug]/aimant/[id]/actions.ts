"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { sendLeadMagnetEmail } from "@/lib/email/resend";

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 jours

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

  const { error: insertError } = await supabase.from("leads").insert({
    organization_id: magnet.organization_id,
    name,
    email,
    consent: true,
    source: magnet.title,
    lead_magnet_id: magnet.id,
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
