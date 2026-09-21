import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ATTIRER_TABS } from "@/lib/nav";
import { sampleCarousel } from "@/lib/sample-data";
import { Download, Plus } from "lucide-react";

export default function CarrouselsPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Vos <em>carrousels</em></>}
        description="8 visuels aux couleurs de votre marque, avec légende. Export en images prêtes à publier."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nouveau carrousel
          </Button>
        }
      />
      <SectionTabs items={ATTIRER_TABS} />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{sampleCarousel.title}</CardTitle>
            <CardDescription>{sampleCarousel.slidesCount} visuels</CardDescription>
          </div>
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4" />
            Exporter en images
          </Button>
        </CardHeader>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {sampleCarousel.slides.map((slide, i) => (
            <div
              key={i}
              className="flex aspect-[4/5] w-40 shrink-0 flex-col justify-between rounded-xl p-4"
              style={{ backgroundColor: i === 0 || i === 7 ? "#0E8A5F" : "#121413" }}
            >
              <span className="text-xs font-medium text-white/60">
                {i + 1} / {sampleCarousel.slidesCount}
              </span>
              <p className="text-sm font-medium leading-snug text-white">{slide}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
