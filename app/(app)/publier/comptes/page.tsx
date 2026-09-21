import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PUBLIER_TABS } from "@/lib/nav";
import { NETWORKS } from "@/lib/networks";
import { NetworkIcon } from "@/components/publier/network-icon";
import { sampleSocialAccounts } from "@/lib/sample-data";
import { AlertTriangle } from "lucide-react";

const STATUS_TONE = {
  connecté: "emerald",
  "à reconnecter": "danger",
  "non connecté": "neutral",
} as const;

export default function ComptesPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Vos comptes <em>connectés</em></>}
        description="Connexion officielle à chaque réseau. Rafraîchissement automatique des jetons, alerte avant expiration."
      />
      <SectionTabs items={PUBLIER_TABS} />

      <div className="flex flex-col gap-3">
        {sampleSocialAccounts.map((account) => {
          const network = NETWORKS[account.network];
          const needsReconnect = account.status === "à reconnecter";
          return (
            <Card key={account.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink/5">
                  <NetworkIcon network={account.network} className="h-8 w-8 rounded-lg text-xs" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{network.label}</p>
                  <p className="text-xs text-ink-secondary">
                    {account.label ?? "Aucun compte connecté"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge tone={STATUS_TONE[account.status]}>{account.status}</Badge>
                {account.status === "connecté" ? (
                  <Button variant="secondary" size="sm">Déconnecter</Button>
                ) : (
                  <Button variant={needsReconnect ? "primary" : "secondary"} size="sm">
                    {needsReconnect ? "Reconnecter" : "Connecter"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {sampleSocialAccounts.some((a) => a.status === "à reconnecter") ? (
        <Card className="mt-4 flex items-start gap-3 border-danger/30 bg-danger/[0.04]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <p className="text-sm text-ink">
            Votre compte LinkedIn doit être reconnecté. Vos publications
            programmées vers LinkedIn resteront en échec jusqu&apos;à la
            reconnexion.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
