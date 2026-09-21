"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function disconnectAccount(accountId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { error } = await supabase.from("social_accounts").delete().eq("id", accountId);
  if (error) return { error: "Impossible de déconnecter ce compte." };

  revalidatePath("/publier/comptes");
  return {};
}
