import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MediaUploader } from "@/components/publier/media-uploader";
import { PUBLIER_TABS } from "@/lib/nav";
import { formatDate } from "@/lib/utils";
import { Film, ImageOff } from "lucide-react";

export default async function MediasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  const { data: media } = currentId
    ? await supabase
        .from("media_assets")
        .select("id, storage_path, type, created_at")
        .eq("organization_id", currentId)
        .order("created_at", { ascending: false })
    : { data: [] };

  const withUrls = await Promise.all(
    (media ?? []).map(async (item) => {
      const { data: signed } = await supabase.storage
        .from("media")
        .createSignedUrl(item.storage_path, 3600);
      return { ...item, url: signed?.signedUrl ?? null };
    }),
  );

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Votre <em>médiathèque</em></>}
        description="Vos images et vidéos, prêtes à être publiées sur chaque réseau."
        actions={<MediaUploader />}
      />
      <SectionTabs items={PUBLIER_TABS} />

      {withUrls.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {withUrls.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              <div className="flex aspect-square items-center justify-center bg-ink/5">
                {item.type === "image" && item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" className="h-full w-full object-cover" />
                ) : item.type === "vidéo" ? (
                  <Film className="h-6 w-6 text-ink-secondary" />
                ) : (
                  <ImageOff className="h-6 w-6 text-ink-secondary" />
                )}
              </div>
              <div className="p-3">
                <p className="text-[11px] text-ink-secondary">{formatDate(item.created_at)}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ImageOff}
          title="Médiathèque vide"
          description="Importez une image ou une vidéo pour commencer à publier."
        />
      )}
    </div>
  );
}
