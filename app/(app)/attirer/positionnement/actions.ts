"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";

export type SavePositioningState = { error?: string; success?: boolean } | undefined;

export async function savePositioning(
  _prev: SavePositioningState,
  formData: FormData,
): Promise<SavePositioningState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  if (!currentId) return { error: "Aucune marque sélectionnée." };

  const { error } = await supabase.from("positioning").upsert({
    organization_id: currentId,
    ideal_client: String(formData.get("ideal_client") ?? "").trim(),
    problem: String(formData.get("problem") ?? "").trim(),
    promise: String(formData.get("promise") ?? "").trim(),
    offer: String(formData.get("offer") ?? "").trim(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: "Impossible d'enregistrer votre positionnement. Merci de réessayer." };
  }

  revalidatePath("/attirer/positionnement");
  revalidatePath("/attirer");
  revalidatePath("/");
  return { success: true };
}
