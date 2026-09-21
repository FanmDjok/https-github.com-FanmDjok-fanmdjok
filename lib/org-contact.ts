import "server-only";
import type { createServiceClient } from "@/lib/supabase/service";

type ServiceClient = ReturnType<typeof createServiceClient>;

// Email de contact de l'organisation (son propriétaire), pour les alertes
// d'échec de publication et les rappels du mode sans API.
export async function getOrgOwnerEmail(
  supabase: ServiceClient,
  organizationId: string,
): Promise<string | null> {
  const { data: member } = await supabase
    .from("members")
    .select("user_id")
    .eq("organization_id", organizationId)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();

  if (!member) return null;

  const { data } = await supabase.auth.admin.getUserById(member.user_id);
  return data.user?.email ?? null;
}
