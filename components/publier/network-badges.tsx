"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { NETWORKS, type NetworkId } from "@/lib/networks";
import { NetworkIcon } from "@/components/publier/network-icon";
import { cn } from "@/lib/utils";
import { retryTarget, confirmManualPublish } from "@/app/(app)/publier/actions";
import { RotateCw, Check } from "lucide-react";

export type PostTargetStatus = "en_attente" | "en_cours" | "publié" | "échec" | "sans_connexion";

const STATUS_LABEL: Record<PostTargetStatus, string> = {
  en_attente: "En attente",
  en_cours: "En cours",
  publié: "Publié",
  échec: "Échec",
  sans_connexion: "Mode sans API",
};

const STATUS_DOT: Record<PostTargetStatus, string> = {
  en_attente: "bg-ink-secondary/40",
  en_cours: "bg-warning",
  publié: "bg-emerald",
  échec: "bg-danger",
  sans_connexion: "bg-ink-secondary/40",
};

export function NetworkStatusRow({
  targetId,
  network,
  status,
  error,
  externalUrl,
}: {
  targetId: string;
  network: NetworkId;
  status: PostTargetStatus;
  error?: string | null;
  externalUrl?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { label } = NETWORKS[network];

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <NetworkIcon network={network} />
      <span className="w-20 shrink-0 text-sm text-ink">{label}</span>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[status])} />
      <span className="text-xs text-ink-secondary">{STATUS_LABEL[status]}</span>
      {externalUrl ? (
        <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald">
          Voir
        </a>
      ) : null}
      {error ? <span className="truncate text-xs text-danger">— {error}</span> : null}
      {status === "échec" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await retryTarget(targetId);
              router.refresh();
            })
          }
          className="ml-auto flex items-center gap-1 text-xs text-ink-secondary hover:text-ink"
        >
          <RotateCw className="h-3 w-3" />
          Réessayer
        </button>
      ) : null}
      {status === "sans_connexion" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await confirmManualPublish(targetId);
              router.refresh();
            })
          }
          className="ml-auto flex items-center gap-1 text-xs text-ink-secondary hover:text-ink"
        >
          <Check className="h-3 w-3" />
          Confirmer la publication
        </button>
      ) : null}
    </div>
  );
}
