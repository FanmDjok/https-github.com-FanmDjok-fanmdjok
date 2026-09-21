"use client";

import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LinkPagePreview } from "@/components/capter/link-page-preview";
import { sampleLinkPage } from "@/lib/sample-data";
import { Plus, Trash2 } from "lucide-react";

export function LinkPageEditor() {
  const [displayName, setDisplayName] = useState(sampleLinkPage.displayName);
  const [bio, setBio] = useState(sampleLinkPage.bio);
  const [brandColor, setBrandColor] = useState(sampleLinkPage.brandColor);
  const [buttons, setButtons] = useState(sampleLinkPage.buttons);

  const showBadge = sampleLinkPage.plan === "gratuit";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>growthis.io/{sampleLinkPage.slug}</CardTitle>
            <CardDescription>
              {sampleLinkPage.plan === "gratuit"
                ? "Nom de domaine personnalisé disponible en formule Business."
                : "Domaine personnalisé actif."}
            </CardDescription>
          </div>
          {sampleLinkPage.plan === "gratuit" ? <Badge tone="neutral">Formule Gratuite</Badge> : null}
        </CardHeader>

        <div className="flex flex-col gap-5">
          <Field label="Nom affiché">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </Field>
          <Field label="Présentation">
            <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </Field>
          <Field label="Couleur de votre marque">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-transparent p-1"
              />
              <span className="font-mono text-sm text-ink-secondary">{brandColor}</span>
            </div>
          </Field>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">Boutons</p>
            <div className="flex flex-col gap-2.5">
              {buttons.map((btn, i) => (
                <div key={btn.id} className="flex items-center gap-2">
                  <Input
                    value={btn.label}
                    onChange={(e) => {
                      const next = [...buttons];
                      next[i] = { ...btn, label: e.target.value };
                      setButtons(next);
                    }}
                  />
                  <button
                    onClick={() => setButtons(buttons.filter((b) => b.id !== btn.id))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-ink-secondary hover:text-danger"
                    aria-label="Supprimer le bouton"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                className="w-fit"
                onClick={() =>
                  setButtons([
                    ...buttons,
                    { id: `b${Date.now()}`, label: "Nouveau bouton", url: "#" },
                  ])
                }
              >
                <Plus className="h-4 w-4" />
                Ajouter un bouton
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>Publier la page</Button>
          </div>
        </div>
      </Card>

      <div className="lg:sticky lg:top-10 lg:self-start">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-ink-secondary">
          Aperçu en direct
        </p>
        <LinkPagePreview
          displayName={displayName}
          bio={bio}
          brandColor={brandColor}
          buttons={buttons}
          showBadge={showBadge}
        />
      </div>
    </div>
  );
}
