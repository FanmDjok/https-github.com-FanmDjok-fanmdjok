import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingTable } from "@/components/formules/pricing-table";
import { BillingActions } from "@/components/formules/billing-actions";
import { ReferralCard } from "@/components/formules/referral-card";
import { Receipt, Mail, CheckCircle2, XCircle } from "lucide-react";
import { daysUntil } from "@/lib/utils";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function FormulesPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; parrain?: string }>;
}) {
  const { checkout, parrain } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId, orgs } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  if (!currentId || !org) redirect("/onboarding");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, paused_until, current_period_end, cancel_at_period_end")
    .eq("organization_id", currentId)
    .maybeSingle();

  const trialDaysLeft = org.trial_ends_at ? daysUntil(org.trial_ends_at) : null;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Choisissez votre <em>formule</em></>}
        description="14 jours d'essai Business à l'inscription, sans carte bancaire. Retour automatique en Gratuit à la fin, sans perte de données."
      />

      {checkout === "succes" ? (
        <Card className="mb-4 flex items-center gap-3 border-emerald/30 bg-emerald/[0.04]">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald" />
          <p className="text-sm text-ink">Abonnement activé. Merci de votre confiance.</p>
        </Card>
      ) : null}
      {checkout === "annule" ? (
        <Card className="mb-4 flex items-center gap-3 border-danger/30 bg-danger/[0.04]">
          <XCircle className="h-4 w-4 shrink-0 text-danger" />
          <p className="text-sm text-ink">Paiement annulé. Vous pouvez réessayer à tout moment.</p>
        </Card>
      ) : null}
      {org.plan === "business" && trialDaysLeft !== null && trialDaysLeft > 0 && !subscription ? (
        <Card className="mb-4 border-emerald/30 bg-emerald/[0.04]">
          <p className="text-sm text-ink">
            Il vous reste <strong>{trialDaysLeft} jour{trialDaysLeft > 1 ? "s" : ""}</strong> d&apos;essai
            Business. Passé ce délai, votre organisation repasse automatiquement en formule Gratuite.
          </p>
        </Card>
      ) : null}

      <PricingTable currentPlan={org.plan} referralCode={parrain ?? ""} />

      {subscription ? (
        <BillingActions status={subscription.status} pausedUntil={subscription.paused_until} />
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ReferralCard referralCode={org.referral_code ?? ""} appUrl={APP_URL} />
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
              Pages de vente <Badge tone="neutral">Bientôt</Badge>
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
