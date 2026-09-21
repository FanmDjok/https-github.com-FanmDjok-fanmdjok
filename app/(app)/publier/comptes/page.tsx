import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DisconnectButton } from "@/components/publier/disconnect-button";
import { PUBLIER_TABS } from "@/lib/nav";
import { NETWORKS, NETWORK_PRIORITY } from "@/lib/networks";
import { NetworkIcon } from "@/components/publier/network-icon";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const STATUS_TONE = {
  connecté: "emerald",
  "à reconnecter": "danger",
  "non connecté": "neutral",
} as const;

export default async function ComptesPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { connected, error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  const { data: accounts } = currentId
    ? await supabase
        .from("social_accounts")
        .select("id, network, label, status, expires_at")
        .eq("organization_id", currentId)
    : { data: [] };

  const byNetwork = new Map((accounts ?? []).map((a) => [a.network, a]));
  const needsReconnect = (accounts ?? []).some((a) => a.status === "à reconnecter");

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Vos comptes <em>connectés</em></>}
        description="Connexion officielle à chaque réseau. Rafraîchissement automatique des jetons, alerte avant expiration."
      />
      <SectionTabs items={PUBLIER_TABS} />

      {connected ? (
        <Card className="mb-4 flex items-center gap-3 border-emerald/30 bg-emerald/[0.04]">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald" />
          <p className="text-sm text-ink">
            {NETWORKS[connected as keyof typeof NETWORKS]?.label ?? connected} connecté avec succès.
          </p>
        </Card>
      ) : null}
      {error ? (
        <Card className="mb-4 flex items-center gap-3 border-danger/30 bg-danger/[0.04]">
          <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
          <p className="text-sm text-ink">{decodeURIComponent(error)}</p>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3">
        {NETWORK_PRIORITY.map((id) => {
          const network = NETWORKS[id];
          const account = byNetwork.get(id);
          const status = account?.status ?? "non connecté";
          const reconnect = status === "à reconnecter";

          return (
            <Card key={id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <NetworkIcon network={id} className="h-10 w-10 rounded-lg text-sm" />
                <div>
                  <p className="text-sm font-medium text-ink">{network.label}</p>
                  <p className="text-xs text-ink-secondary">
                    {account?.label ?? "Aucun compte connecté"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge tone={STATUS_TONE[status]}>{status}</Badge>
                {account ? (
                  <DisconnectButton accountId={account.id} />
                ) : (
                  <ButtonLink href={`/api/social/${id}/connect`} size="sm">
                    Connecter
                  </ButtonLink>
                )}
                {reconnect ? (
                  <ButtonLink href={`/api/social/${id}/connect`} size="sm">
                    Reconnecter
                  </ButtonLink>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>

      {needsReconnect ? (
        <Card className="mt-4 flex items-start gap-3 border-danger/30 bg-danger/[0.04]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <p className="text-sm text-ink">
            Un ou plusieurs comptes doivent être reconnectés. Vos publications
            programmées vers ces réseaux resteront en échec jusqu&apos;à la
            reconnexion.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
