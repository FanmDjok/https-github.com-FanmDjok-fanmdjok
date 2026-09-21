"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { getPositioning } from "@/lib/positioning";
import { generateStructured } from "@/lib/ai/generate";
import { LeadMagnetPlanSchema, type LeadMagnetPlan } from "@/lib/ai/schemas";
import { BRAND_VOICE, formatPositioning } from "@/lib/ai/prompts";
import { renderLeadMagnetPdf } from "@/lib/pdf/lead-magnet";

export async function generateLeadMagnetPlan(
  topic: string,
  type: "Checklist" | "Guide PDF" | "Mini-formation",
): Promise<{ plan?: LeadMagnetPlan; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  if (!currentId) return { error: "Aucune marque sélectionnée." };

  const positioning = await getPositioning(supabase, currentId);

  try {
    const plan = await generateStructured({
      schema: LeadMagnetPlanSchema,
      system: BRAND_VOICE,
      prompt: `${formatPositioning(positioning)}

Propose le plan d'un aimant à prospects de type « ${type} » sur le sujet :
« ${topic} ». Un titre accrocheur et concret, puis entre 4 et 8 sections
(titre + contenu de quelques phrases chacune) qui apportent une vraie valeur
et donnent envie de travailler avec l'utilisateur ensuite.`,
    });
    return { plan };
  } catch {
    return { error: "La génération du plan a échoué. Merci de réessayer." };
  }
}

export async function publishLeadMagnet(
  title: string,
  type: "Checklist" | "Guide PDF" | "Mini-formation",
  sections: { title: string; body: string }[],
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { orgs, currentId } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  if (!currentId || !org) return { error: "Aucune marque sélectionnée." };

  if (!title.trim() || sections.length === 0) {
    return { error: "Le titre et au moins une section sont requis." };
  }

  const { data: created, error: insertError } = await supabase
    .from("lead_magnets")
    .insert({
      organization_id: currentId,
      title,
      type,
      outline: sections,
      status: "brouillon",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError || !created) return { error: "Impossible d'enregistrer l'aimant." };

  try {
    const pdfBuffer = await renderLeadMagnetPdf({
      title,
      sections,
      orgName: org.name,
      brandColor: org.brand_color ?? "#0E8A5F",
    });

    const path = `${currentId}/${created.id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("lead-magnets")
      .upload(path, pdfBuffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) throw uploadError;

    const { error: updateError } = await supabase
      .from("lead_magnets")
      .update({ status: "publié", storage_path: path })
      .eq("id", created.id);

    if (updateError) throw updateError;
  } catch {
    return { error: "Le PDF n'a pas pu être généré. L'aimant reste en brouillon." };
  }

  revalidatePath("/capter/aimants");
  return { id: created.id };
}
