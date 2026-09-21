import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingTable } from "@/components/formules/pricing-table";
import { Pause, Gift, Receipt, Mail } from "lucide-react";

export default function FormulesPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Choisissez votre <em>formule</em></>}
        description="14 jours d'essai Business à l'inscription, sans carte bancaire. Retour automatique en Gratuit à la fin, sans perte de données."
      />

      <PricingTable currentPlan="gratuit" />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-start gap-3">
          <Pause className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
          <div>
            <p className="text-sm font-medium text-ink">Pause d&apos;abonnement</p>
            <p className="mt-1 text-xs text-ink-secondary">De 1 à 3 mois, quand vous en avez besoin.</p>
          </div>
        </Card>
        <Card className="flex items-start gap-3">
          <Gift className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
          <div>
            <p className="text-sm font-medium text-ink">Parrainage</p>
            <p className="mt-1 text-xs text-ink-secondary">1 mois offert pour vous, 1 mois offert pour votre filleul.</p>
          </div>
        </Card>
        <Card className="flex items-start gap-3">
          <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
          <div>
            <p className="text-sm font-medium text-ink">Factures conformes</p>
            <p className="mt-1 text-xs text-ink-secondary">Portail client Stripe, TVA selon votre statut.</p>
          </div>
        </Card>
        <Card className="flex items-start gap-3">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
          <div>
            <p className="text-sm font-medium text-ink">
              Emails automatiques & pages de vente <Badge tone="neutral">Bientôt</Badge>
            </p>
            <p className="mt-1 text-xs text-ink-secondary">Arrivent dans une prochaine version.</p>
          </div>
        </Card>
      </div>

      <CardDescription className="mt-8 text-center text-xs">
        Les limites de chaque formule sont vérifiées automatiquement. Les fonctions payantes
        restent visibles mais verrouillées, avec une explication claire pour passer à la
        formule supérieure.
      </CardDescription>
    </div>
  );
}
