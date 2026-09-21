"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { generateIdeas, createScriptFromIdea } from "@/app/(app)/attirer/idees/actions";
import type { Ideas } from "@/lib/ai/schemas";
import { RefreshCw, ArrowRight, Lightbulb } from "lucide-react";

const OBJECTIVE_TONE = {
  Attirer: "emerald",
  Rassurer: "neutral",
  Convertir: "warning",
} as const;

export function IdeasView() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Ideas["ideas"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transformingIndex, setTransformingIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function load() {
    setError(null);
    startTransition(async () => {
      const result = await generateIdeas();
      if (result.error) setError(result.error);
      else setIdeas(result.ideas ?? []);
    });
  }

  useEffect(() => {
    // Chargement initial des idées au montage — le fetch est asynchrone,
    // setIdeas/setError ne s'exécutent qu'après la résolution de la promesse.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleTransform(index: number, title: string, objective: string) {
    setTransformingIndex(index);
    setError(null);
    const result = await createScriptFromIdea(title, objective as "Attirer" | "Rassurer" | "Convertir");
    setTransformingIndex(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(`/attirer/scripts/${result.id}`);
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="secondary" size="sm" onClick={load} disabled={isPending}>
          <RefreshCw className="h-4 w-4" />
          {isPending ? "Génération…" : "Nouvelles idées"}
        </Button>
      </div>

      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

      {isPending && !ideas ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="h-16 animate-pulse bg-ink/5" />
          ))}
        </div>
      ) : ideas && ideas.length > 0 ? (
        <div className="flex flex-col gap-3">
          {ideas.map((idea, i) => (
            <Card key={i} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <Badge tone={OBJECTIVE_TONE[idea.objective]}>{idea.objective}</Badge>
                  <span className="text-xs text-ink-secondary">{idea.format}</span>
                </div>
                <p className="truncate text-sm font-medium text-ink">{idea.title}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={transformingIndex !== null}
                onClick={() => handleTransform(i, idea.title, idea.objective)}
              >
                {transformingIndex === i ? "Génération…" : "Transformer en script"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Lightbulb}
          title="Pas encore d'idées"
          description="Renseignez votre positionnement puis générez vos idées de la semaine."
          action={
            <Button size="sm" onClick={load} disabled={isPending}>
              Générer mes idées
            </Button>
          }
        />
      )}
    </div>
  );
}
