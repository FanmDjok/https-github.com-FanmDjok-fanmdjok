import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { NewCarouselForm } from "@/components/attirer/new-carousel-form";
import { ATTIRER_TABS } from "@/lib/nav";
import { formatDate } from "@/lib/utils";
import { Layers } from "lucide-react";

export default async function CarrouselsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  const { data: carousels } = currentId
    ? await supabase
        .from("carousels")
        .select("id, title, slides, created_at")
        .eq("organization_id", currentId)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Vos <em>carrousels</em></>}
        description="8 visuels aux couleurs de votre marque, avec légende. Export en images prêtes à publier."
        actions={<NewCarouselForm />}
      />
      <SectionTabs items={ATTIRER_TABS} />

      {carousels && carousels.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {carousels.map((carousel) => (
            <Link key={carousel.id} href={`/attirer/carrousels/${carousel.id}`}>
              <Card className="h-full transition-colors hover:border-emerald/40">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/10">
                  <Layers className="h-4 w-4 text-emerald" />
                </div>
                <p className="text-sm font-medium text-ink">{carousel.title}</p>
                <p className="mt-1 text-xs text-ink-secondary">
                  {carousel.slides.length} visuels · {formatDate(carousel.created_at)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="Aucun carrousel pour l'instant"
          description="Créez votre premier carrousel à partir d'un sujet."
        />
      )}
    </div>
  );
}
