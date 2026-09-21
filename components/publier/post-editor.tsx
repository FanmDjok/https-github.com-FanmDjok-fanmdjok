"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea, Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NETWORK_PRIORITY, NETWORKS, type NetworkId } from "@/lib/networks";
import { NetworkIcon } from "@/components/publier/network-icon";
import { createPost, adaptCaption, type CreatePostState } from "@/app/(app)/publier/editeur/actions";
import { Sparkles, AlertTriangle, CheckCircle2, Send, CalendarClock } from "lucide-react";

const CAPTION_LIMIT: Partial<Record<NetworkId, number>> = {
  tiktok: 150,
  instagram: 2200,
  linkedin: 3000,
};

export type MediaOption = { id: string; label: string; type: "image" | "vidéo" };

export function PostEditor({
  connectedNetworks,
  mediaOptions,
}: {
  connectedNetworks: NetworkId[];
  mediaOptions: MediaOption[];
}) {
  const connected = useMemo(() => new Set(connectedNetworks), [connectedNetworks]);

  const [baseCaption, setBaseCaption] = useState("");
  const [mediaAssetId, setMediaAssetId] = useState("");
  const [selected, setSelected] = useState<Set<NetworkId>>(new Set());
  const [captions, setCaptions] = useState<Partial<Record<NetworkId, string>>>({});
  const [activeTab, setActiveTab] = useState<NetworkId | null>(null);
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [adapting, setAdapting] = useState<NetworkId | null>(null);
  const [state, formAction, pending] = useActionState<CreatePostState, FormData>(
    createPost,
    undefined,
  );
  const [, startTransition] = useTransition();

  const selectedList = useMemo(
    () => NETWORK_PRIORITY.filter((n) => selected.has(n)),
    [selected],
  );

  function toggleNetwork(id: NetworkId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setActiveTab(id);
      }
      return next;
    });
  }

  function captionFor(id: NetworkId) {
    return captions[id] ?? baseCaption;
  }

  function handleAdapt(id: NetworkId) {
    setAdapting(id);
    startTransition(async () => {
      const result = await adaptCaption(baseCaption, id);
      setAdapting(null);
      if (result.caption) {
        setCaptions((prev) => ({ ...prev, [id]: result.caption }));
      }
    });
  }

  const warnings = selectedList
    .map((id) => {
      const limit = CAPTION_LIMIT[id];
      const text = captionFor(id);
      if (limit && text.length > limit) {
        return `${NETWORKS[id].label} : la légende dépasse ${limit} caractères (${text.length}/${limit}). Raccourcissez-la avant l'envoi.`;
      }
      if (!connected.has(id)) {
        return `${NETWORKS[id].label} n'est pas connecté : Growthis préparera le média et la légende, avec un rappel à l'heure prévue pour une publication manuelle.`;
      }
      return null;
    })
    .filter(Boolean) as string[];

  const networksPayload = selectedList.map((id) => ({
    network: id,
    caption: captions[id] ?? null,
  }));

  return (
    <form action={formAction}>
      <input type="hidden" name="caption" value={baseCaption} />
      <input type="hidden" name="mediaAssetId" value={mediaAssetId} />
      <input type="hidden" name="scheduleMode" value={scheduleMode} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time} />
      <input type="hidden" name="networks" value={JSON.stringify(networksPayload)} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Contenu</CardTitle>
            </CardHeader>
            {mediaOptions.length > 0 ? (
              <div className="mb-4">
                <Select value={mediaAssetId} onChange={(e) => setMediaAssetId(e.target.value)}>
                  <option value="">Aucun média</option>
                  {mediaOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.type === "vidéo" ? "Vidéo" : "Image"} — {m.label}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <p className="mb-4 text-sm text-ink-secondary">
                Aucun média dans votre bibliothèque.{" "}
                <Link href="/publier/medias" className="text-emerald">
                  Importer un fichier
                </Link>
                .
              </p>
            )}
            <Textarea
              rows={4}
              value={baseCaption}
              onChange={(e) => setBaseCaption(e.target.value)}
              placeholder="Votre texte de base…"
            />
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Réseaux</CardTitle>
                <CardDescription>Sélectionnez où publier. Chacun est une tâche indépendante.</CardDescription>
              </div>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {NETWORK_PRIORITY.map((id) => {
                const network = NETWORKS[id];
                const active = selected.has(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleNetwork(id)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-emerald bg-emerald/10 text-emerald"
                        : "border-line text-ink-secondary hover:text-ink",
                    )}
                  >
                    <NetworkIcon network={id} />
                    {network.label}
                    {!connected.has(id) ? (
                      <span className="text-[10px] uppercase text-ink-secondary/70">sans API</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Card>

          {selectedList.length > 0 ? (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Adapter par réseau</CardTitle>
                  <CardDescription>L&apos;IA propose une version adaptée à chaque réseau.</CardDescription>
                </div>
              </CardHeader>

              <div className="mb-4 flex gap-1 overflow-x-auto rounded-full border border-line bg-paper p-1 w-fit">
                {selectedList.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                      activeTab === id
                        ? "bg-emerald text-emerald-ink"
                        : "text-ink-secondary hover:text-ink",
                    )}
                  >
                    {NETWORKS[id].label}
                  </button>
                ))}
              </div>

              {activeTab && selectedList.includes(activeTab) ? (
                <div className="flex flex-col gap-4">
                  <Field
                    label={`Légende ${NETWORKS[activeTab].label}`}
                    hint={
                      CAPTION_LIMIT[activeTab]
                        ? `${captionFor(activeTab).length} / ${CAPTION_LIMIT[activeTab]} caractères`
                        : undefined
                    }
                  >
                    <Textarea
                      rows={4}
                      value={captionFor(activeTab)}
                      onChange={(e) =>
                        setCaptions((prev) => ({ ...prev, [activeTab]: e.target.value }))
                      }
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-fit"
                    disabled={adapting === activeTab || !baseCaption.trim()}
                    onClick={() => handleAdapt(activeTab)}
                  >
                    <Sparkles className="h-4 w-4" />
                    {adapting === activeTab ? "Adaptation…" : "Adapter avec l'IA"}
                  </Button>
                </div>
              ) : null}
            </Card>
          ) : null}

          {warnings.length > 0 ? (
            <Card className="border-warning/30 bg-warning/[0.04]">
              <div className="flex flex-col gap-2">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-ink">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    {w}
                  </div>
                ))}
              </div>
            </Card>
          ) : selectedList.length > 0 ? (
            <Card className="border-emerald/30 bg-emerald/[0.04]">
              <div className="flex items-center gap-2 text-sm text-ink">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald" />
                Tout est conforme aux contraintes de chaque réseau.
              </div>
            </Card>
          ) : null}

          {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
        </div>

        <div className="lg:sticky lg:top-10 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Publication</CardTitle>
            </CardHeader>
            <div className="flex gap-1 rounded-full border border-line bg-paper p-1">
              <button
                type="button"
                onClick={() => setScheduleMode("now")}
                className={cn(
                  "flex-1 rounded-full py-1.5 text-sm font-medium",
                  scheduleMode === "now" ? "bg-emerald text-emerald-ink" : "text-ink-secondary",
                )}
              >
                Maintenant
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode("later")}
                className={cn(
                  "flex-1 rounded-full py-1.5 text-sm font-medium",
                  scheduleMode === "later" ? "bg-emerald text-emerald-ink" : "text-ink-secondary",
                )}
              >
                Programmer
              </button>
            </div>

            {scheduleMode === "later" ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            ) : null}

            <p className="mt-3 text-xs text-ink-secondary">
              Fuseau horaire : Europe/Paris. {selectedList.length} réseau(x) sélectionné(s).
            </p>

            <Button
              type="submit"
              className="mt-4 w-full"
              size="lg"
              disabled={pending || selectedList.length === 0}
            >
              {pending ? (
                "Envoi…"
              ) : scheduleMode === "now" ? (
                <>
                  <Send className="h-4 w-4" />
                  Publier maintenant
                </>
              ) : (
                <>
                  <CalendarClock className="h-4 w-4" />
                  Programmer
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>
    </form>
  );
}
