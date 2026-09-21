"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { getPositioning } from "@/lib/positioning";
import { generateStructured } from "@/lib/ai/generate";
import { ReactivationMessageSchema } from "@/lib/ai/schemas";
import { BRAND_VOICE, formatPositioning } from "@/lib/ai/prompts";

export async function updateLeadStatus(
  leadId: string,
  status: "Nouveau" | "Contacté" | "Client",
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
  if (error) return { error: "Impossible de mettre à jour ce prospect." };

  revalidatePath("/capter/prospects");
  return {};
}

export async function generateReactivationMessage(
  leadId: string,
): Promise<{ message?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  if (!currentId) return { error: "Aucune marque sélectionnée." };

  const { data: lead } = await supabase
    .from("leads")
    .select("name, source, status, network")
    .eq("id", leadId)
    .maybeSingle();

  if (!lead) return { error: "Ce prospect est introuvable." };

  const positioning = await getPositioning(supabase, currentId);

  try {
    const result = await generateStructured({
      schema: ReactivationMessageSchema,
      system: BRAND_VOICE,
      prompt: `${formatPositioning(positioning)}

Rédige un message court de relance pour ${lead.name}, un prospect au statut
« ${lead.status} », venu via « ${lead.source} »${lead.network ? ` sur ${lead.network}` : ""}.
Le message doit être prêt à envoyer (email ou DM), chaleureux mais direct,
sans donner l'impression d'insister, avec une seule question ou proposition
claire à la fin.`,
    });
    return { message: result.message };
  } catch {
    return { error: "La génération du message a échoué. Merci de réessayer." };
  }
}
