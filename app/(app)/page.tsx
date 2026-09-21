import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LeadStatusBadge } from "@/components/shared/lead-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber, daysSince } from "@/lib/utils";
import { Check, Circle, Users, UserCheck, Sparkles, ArrowRight, Inbox } from "lucide-react";

const MONTH_LABEL = new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(new Date());

export default async function AccueilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { orgs, currentId } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { count: leadsThisMonth },
    { count: clientsThisMonth },
    { data: leadsToFollowUp },
    { data: positioning },
    { data: linkPage },
    { count: publishedMagnets },
    { count: scriptsCount },
  ] = currentId
    ? await Promise.all([
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", currentId)
          .gte("created_at", startOfMonth.toISOString()),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", currentId)
          .eq("status", "Client")
          .gte("created_at", startOfMonth.toISOString()),
        supabase
          .from("leads")
          .select("id, name, source, status, created_at")
          .eq("organization_id", currentId)
          .in("status", ["Nouveau", "Contacté"])
          .order("created_at", { ascending: true })
          .limit(3),
        supabase
          .from("positioning")
          .select("ideal_client")
          .eq("organization_id", currentId)
          .maybeSingle(),
        supabase
          .from("link_pages")
          .select("slug")
          .eq("organization_id", currentId)
          .maybeSingle(),
        supabase
          .from("lead_magnets")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", currentId)
          .eq("status", "publié"),
        supabase
          .from("scripts")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", currentId),
      ])
    : [{ count: 0 }, { count: 0 }, { data: [] }, { data: null }, { data: null }, { count: 0 }, { count: 0 }];

  const hasPositioning = Boolean(positioning?.ideal_client);
  const hasLinkPage = Boolean(linkPage);
  const hasLeadMagnet = (publishedMagnets ?? 0) > 0;
  const hasScript = (scriptsCount ?? 0) > 0;
  const newLeadsCount = (leadsToFollowUp ?? []).filter((l) => l.status === "Nouveau").length;

  const setupChecklist = [
    { id: "positioning", label: "Définir votre positionnement", done: hasPositioning, href: "/attirer/positionnement" },
    { id: "script", label: "Créer votre premier script", done: hasScript, href: "/attirer/scripts" },
    { id: "page", label: "Publier votre page lien en bio", done: hasLinkPage, href: "/capter/page-lien" },
    { id: "magnet", label: "Créer votre premier aimant à prospects", done: hasLeadMagnet, href: "/capter/aimants" },
    { id: "social", label: "Connecter votre premier réseau", done: false, href: "/publier/comptes" },
  ];
  const doneCount = setupChecklist.filter((s) => s.done).length;

  const priority = !hasPositioning
    ? { title: "Définir votre positionnement", reason: "Toute l'IA de Growthis s'appuie dessus : idées, scripts, carrousels et conseils.", ctaLabel: "Renseigner mon positionnement", ctaHref: "/attirer/positionnement" }
    : !hasScript
      ? { title: "Créer votre premier script", reason: "Un script prêt à tourner, avec accroche et appel à l'action.", ctaLabel: "Créer un script", ctaHref: "/attirer/scripts" }
      : !hasLinkPage
        ? { title: "Publier votre page lien en bio", reason: "L'endroit où envoyer vos prospects depuis vos réseaux.", ctaLabel: "Publier ma page", ctaHref: "/capter/page-lien" }
        : !hasLeadMagnet
          ? { title: "Créer votre premier aimant à prospects", reason: "Un document utile pour transformer vos visiteurs en emails.", ctaLabel: "Créer un aimant", ctaHref: "/capter/aimants" }
          : newLeadsCount > 0
            ? { title: `Relancer ${newLeadsCount} prospect(s) en attente`, reason: "Ils n'ont pas encore reçu de réponse de votre part.", ctaLabel: "Voir mes prospects", ctaHref: "/capter/prospects" }
            : { title: "Continuer à publier régulièrement", reason: "La régularité est ce qui transforme le plus votre contenu en clients.", ctaLabel: "Voir mes idées de la semaine", ctaHref: "/attirer/idees" };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={
          <>
            Bonjour{org ? `, ${org.name}` : ""}. Voici ce que votre <em>contenu</em> a rapporté.
          </>
        }
        description={`Résumé de ${MONTH_LABEL}.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Prospects ce mois-ci" value={formatNumber(leadsThisMonth ?? 0)} icon={Users} />
        <StatCard label="Clients ce mois-ci" value={formatNumber(clientsThisMonth ?? 0)} icon={UserCheck} />
        <StatCard label="Contenus créés" value={formatNumber((scriptsCount ?? 0))} icon={Sparkles} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-emerald/30 bg-emerald/[0.04]">
          <CardHeader>
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-emerald">
                Priorité du jour
              </span>
              <CardTitle className="mt-1">{priority.title}</CardTitle>
            </div>
          </CardHeader>
          <CardDescription>{priority.reason}</CardDescription>
          <ButtonLink href={priority.ctaHref} className="mt-4">
            {priority.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mise en place</CardTitle>
          </CardHeader>
          <Progress value={(doneCount / setupChecklist.length) * 100} />
          <p className="mt-2 text-xs text-ink-secondary">
            {doneCount} / {setupChecklist.length} étapes terminées
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {setupChecklist.map((item) => (
              <li key={item.id}>
                <a href={item.href} className="flex items-center gap-2.5 text-sm hover:opacity-80">
                  {item.done ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-ink-secondary/50" />
                  )}
                  <span className={item.done ? "text-ink-secondary line-through" : "text-ink"}>
                    {item.label}
                  </span>
                </a>
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
        {leadsToFollowUp && leadsToFollowUp.length > 0 ? (
          <div className="flex flex-col divide-y divide-line">
            {leadsToFollowUp.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{lead.name}</p>
                  <p className="text-xs text-ink-secondary">
                    {lead.source} · en attente depuis {daysSince(lead.created_at)}
                  </p>
                </div>
                <LeadStatusBadge status={lead.status as "Nouveau" | "Contacté" | "Client"} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="Aucun prospect en attente"
            description="Vos prochains prospects apparaîtront ici dès qu'ils viendront de votre page ou d'un aimant."
          />
        )}
      </Card>
    </div>
  );
}
