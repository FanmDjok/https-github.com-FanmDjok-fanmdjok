"use client";

import { useActionState } from "react";
import { Field, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { savePositioning, type SavePositioningState } from "@/app/(app)/attirer/positionnement/actions";

export function PositioningForm({
  initial,
}: {
  initial: {
    ideal_client: string;
    problem: string;
    promise: string;
    offer: string;
  } | null;
}) {
  const [state, formAction, pending] = useActionState<SavePositioningState, FormData>(
    savePositioning,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field
        label="Votre client idéal"
        hint="Soyez précis : à qui vous adressez-vous en priorité ?"
      >
        <Textarea name="ideal_client" rows={2} defaultValue={initial?.ideal_client ?? ""} />
      </Field>
      <Field label="Son problème principal">
        <Textarea name="problem" rows={2} defaultValue={initial?.problem ?? ""} />
      </Field>
      <Field label="Votre promesse">
        <Textarea name="promise" rows={2} defaultValue={initial?.promise ?? ""} />
      </Field>
      <Field label="Votre offre">
        <Textarea name="offer" rows={2} defaultValue={initial?.offer ?? ""} />
      </Field>

      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald">Positionnement enregistré.</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
