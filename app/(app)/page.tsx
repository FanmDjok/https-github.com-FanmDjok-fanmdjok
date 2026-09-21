import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LeadStatusBadge } from "@/components/shared/lead-status-badge";
import { formatEUR, formatNumber } from "@/lib/utils";
import { sampleAccueil } from "@/lib/sample-data";
import { Check, Circle, Users, UserCheck, Wallet, ArrowRight } from "lucide-react";

export default async function AccueilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { orgs, currentId } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  const data = sampleAccueil;
  const doneCount = data.setupChecklist.filter((s) => s.done).length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={
          <>
            Bonjour{org ? `, ${org.name}` : ""}. Voici ce que votre <em>contenu</em> a rapporté.
          </>
        }
        description={`Résumé de ${data.monthLabel.toLowerCase()}.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Prospects ce mois-ci"
          value={formatNumber(data.leadsThisMonth)}
          trend={{ value: data.leadsTrend, positive: true }}
          icon={Users}
        />
        <StatCard
          label="Clients ce mois-ci"
          value={formatNumber(data.clientsThisMonth)}
          trend={{ value: data.clientsTrend, positive: true }}
          icon={UserCheck}
        />
        <StatCard
          label="Estimation du chiffre généré"
          value={formatEUR(data.revenueEstimate)}
          icon={Wallet}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-emerald/30 bg-emerald/[0.04]">
          <CardHeader>
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-emerald">
                Priorité du jour
              </span>
              <CardTitle className="mt-1">{data.priorityOfTheDay.title}</CardTitle>
            </div>
          </CardHeader>
          <CardDescription>{data.priorityOfTheDay.reason}</CardDescription>
          <ButtonLink href={data.priorityOfTheDay.ctaHref} className="mt-4">
            {data.priorityOfTheDay.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mise en place</CardTitle>
          </CardHeader>
          <Progress value={(doneCount / data.setupChecklist.length) * 100} />
          <p className="mt-2 text-xs text-ink-secondary">
            {doneCount} / {data.setupChecklist.length} étapes terminées
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {data.setupChecklist.map((item) => (
              <li key={item.id} className="flex items-center gap-2.5 text-sm">
                {item.done ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-ink-secondary/50" />
                )}
                <span className={item.done ? "text-ink-secondary line-through" : "text-ink"}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Prospects à relancer</CardTitle>
            <CardDescription>Ils attendent une réponse de votre part.</CardDescription>
          </div>
          <ButtonLink href="/capter/prospects" variant="secondary" size="sm">
            Voir tous les prospects
          </ButtonLink>
        </CardHeader>
        <div className="flex flex-col divide-y divide-line">
          {data.leadsToFollowUp.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{lead.name}</p>
                <p className="text-xs text-ink-secondary">
                  {lead.source} · en attente depuis {lead.waitingSince}
                </p>
              </div>
              <LeadStatusBadge status={lead.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
