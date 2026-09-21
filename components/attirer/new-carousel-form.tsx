"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { createCarousel, type CreateCarouselState } from "@/app/(app)/attirer/carrousels/actions";
import { Plus, X } from "lucide-react";

export function NewCarouselForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<CreateCarouselState, FormData>(
    createCarousel,
    undefined,
  );

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nouveau carrousel
      </Button>
    );
  }

  return (
    <Card className="mb-6 w-full">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Nouveau carrousel</p>
        <button onClick={() => setOpen(false)} aria-label="Fermer" type="button">
          <X className="h-4 w-4 text-ink-secondary" />
        </button>
      </div>
      <form action={formAction} className="flex flex-col gap-4">
        <Field label="Sujet du carrousel">
          <Input name="topic" required placeholder="Les 3 signes que votre offre n'est pas claire" autoFocus />
        </Field>

        {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Génération…" : "Générer le carrousel"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
