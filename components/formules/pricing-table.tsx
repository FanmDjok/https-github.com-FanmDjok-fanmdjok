"use client";

import { useState, useTransition } from "react";
import { cn, formatEUR } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/sample-data";
import { checkoutPlan } from "@/app/(app)/formules/actions";
import { Check } from "lucide-react";

export function PricingTable({
  currentPlan,
  referralCode = "",
}: {
  currentPlan: string;
  referralCode?: string;
}) {
  const [yearly, setYearly] = useState(false);
  const [pending, startTransition] = useTransition();
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(planId: string) {
    if (planId === "gratuit") return;
    setError(null);
    setPendingPlan(planId);
    startTransition(async () => {
      const result = await checkoutPlan(
        planId as "essentiel" | "business",
        yearly ? "yearly" : "monthly",
        referralCode,
      );
      if (result && "error" in result) {
        setError(result.error ?? "Une erreur est survenue.");
        setPendingPlan(null);
      }
    });
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-center gap-3">
        <span className={cn("text-sm", !yearly ? "text-ink" : "text-ink-secondary")}>
          Mensuel
        </span>
        <button
          role="switch"
          aria-checked={yearly}
          onClick={() => setYearly((v) => !v)}
          className={cn(
            "relative h-6 w-10 rounded-full transition-colors",
            yearly ? "bg-emerald" : "bg-ink/15",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition-transform",
              yearly ? "translate-x-[18px]" : "translate-x-0.5",
            )}
          />
        </button>
        <span className={cn("text-sm", yearly ? "text-ink" : "text-ink-secondary")}>
          Annuel
        </span>
        <Badge tone="emerald">2 mois offerts</Badge>
      </div>

      {error ? (
        <p className="mb-4 text-center text-sm text-danger">{error}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const price = yearly ? plan.price.yearly : plan.price.monthly;
          const isCurrent = plan.id === currentPlan;
          return (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col",
                plan.id === "essentiel" && "border-emerald/40 shadow-sm",
              )}
            >
              {plan.id === "essentiel" ? (
                <Badge tone="emerald" className="mb-3 w-fit">
                  Le plus choisi
                </Badge>
              ) : null}
              <p className="text-sm font-medium text-ink-secondary">{plan.name}</p>
              <p className="mt-2 font-serif text-3xl text-ink">
                {price === 0 ? "0 €" : formatEUR(price)}
                <span className="text-sm font-sans text-ink-secondary">
                  {price === 0 ? "" : yearly ? " / an" : " / mois"}
                </span>
              </p>
              <p className="mt-1 text-sm text-ink-secondary">{plan.tagline}</p>

              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-6"
                variant={isCurrent ? "secondary" : plan.id === "gratuit" ? "secondary" : "primary"}
                disabled={isCurrent || plan.id === "gratuit" || pending}
                onClick={() => handleSelect(plan.id)}
              >
                {isCurrent
                  ? "Formule actuelle"
                  : pending && pendingPlan === plan.id
                    ? "Un instant…"
                    : plan.id === "gratuit"
                      ? "Formule de base"
                      : `Passer à ${plan.name}`}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
