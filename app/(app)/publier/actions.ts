"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";

export async function retryTarget(targetId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const scheduledAt = new Date().toISOString();

  const { error } = await supabase
    .from("post_targets")
    .update({ status: "en_attente", attempts: 0, error: null, scheduled_at: scheduledAt })
    .eq("id", targetId);

  if (error) return { error: "Impossible de relancer cette publication." };

  await inngest.send({ name: "post/target.publish", data: { postTargetId: targetId, scheduledAt } });

  revalidatePath("/publier");
  return {};
}

export async function confirmManualPublish(targetId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { error } = await supabase
    .from("post_targets")
    .update({ status: "publié", error: null })
    .eq("id", targetId);

  if (error) return { error: "Impossible de confirmer cette publication." };

  revalidatePath("/publier");
  return {};
}
