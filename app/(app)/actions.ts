"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ORG_COOKIE } from "@/lib/organizations";

export async function switchOrganization(formData: FormData) {
  const orgId = String(formData.get("orgId") ?? "");
  if (!orgId) return;
  const cookieStore = await cookies();
  cookieStore.set(ORG_COOKIE, orgId, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect("/");
}
