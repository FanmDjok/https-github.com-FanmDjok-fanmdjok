import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { CAPTER_TABS } from "@/lib/nav";
import { LinkPageEditor } from "@/components/capter/link-page-editor";

export default function PageLienPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Votre page <em>lien en bio</em></>}
        description="Nom, présentation, boutons et couleurs de votre marque. À mettre en bio de tous vos réseaux."
      />
      <SectionTabs items={CAPTER_TABS} />
      <LinkPageEditor />
    </div>
  );
}
