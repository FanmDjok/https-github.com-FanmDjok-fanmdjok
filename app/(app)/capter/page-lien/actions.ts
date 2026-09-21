"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { generateLinkCode } from "@/lib/tracked-links";
import type { LinkButton } from "@/lib/supabase/types";

export type SavePageLienState = { error?: string; success?: boolean } | undefined;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function savePageLien(
  _prev: SavePageLienState,
  formData: FormData,
): Promise<SavePageLienState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  if (!currentId) return { error: "Aucune marque sélectionnée." };

  const slug = slugify(String(formData.get("slug") ?? ""));
  const displayName = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const brandColor = String(formData.get("brand_color") ?? "#0E8A5F");

  if (!slug) return { error: "L'adresse de votre page est requise." };

  let rawButtons: Array<{ id: string; label: string; url: string; code?: string }>;
  try {
    rawButtons = JSON.parse(String(formData.get("buttons") ?? "[]"));
  } catch {
    return { error: "Les boutons de la page sont invalides." };
  }

  // Chaque bouton devient un lien suivi : on crée ou met à jour son code.
  const buttons: LinkButton[] = [];
  for (const button of rawButtons) {
    const label = button.label.trim();
    const url = button.url.trim();
    if (!label || !url) continue;

    const code = button.code || generateLinkCode();
    const { error: linkError } = await supabase.from("tracked_links").upsert(
      {
        organization_id: currentId,
        code,
        label,
        target_url: url,
      },
      { onConflict: "code" },
    );
    if (linkError) return { error: "Impossible d'enregistrer un des boutons." };

    buttons.push({ id: button.id, label, url, code });
  }

  const { error } = await supabase.from("link_pages").upsert({
    organization_id: currentId,
    slug,
    display_name: displayName,
    bio,
    brand_color: brandColor,
    buttons,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Cette adresse de page est déjà utilisée. Choisissez-en une autre." };
    }
    return { error: "Impossible d'enregistrer votre page. Merci de réessayer." };
  }

  revalidatePath("/capter/page-lien");
  revalidatePath(`/${slug}`);
  return { success: true };
}
