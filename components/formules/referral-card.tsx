"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

export function ReferralCard({ referralCode, appUrl }: { referralCode: string; appUrl: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${appUrl}/formules?parrain=${referralCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Le presse-papiers peut être indisponible (contexte non sécurisé) : rien de grave.
    }
  }

  return (
    <Card className="flex items-start gap-3">
      <Gift className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">Parrainage</p>
        <p className="mt-1 text-xs text-ink-secondary">
          1 mois offert pour vous, 1 mois offert pour votre filleul dès son premier abonnement payant.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink-secondary">
            {link}
          </code>
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? "Copié" : "Copier"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
