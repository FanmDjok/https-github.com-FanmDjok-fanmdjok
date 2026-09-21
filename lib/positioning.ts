import type { createClient } from "@/lib/supabase/server";
import type { PositioningContext } from "@/lib/ai/prompts";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

export async function getPositioning(
  supabase: SupabaseServer,
  organizationId: string,
): Promise<PositioningContext | null> {
  const { data } = await supabase
    .from("positioning")
    .select("ideal_client, problem, promise, offer")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!data || (!data.ideal_client && !data.problem && !data.promise && !data.offer)) {
    return null;
  }

  return {
    idealClient: data.ideal_client,
    problem: data.problem,
    promise: data.promise,
    offer: data.offer,
  };
}
