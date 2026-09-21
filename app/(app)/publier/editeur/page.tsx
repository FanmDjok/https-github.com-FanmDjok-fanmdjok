import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { PUBLIER_TABS } from "@/lib/nav";
import { PostEditor } from "@/components/publier/post-editor";
import type { NetworkId } from "@/lib/networks";

export default async function EditeurPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);

  const [{ data: accounts }, { data: media }] = currentId
    ? await Promise.all([
        supabase
          .from("social_accounts")
          .select("network")
          .eq("organization_id", currentId)
          .eq("status", "connecté"),
        supabase
          .from("media_assets")
          .select("id, type, created_at")
          .eq("organization_id", currentId)
          .order("created_at", { ascending: false })
          .limit(30),
      ])
    : [{ data: [] }, { data: [] }];

  const connectedNetworks = (accounts ?? []).map((a) => a.network as NetworkId);
  const mediaOptions = (media ?? []).map((m) => ({
    id: m.id,
    type: m.type,
    label: new Date(m.created_at).toLocaleDateString("fr-FR"),
  }));

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Nouvelle <em>publication</em></>}
        description="Un média, un texte de base, puis un onglet par réseau pour l'adapter."
      />
      <SectionTabs items={PUBLIER_TABS} />
      <PostEditor connectedNetworks={connectedNetworks} mediaOptions={mediaOptions} />
    </div>
  );
}
