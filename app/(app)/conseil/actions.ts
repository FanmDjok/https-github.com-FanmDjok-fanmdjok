"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { getPositioning } from "@/lib/positioning";
import { generateStructuredChat } from "@/lib/ai/generate";
import { CoachReplySchema } from "@/lib/ai/schemas";
import { BRAND_VOICE, formatPositioning } from "@/lib/ai/prompts";
import { consumeUsage } from "@/lib/usage";
import type Anthropic from "@anthropic-ai/sdk";

const HISTORY_LIMIT = 20;

export async function sendCoachMessage(
  content: string,
): Promise<{ reply?: string; error?: string }> {
  const trimmed = content.trim();
  if (!trimmed) return { error: "Écrivez une question avant d'envoyer." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { orgs, currentId } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  if (!currentId || !org) return { error: "Aucune marque sélectionnée." };

  const { allowed } = await consumeUsage(supabase, currentId, org.plan, "coach_questions");
  if (!allowed) {
    return {
      error:
        "Vous avez posé vos 5 questions du mois. Passez à la formule Essentiel pour un conseiller sans limite.",
    };
  }

  const [positioning, { data: history }, { count: scriptsCount }, { count: carouselsCount }] =
    await Promise.all([
      getPositioning(supabase, currentId),
      supabase
        .from("coach_messages")
        .select("role, content")
        .eq("organization_id", currentId)
        .order("created_at", { ascending: true })
        .limit(HISTORY_LIMIT),
      supabase.from("scripts").select("id", { count: "exact", head: true }).eq("organization_id", currentId),
      supabase.from("carousels").select("id", { count: "exact", head: true }).eq("organization_id", currentId),
    ]);

  await supabase.from("coach_messages").insert({
    organization_id: currentId,
    role: "user",
    content: trimmed,
    created_by: user.id,
  });

  const systemText = `${BRAND_VOICE}

${formatPositioning(positioning)}

Contexte disponible sur l'activité de l'utilisateur :
- ${scriptsCount ?? 0} script(s) vidéo créé(s) dans Growthis.
- ${carouselsCount ?? 0} carrousel(s) créé(s) dans Growthis.
Les statistiques détaillées (vues, clics, prospects) ne sont pas encore
disponibles dans cette version : ne les invente pas, dis à l'utilisateur
qu'elles arriveront une fois ses réseaux connectés et synchronisés.`;

  const messages: Anthropic.MessageParam[] = [
    ...(history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: trimmed },
  ];

  try {
    const result = await generateStructuredChat({
      schema: CoachReplySchema,
      system: [{ type: "text", text: systemText, cache_control: { type: "ephemeral" } }],
      messages,
    });

    await supabase.from("coach_messages").insert({
      organization_id: currentId,
      role: "assistant",
      content: result.reply,
    });

    revalidatePath("/conseil");
    return { reply: result.reply };
  } catch {
    return { error: "Le conseiller n'a pas pu répondre. Merci de réessayer." };
  }
}
