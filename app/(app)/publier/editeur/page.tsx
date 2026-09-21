import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { PUBLIER_TABS } from "@/lib/nav";
import { PostEditor } from "@/components/publier/post-editor";

export default function EditeurPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Nouvelle <em>publication</em></>}
        description="Un média, un texte de base, puis un onglet par réseau pour l'adapter."
      />
      <SectionTabs items={PUBLIER_TABS} />
      <PostEditor />
    </div>
  );
}
