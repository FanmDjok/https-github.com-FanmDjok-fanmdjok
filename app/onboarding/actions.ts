"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ORG_COOKIE } from "@/lib/organizations";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createOrganization(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Le nom de votre marque est requis." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const baseSlug = slugify(name) || "atelier";
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name, slug, created_by: user!.id })
    .select("id")
    .single();

  if (orgError || !org) {
    return { error: "Impossible de créer votre espace. Merci de réessayer." };
  }

  const { error: memberError } = await supabase
    .from("members")
    .insert({ organization_id: org.id, user_id: user!.id, role: "owner" });

  if (memberError) {
    return { error: "Impossible de vous rattacher à cet espace. Merci de réessayer." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ORG_COOKIE, org.id, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  redirect("/");
}
