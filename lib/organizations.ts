import { cookies } from "next/headers";
import type { createClient } from "@/lib/supabase/server";

export const ORG_COOKIE = "growthis-org";

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  plan: "gratuit" | "essentiel" | "business";
  brand_color: string | null;
  role: "owner" | "collaborateur";
};

export async function getUserOrganizations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<OrganizationSummary[]> {
  const { data, error } = await supabase
    .from("members")
    .select("role, organizations(id, name, slug, plan, brand_color)")
    .eq("user_id", userId);

  if (error || !data) return [];

  return data
    .filter((row) => row.organizations)
    .map((row) => {
      const org = row.organizations as unknown as {
        id: string;
        name: string;
        slug: string;
        plan: "gratuit" | "essentiel" | "business";
        brand_color: string | null;
      };
      return { ...org, role: row.role as "owner" | "collaborateur" };
    });
}

export async function getCurrentOrganizationId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(ORG_COOKIE)?.value;
  const orgs = await getUserOrganizations(supabase, userId);

  if (fromCookie && orgs.some((o) => o.id === fromCookie)) {
    return { orgs, currentId: fromCookie };
  }

  return { orgs, currentId: orgs[0]?.id ?? null };
}
