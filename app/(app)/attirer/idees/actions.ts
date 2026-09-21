"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { getPositioning } from "@/lib/positioning";
import { generateStructured } from "@/lib/ai/generate";
import { IdeasSchema, ScriptSchema, type Ideas } from "@/lib/ai/schemas";
import { BRAND_VOICE, formatPositioning } from "@/lib/ai/prompts";
import { consumeUsage } from "@/lib/usage";

export async function generateIdeas(): Promise<{ ideas?: Ideas["ideas"]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  if (!currentId) return { error: "Aucune marque sélectionnée." };

  const positioning = await getPositioning(supabase, currentId);

  try {
    const result = await generateStructured({
      schema: IdeasSchema,
      system: BRAND_VOICE,
      prompt: `${formatPositioning(positioning)}

Propose exactement 5 idées de contenu pour cette semaine, réparties entre les
objectifs Attirer, Rassurer et Convertir (au moins une de chaque quand c'est
pertinent). Pour chaque idée : un objectif, un titre concret et accrocheur
(pas générique), et un format (Reel, Carrousel, Story ou Post).`,
    });
    return { ideas: result.ideas };
  } catch {
    return { error: "La génération des idées a échoué. Merci de réessayer." };
  }
}

export async function createScriptFromIdea(
  title: string,
  objective: "Attirer" | "Rassurer" | "Convertir",
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { orgs, currentId } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  if (!currentId || !org) return { error: "Aucune marque sélectionnée." };

  const { allowed } = await consumeUsage(supabase, currentId, org.plan, "scripts_generated");
  if (!allowed) {
    return {
      error:
        "Vous avez atteint votre limite de scripts ce mois-ci. Passez à la formule Essentiel pour un nombre illimité.",
    };
  }

  const positioning = await getPositioning(supabase, currentId);

  try {
    const script = await generateStructured({
      schema: ScriptSchema,
      system: BRAND_VOICE,
      prompt: `${formatPositioning(positioning)}

Écris un script vidéo de 30 secondes à partir de cette idée : « ${title} »
(objectif : ${objective}). Structure : accroche (3 premières secondes),
développement, appel à l'action qui renvoie vers la page de l'utilisateur.`,
    });

    const { data, error } = await supabase
      .from("scripts")
      .insert({
        organization_id: currentId,
        title: script.title || title,
        objective,
        duration: 30,
        hook: script.hook,
        body: script.body,
        cta: script.cta,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error || !data) return { error: "Impossible d'enregistrer le script généré." };
    return { id: data.id };
  } catch {
    return { error: "La génération du script a échoué. Merci de réessayer." };
  }
}
