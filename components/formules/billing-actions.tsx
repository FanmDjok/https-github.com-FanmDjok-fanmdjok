"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { openBillingPortal, pauseSubscription, resumeSubscription } from "@/app/(app)/formules/actions";

type SubscriptionStatus = "aucun" | "essai" | "actif" | "impayé" | "annulé" | "en_pause";

export function BillingActions({
  status,
  pausedUntil,
}: {
  status: SubscriptionStatus;
  pausedUntil: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState(1);

  function handlePortal() {
    setError(null);
    startTransition(async () => {
      const result = await openBillingPortal();
      if (result && "error" in result) setError(result.error ?? "Une erreur est survenue.");
    });
  }

  function handlePause() {
    setError(null);
    startTransition(async () => {
      const result = await pauseSubscription(months);
      if (result && "error" in result) setError(result.error ?? "Une erreur est survenue.");
    });
  }

  function handleResume() {
    setError(null);
    startTransition(async () => {
      const result = await resumeSubscription();
      if (result && "error" in result) setError(result.error ?? "Une erreur est survenue.");
    });
  }

  return (
    <Card className="mt-4">
      <CardTitle>Facturation</CardTitle>
      <CardDescription className="mt-1">
        Factures, moyen de paiement et historique via le portail Stripe.
      </CardDescription>

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="secondary" disabled={pending} onClick={handlePortal}>
          Gérer la facturation
        </Button>

        {status === "actif" ? (
          <div className="flex items-center gap-2">
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              disabled={pending}
              className="h-10 rounded-full border border-line bg-paper px-3 text-sm text-ink"
            >
              <option value={1}>1 mois</option>
              <option value={2}>2 mois</option>
              <option value={3}>3 mois</option>
            </select>
            <Button variant="secondary" disabled={pending} onClick={handlePause}>
              Mettre en pause
            </Button>
          </div>
        ) : null}

        {status === "en_pause" ? (
          <Button variant="secondary" disabled={pending} onClick={handleResume}>
            {pausedUntil
              ? `Reprendre (pause jusqu'au ${new Date(pausedUntil).toLocaleDateString("fr-FR")})`
              : "Reprendre l'abonnement"}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
