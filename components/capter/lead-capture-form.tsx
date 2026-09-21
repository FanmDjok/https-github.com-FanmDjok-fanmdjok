"use client";

import { useState } from "react";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitLeadCapture } from "@/app/[slug]/aimant/[id]/actions";
import { Download } from "lucide-react";

export function LeadCaptureForm({
  magnetId,
  brandColor,
}: {
  magnetId: string;
  brandColor: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await submitLeadCapture(magnetId, formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDownloadUrl(result.downloadUrl ?? null);
  }

  if (downloadUrl) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center">
        <p className="text-sm font-medium text-ink">C&apos;est envoyé !</p>
        <p className="mt-1 text-sm text-ink-secondary">
          Vous recevrez aussi un email avec le lien de téléchargement.
        </p>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-white"
          style={{ backgroundColor: brandColor }}
        >
          <Download className="h-4 w-4" />
          Télécharger maintenant
        </a>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-col gap-4">
        <Field label="Prénom">
          <Input name="name" required autoComplete="given-name" />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" />
        </Field>

        <label className="flex items-start gap-2.5 text-xs text-ink-secondary">
          <input type="checkbox" name="consent" required className="mt-0.5" />
          J&apos;accepte de recevoir ce document par email et d&apos;être
          recontacté(e) à ce sujet. Mes données ne sont jamais partagées.
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button
          type="submit"
          disabled={pending}
          className="w-full"
          style={{ backgroundColor: brandColor }}
        >
          {pending ? "Envoi…" : "Recevoir le document"}
        </Button>
      </div>
    </form>
  );
}
