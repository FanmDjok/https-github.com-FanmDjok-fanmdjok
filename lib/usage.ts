import type { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, type Plan } from "@/lib/limits";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

export type UsageMetric = "scripts_generated" | "coach_questions";

const LIMIT_KEY: Record<UsageMetric, keyof (typeof PLAN_LIMITS)["gratuit"]> = {
  scripts_generated: "scriptsPerMonth",
  coach_questions: "coachQuestionsPerMonth",
};

// Vérifie et consomme un usage mensuel. Retourne { allowed: false } sans
// rien consommer si la limite de la formule est atteinte.
export async function consumeUsage(
  supabase: SupabaseServer,
  organizationId: string,
  plan: Plan,
  metric: UsageMetric,
): Promise<{ allowed: boolean }> {
  const limit = PLAN_LIMITS[plan][LIMIT_KEY[metric]];

  const { data, error } = await supabase.rpc("try_increment_usage", {
    p_organization_id: organizationId,
    p_metric: metric,
    p_limit: limit,
  });

  if (error) throw error;
  return { allowed: Boolean(data) };
}

export async function getUsage(
  supabase: SupabaseServer,
  organizationId: string,
  metric: UsageMetric,
): Promise<number> {
  const { data, error } = await supabase.rpc("current_usage", {
    p_organization_id: organizationId,
    p_metric: metric,
  });
  if (error) throw error;
  return data ?? 0;
}
