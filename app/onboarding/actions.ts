"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ORG_COOKIE, getUserOrganizations } from "@/lib/organizations";
import { sendWelcomeEmail } from "@/lib/email/resend";
import { PLAN_LIMITS } from "@/lib/limits";

const TRIAL_DURATION_DAYS = 14;

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

  // La première organisation d'un utilisateur démarre avec 14 jours d'essai
  // Business, sans carte bancaire. Une marque supplémentaire (multi-marques,
  // fonctionnalité Business) est couverte par un abonnement Business déjà
  // actif sur une autre de ses organisations — pas de nouvel essai séparé.
  const ownedOrgs = (await getUserOrganizations(supabase, user!.id)).filter((o) => o.role === "owner");
  const isFirstOrganization = ownedOrgs.length === 0;

  if (!isFirstOrganization) {
    const hasActiveBusinessOrg = ownedOrgs.some((o) => o.plan === "business");
    const limit = PLAN_LIMITS.business.organizations!;
    if (!hasActiveBusinessOrg) {
      return {
        error: "La création de plusieurs marques est réservée à la formule Business.",
      };
    }
    if (ownedOrgs.length >= limit) {
      return { error: `La formule Business est limitée à ${limit} marques.` };
    }
  }

  const trialEndsAt = isFirstOrganization
    ? new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name, slug, created_by: user!.id, plan: "business", trial_ends_at: trialEndsAt })
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

  if (isFirstOrganization && user!.email) {
    const fullName =
      (user!.user_metadata?.full_name as string | undefined) ?? (user!.user_metadata?.name as string | undefined) ?? name;
    await sendWelcomeEmail({ to: user!.email, fullName }).catch(() => {
      // L'échec d'envoi de l'email de bienvenue ne doit jamais bloquer la création de l'espace.
    });
  }

  redirect("/");
}
