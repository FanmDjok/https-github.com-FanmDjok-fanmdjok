"use client";

import { useActionState, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LinkPagePreview } from "@/components/capter/link-page-preview";
import { savePageLien, type SavePageLienState } from "@/app/(app)/capter/page-lien/actions";
import type { LinkButton } from "@/lib/supabase/types";
import type { Plan } from "@/lib/limits";
import { Plus, Trash2 } from "lucide-react";

type Initial = {
  slug: string;
  display_name: string;
  bio: string;
  brand_color: string;
  buttons: LinkButton[];
};

export function LinkPageEditor({ initial, plan }: { initial: Initial; plan: Plan }) {
  const [slug, setSlug] = useState(initial.slug);
  const [displayName, setDisplayName] = useState(initial.display_name);
  const [bio, setBio] = useState(initial.bio);
  const [brandColor, setBrandColor] = useState(initial.brand_color);
  const [buttons, setButtons] = useState<LinkButton[]>(initial.buttons);
  const [state, formAction, pending] = useActionState<SavePageLienState, FormData>(
    savePageLien,
    undefined,
  );

  const showBadge = plan === "gratuit";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>growthis.io/{slug || "votre-page"}</CardTitle>
            <CardDescription>
              {plan === "gratuit"
                ? "Nom de domaine personnalisé disponible en formule Business."
                : "Domaine personnalisé actif."}
            </CardDescription>
          </div>
          {plan === "gratuit" ? <Badge tone="neutral">Formule Gratuite</Badge> : null}
        </CardHeader>

        <form action={formAction} className="flex flex-col gap-5">
          <Field label="Adresse de votre page" hint="growthis.io/votre-adresse">
            <Input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </Field>
          <Field label="Nom affiché">
            <Input
              name="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Field>
          <Field label="Présentation">
            <Textarea name="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </Field>
          <Field label="Couleur de votre marque">
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="brand_color"
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
                    placeholder="Libellé"
                    onChange={(e) => {
                      const next = [...buttons];
                      next[i] = { ...btn, label: e.target.value };
                      setButtons(next);
                    }}
                  />
                  <Input
                    value={btn.url}
                    placeholder="https://…"
                    onChange={(e) => {
                      const next = [...buttons];
                      next[i] = { ...btn, url: e.target.value };
                      setButtons(next);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setButtons(buttons.filter((b) => b.id !== btn.id))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-ink-secondary hover:text-danger"
                    aria-label="Supprimer le bouton"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-fit"
                onClick={() =>
                  setButtons([
                    ...buttons,
                    { id: `b${Date.now()}`, label: "Nouveau bouton", url: "https://" },
                  ])
                }
              >
                <Plus className="h-4 w-4" />
                Ajouter un bouton
              </Button>
            </div>
          </div>

          <input type="hidden" name="buttons" value={JSON.stringify(buttons)} />

          {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
          {state?.success ? <p className="text-sm text-emerald">Page publiée.</p> : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Publication…" : "Publier la page"}
            </Button>
          </div>
        </form>
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
