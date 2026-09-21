import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { CAPTER_TABS } from "@/lib/nav";
import { LinkPageEditor } from "@/components/capter/link-page-editor";

export default async function PageLienPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { orgs, currentId } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);

  const { data: linkPage } = currentId
    ? await supabase
        .from("link_pages")
        .select("slug, display_name, bio, brand_color, buttons")
        .eq("organization_id", currentId)
        .maybeSingle()
    : { data: null };

  const initial = {
    slug: linkPage?.slug ?? (org?.slug ?? ""),
    display_name: linkPage?.display_name ?? org?.name ?? "",
    bio: linkPage?.bio ?? "",
    brand_color: linkPage?.brand_color ?? org?.brand_color ?? "#0E8A5F",
    buttons: linkPage?.buttons ?? [],
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Votre page <em>lien en bio</em></>}
        description="Nom, présentation, boutons et couleurs de votre marque. À mettre en bio de tous vos réseaux."
      />
      <SectionTabs items={CAPTER_TABS} />
      <LinkPageEditor initial={initial} plan={org?.plan ?? "gratuit"} />
    </div>
  );
}
