import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { CAPTER_TABS } from "@/lib/nav";
import { LeadsTable } from "@/components/capter/leads-table";

export default async function ProspectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  const { data: leads } = currentId
    ? await supabase
        .from("leads")
        .select("id, name, email, status, source, network, created_at")
        .eq("organization_id", currentId)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Vos <em>prospects</em></>}
        description="Filtrez, recherchez, exportez. Chaque prospect garde le contenu et le réseau qui l'ont amené."
      />
      <SectionTabs items={CAPTER_TABS} />
      <LeadsTable leads={leads ?? []} />
    </div>
  );
}
