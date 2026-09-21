"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createScript, type CreateScriptState } from "@/app/(app)/attirer/scripts/actions";
import { Plus, X } from "lucide-react";

export function NewScriptForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<CreateScriptState, FormData>(
    createScript,
    undefined,
  );

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nouveau script
      </Button>
    );
  }

  return (
    <Card className="mb-6 w-full">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Nouveau script</p>
        <button onClick={() => setOpen(false)} aria-label="Fermer" type="button">
          <X className="h-4 w-4 text-ink-secondary" />
        </button>
      </div>
      <form action={formAction} className="flex flex-col gap-4">
        <Field label="Sujet du script" hint="Ce sur quoi porte la vidéo.">
          <Input name="topic" required placeholder="Les 3 erreurs qui coûtent des clients" autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Objectif">
            <Select name="objective" defaultValue="Attirer">
              <option value="Attirer">Attirer</option>
              <option value="Rassurer">Rassurer</option>
              <option value="Convertir">Convertir</option>
            </Select>
          </Field>
          <Field label="Durée">
            <Select name="duration" defaultValue="30">
              <option value="30">30 secondes</option>
              <option value="60">60 secondes</option>
              <option value="90">90 secondes</option>
            </Select>
          </Field>
        </div>

        {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Génération…" : "Générer le script"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
