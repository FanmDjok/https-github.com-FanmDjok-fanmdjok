import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { ATTIRER_TABS } from "@/lib/nav";
import { IdeasView } from "@/components/attirer/ideas-view";

export default function IdeesPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Vos idées de la <em>semaine</em></>}
        description="Générées par l'IA à partir de votre positionnement, classées par objectif."
      />
      <SectionTabs items={ATTIRER_TABS} />
      <IdeasView />
    </div>
  );
}
