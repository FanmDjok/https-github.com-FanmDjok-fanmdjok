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

// Limites par comptage (pas de compteur mensuel dédié) : aimants à
// prospects, prospects, comptes sociaux connectés, publications du mois.
// Non-atomiques (pas de verrou) — acceptable pour des actions peu fréquentes
// et sans conséquence grave en cas de dépassement d'une unité en cas de
// double clic concurrent.
export async function countLeadMagnets(supabase: SupabaseServer, organizationId: string) {
  const { count } = await supabase
    .from("lead_magnets")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);
  return count ?? 0;
}

export async function countLeads(supabase: SupabaseServer, organizationId: string) {
  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);
  return count ?? 0;
}

export async function countConnectedSocialAccounts(supabase: SupabaseServer, organizationId: string) {
  const { count } = await supabase
    .from("social_accounts")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "connecté");
  return count ?? 0;
}

export async function countPostsThisMonth(supabase: SupabaseServer, organizationId: string) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("post_targets")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("created_at", monthStart.toISOString());
  return count ?? 0;
}
