import "server-only";
import type { createServiceClient } from "@/lib/supabase/service";

type ServiceClient = ReturnType<typeof createServiceClient>;

export async function createNotification(
  supabase: ServiceClient,
  organizationId: string,
  type: string,
  message: string,
  link?: string,
) {
  await supabase.from("notifications").insert({
    organization_id: organizationId,
    type,
    message,
    link: link ?? null,
  });
}
