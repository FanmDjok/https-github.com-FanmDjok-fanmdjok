"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { getPositioning } from "@/lib/positioning";
import { generateStructured } from "@/lib/ai/generate";
import { ScriptSchema } from "@/lib/ai/schemas";
import { BRAND_VOICE, formatPositioning } from "@/lib/ai/prompts";
import { consumeUsage } from "@/lib/usage";

export type CreateScriptState = { error?: string } | undefined;

export async function createScript(
  _prev: CreateScriptState,
  formData: FormData,
): Promise<CreateScriptState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { orgs, currentId } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  if (!currentId || !org) return { error: "Aucune marque sélectionnée." };

  const topic = String(formData.get("topic") ?? "").trim();
  const objective = String(formData.get("objective") ?? "Attirer") as
    | "Attirer"
    | "Rassurer"
    | "Convertir";
  const duration = Number(formData.get("duration") ?? 30) as 30 | 60 | 90;

  if (!topic) return { error: "Le sujet du script est requis." };

  const { allowed } = await consumeUsage(supabase, currentId, org.plan, "scripts_generated");
  if (!allowed) {
    return {
      error:
        "Vous avez atteint votre limite de scripts ce mois-ci. Passez à la formule Essentiel pour un nombre illimité.",
    };
  }

  const positioning = await getPositioning(supabase, currentId);

  let generated;
  try {
    generated = await generateStructured({
      schema: ScriptSchema,
      system: BRAND_VOICE,
      prompt: `${formatPositioning(positioning)}

Écris un script vidéo de ${duration} secondes sur le sujet suivant :
« ${topic} » (objectif : ${objective}). Structure : accroche (3 premières
secondes), développement, appel à l'action qui renvoie vers la page de
l'utilisateur.`,
    });
  } catch {
    return { error: "La génération du script a échoué. Merci de réessayer." };
  }

  const { data, error } = await supabase
    .from("scripts")
    .insert({
      organization_id: currentId,
      title: generated.title || topic,
      objective,
      duration,
      hook: generated.hook,
      body: generated.body,
      cta: generated.cta,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Impossible d'enregistrer le script généré." };

  redirect(`/attirer/scripts/${data.id}`);
}
