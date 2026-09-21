"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function CarouselDetail({
  title,
  caption,
  slides,
}: {
  title: string;
  caption: string;
  slides: string[];
}) {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        const node = slideRefs.current[i];
        if (!node) continue;
        const dataUrl = await toPng(node, { pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = `${title.slice(0, 40).replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "carrousel"}-${i + 1}.png`;
        link.href = dataUrl;
        link.click();
        // Laisse le temps au téléchargement de se déclencher avant le suivant.
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{slides.length} visuels</CardDescription>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport} disabled={exporting}>
          <Download className="h-4 w-4" />
          {exporting ? "Export…" : "Exporter en images"}
        </Button>
      </CardHeader>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="flex aspect-[4/5] w-40 shrink-0 flex-col justify-between rounded-xl p-4"
            style={{ backgroundColor: i === 0 || i === slides.length - 1 ? "#0E8A5F" : "#121413" }}
          >
            <span className="text-xs font-medium text-white/60">
              {i + 1} / {slides.length}
            </span>
            <p className="text-sm font-medium leading-snug text-white">{slide}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-line bg-paper p-4">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-secondary">
          Légende
        </p>
        <p className="text-sm text-ink">{caption}</p>
      </div>
    </Card>
  );
}
