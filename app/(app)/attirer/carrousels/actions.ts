"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { getPositioning } from "@/lib/positioning";
import { generateStructured } from "@/lib/ai/generate";
import { CarouselSchema } from "@/lib/ai/schemas";
import { BRAND_VOICE, formatPositioning } from "@/lib/ai/prompts";

export type CreateCarouselState = { error?: string } | undefined;

export async function createCarousel(
  _prev: CreateCarouselState,
  formData: FormData,
): Promise<CreateCarouselState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  if (!currentId) return { error: "Aucune marque sélectionnée." };

  const topic = String(formData.get("topic") ?? "").trim();
  if (!topic) return { error: "Le sujet du carrousel est requis." };

  const positioning = await getPositioning(supabase, currentId);

  let generated;
  try {
    generated = await generateStructured({
      schema: CarouselSchema,
      system: BRAND_VOICE,
      prompt: `${formatPositioning(positioning)}

Écris le texte d'un carrousel de 8 visuels sur le sujet suivant :
« ${topic} ». La première diapositive accroche, les suivantes développent un
point chacune, la dernière renvoie vers la page de l'utilisateur. Écris
aussi une légende courte à publier avec le carrousel.`,
    });
  } catch {
    return { error: "La génération du carrousel a échoué. Merci de réessayer." };
  }

  const { data, error } = await supabase
    .from("carousels")
    .insert({
      organization_id: currentId,
      title: generated.title || topic,
      caption: generated.caption,
      slides: generated.slides,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Impossible d'enregistrer le carrousel généré." };

  redirect(`/attirer/carrousels/${data.id}`);
}
