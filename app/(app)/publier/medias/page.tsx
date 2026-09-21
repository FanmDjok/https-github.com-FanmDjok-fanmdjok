import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PUBLIER_TABS } from "@/lib/nav";
import { sampleMediaLibrary } from "@/lib/sample-data";
import { formatDate } from "@/lib/utils";
import { Upload, Film, Image as ImageIcon } from "lucide-react";

export default function MediasPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Votre <em>médiathèque</em></>}
        description="Vos images et vidéos, compressées et vérifiées, prêtes à être publiées sur chaque réseau."
        actions={
          <Button size="sm">
            <Upload className="h-4 w-4" />
            Importer un fichier
          </Button>
        }
      />
      <SectionTabs items={PUBLIER_TABS} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sampleMediaLibrary.map((media) => (
          <Card key={media.id} className="p-0 overflow-hidden">
            <div className="flex aspect-square items-center justify-center bg-ink/5">
              {media.type === "vidéo" ? (
                <Film className="h-6 w-6 text-ink-secondary" />
              ) : (
                <ImageIcon className="h-6 w-6 text-ink-secondary" />
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-xs font-medium text-ink">{media.name}</p>
              <p className="mt-0.5 text-[11px] text-ink-secondary">
                {media.duration ? `${media.duration} · ` : ""}
                {formatDate(media.addedAt)}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
