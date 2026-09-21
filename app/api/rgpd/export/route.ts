import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";

// Export RGPD complet des données d'une organisation, au format JSON.
// Volontairement exclu : jetons d'accès sociaux chiffrés (access_token_encrypted,
// refresh_token_encrypted) et fichiers binaires (PDF, médias) — seuls leurs
// chemins de stockage sont inclus, les fichiers eux-mêmes restent accessibles
// depuis l'application tant que le compte existe.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { currentId, orgs } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  if (!currentId || !org) return NextResponse.json({ error: "Aucune organisation active." }, { status: 400 });
  if (org.role !== "owner") {
    return NextResponse.json(
      { error: "Seul le propriétaire de l'organisation peut exporter ses données." },
      { status: 403 },
    );
  }

  const eq = "organization_id" as const;
  const [
    organization,
    positioning,
    scripts,
    carousels,
    coachMessages,
    linkPage,
    leadMagnets,
    leads,
    trackedLinks,
    socialAccounts,
    posts,
    postTargets,
    subscription,
  ] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", currentId).single(),
    supabase.from("positioning").select("*").eq(eq, currentId).maybeSingle(),
    supabase.from("scripts").select("*").eq(eq, currentId),
    supabase.from("carousels").select("*").eq(eq, currentId),
    supabase.from("coach_messages").select("*").eq(eq, currentId),
    supabase.from("link_pages").select("*").eq(eq, currentId).maybeSingle(),
    supabase.from("lead_magnets").select("id, title, type, status, storage_path, created_at").eq(eq, currentId),
    supabase.from("leads").select("*").eq(eq, currentId),
    supabase.from("tracked_links").select("*").eq(eq, currentId),
    supabase
      .from("social_accounts")
      .select("id, network, external_account_id, label, status, expires_at, created_at")
      .eq(eq, currentId),
    supabase.from("posts").select("*").eq(eq, currentId),
    supabase.from("post_targets").select("*").eq(eq, currentId),
    supabase.from("subscriptions").select("*").eq(eq, currentId).maybeSingle(),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    organization: organization.data,
    positioning: positioning.data,
    scripts: scripts.data,
    carousels: carousels.data,
    coach_messages: coachMessages.data,
    link_page: linkPage.data,
    lead_magnets: leadMagnets.data,
    leads: leads.data,
    tracked_links: trackedLinks.data,
    social_accounts_connectes: socialAccounts.data,
    posts: posts.data,
    post_targets: postTargets.data,
    subscription: subscription.data,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="growthis-export-${org.slug}.json"`,
    },
  });
}
