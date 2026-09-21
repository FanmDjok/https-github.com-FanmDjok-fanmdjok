"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { generateLeadMagnetPlan, publishLeadMagnet } from "@/app/(app)/capter/aimants/actions";
import { Plus, X, Trash2 } from "lucide-react";

type Section = { title: string; body: string };
type MagnetType = "Checklist" | "Guide PDF" | "Mini-formation";

export function LeadMagnetCreator() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"topic" | "plan">("topic");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<MagnetType>("Checklist");
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setOpen(false);
    setStep("topic");
    setTopic("");
    setTitle("");
    setSections([]);
    setError(null);
  }

  async function handleGeneratePlan() {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    const result = await generateLeadMagnetPlan(topic, type);
    setLoading(false);
    if (result.error || !result.plan) {
      setError(result.error ?? "Une erreur est survenue.");
      return;
    }
    setTitle(result.plan.title);
    setSections(result.plan.sections);
    setStep("plan");
  }

  async function handlePublish() {
    setLoading(true);
    setError(null);
    const result = await publishLeadMagnet(title, type, sections);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    reset();
    router.refresh();
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nouvel aimant
      </Button>
    );
  }

  return (
    <Card className="mb-6 w-full">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Nouvel aimant à prospects</p>
        <button onClick={reset} aria-label="Fermer" type="button">
          <X className="h-4 w-4 text-ink-secondary" />
        </button>
      </div>

      {step === "topic" ? (
        <div className="flex flex-col gap-4">
          <Field label="Sujet de l'aimant">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Structurer son premier appel découverte"
              autoFocus
            />
          </Field>
          <Field label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value as MagnetType)}>
              <option value="Checklist">Checklist</option>
              <option value="Guide PDF">Guide PDF</option>
              <option value="Mini-formation">Mini-formation</option>
            </Select>
          </Field>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <div className="flex justify-end">
            <Button onClick={handleGeneratePlan} disabled={loading || !topic.trim()}>
              {loading ? "Génération du plan…" : "Proposer un plan"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Field label="Titre">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>

          <div className="flex flex-col gap-3">
            {sections.map((section, i) => (
              <div key={i} className="rounded-lg border border-line p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Input
                    value={section.title}
                    onChange={(e) => {
                      const next = [...sections];
                      next[i] = { ...section, title: e.target.value };
                      setSections(next);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setSections(sections.filter((_, idx) => idx !== i))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-ink-secondary hover:text-danger"
                    aria-label="Supprimer la section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Textarea
                  rows={2}
                  value={section.body}
                  onChange={(e) => {
                    const next = [...sections];
                    next[i] = { ...section, body: e.target.value };
                    setSections(next);
                  }}
                />
              </div>
            ))}
          </div>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep("topic")} disabled={loading}>
              Retour
            </Button>
            <Button onClick={handlePublish} disabled={loading || !title.trim() || sections.length === 0}>
              {loading ? "Génération du PDF…" : "Générer et publier"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
