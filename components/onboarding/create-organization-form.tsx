"use client";

import { useActionState } from "react";
import { createOrganization } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

type State = { error?: string } | undefined;

async function action(_prev: State, formData: FormData): Promise<State> {
  return createOrganization(formData);
}

export function CreateOrganizationForm() {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field
        label="Nom de votre marque"
        hint="C'est le nom que verront vos prospects sur votre page lien en bio."
      >
        <Input name="name" required placeholder="Atelier Camille" autoFocus />
      </Field>

      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}

      <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
        {pending ? "Création…" : "Créer mon espace"}
      </Button>
    </form>
  );
}
