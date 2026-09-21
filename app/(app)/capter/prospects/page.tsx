import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { CAPTER_TABS } from "@/lib/nav";
import { LeadsTable } from "@/components/capter/leads-table";

export default function ProspectsPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Vos <em>prospects</em></>}
        description="Filtrez, recherchez, exportez. Chaque prospect garde le contenu et le réseau qui l'ont amené."
      />
      <SectionTabs items={CAPTER_TABS} />
      <LeadsTable />
    </div>
  );
}
