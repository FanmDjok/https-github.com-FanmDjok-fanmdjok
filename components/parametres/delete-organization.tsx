"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteOrganization } from "@/app/(app)/parametres/actions";

export function DeleteOrganization({ slug }: { slug: string }) {
  const [confirming, setConfirming] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button variant="danger" onClick={() => setConfirming(true)}>
        Supprimer cette organisation
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink">
        Cette action est définitive : tout le contenu, les prospects et les connexions de cette
        organisation seront supprimés. Tapez <strong>{slug}</strong> pour confirmer.
      </p>
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={slug} />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <Button
          variant="danger"
          disabled={pending || value !== slug}
          onClick={() =>
            startTransition(async () => {
              const result = await deleteOrganization(value);
              if (result && "error" in result) setError(result.error ?? "Une erreur est survenue.");
            })
          }
        >
          {pending ? "Suppression…" : "Confirmer la suppression"}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={() => setConfirming(false)}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
