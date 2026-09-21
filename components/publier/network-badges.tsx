import { NETWORKS, type NetworkId } from "@/lib/networks";
import { NetworkIcon } from "@/components/publier/network-icon";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  planifié: "Planifié",
  "en cours": "En cours",
  publié: "Publié",
  échec: "Échec",
  "sans connexion": "Mode sans API",
};

const STATUS_DOT: Record<string, string> = {
  planifié: "bg-ink-secondary/40",
  "en cours": "bg-warning",
  publié: "bg-emerald",
  échec: "bg-danger",
  "sans connexion": "bg-ink-secondary/40",
};

export function NetworkStatusRow({
  network,
  status,
  error,
}: {
  network: NetworkId;
  status: keyof typeof STATUS_LABEL;
  error?: string;
}) {
  const { label } = NETWORKS[network];
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <NetworkIcon network={network} />
      <span className="w-20 shrink-0 text-sm text-ink">{label}</span>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[status])} />
      <span className="text-xs text-ink-secondary">{STATUS_LABEL[status]}</span>
      {error ? <span className="truncate text-xs text-danger">— {error}</span> : null}
    </div>
  );
}
