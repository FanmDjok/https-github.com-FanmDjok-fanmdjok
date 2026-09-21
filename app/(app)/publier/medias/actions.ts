"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";

const MAX_SIZE_BYTES = 200 * 1024 * 1024; // 200 Mo

export async function uploadMedia(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  if (!currentId) return { error: "Aucune marque sélectionnée." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Aucun fichier reçu." };
  if (file.size > MAX_SIZE_BYTES) return { error: "Le fichier dépasse 200 Mo." };

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) return { error: "Format non pris en charge (image ou vidéo uniquement)." };

  const extension = file.name.split(".").pop() || (isImage ? "jpg" : "mp4");
  const path = `${currentId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type });
  if (uploadError) return { error: "Impossible d'importer ce fichier." };

  const { error: insertError } = await supabase.from("media_assets").insert({
    organization_id: currentId,
    storage_path: path,
    type: isImage ? "image" : "vidéo",
    created_by: user.id,
  });
  if (insertError) return { error: "Le fichier a été importé mais son enregistrement a échoué." };

  revalidatePath("/publier/medias");
  return {};
}

export async function deleteMedia(id: string, storagePath: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  await supabase.storage.from("media").remove([storagePath]);
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) return { error: "Impossible de supprimer ce média." };

  revalidatePath("/publier/medias");
  return {};
}
