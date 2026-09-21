import { cn } from "@/lib/utils";
import { NETWORKS, type NetworkId } from "@/lib/networks";

export function NetworkIcon({
  network,
  className,
}: {
  network: NetworkId;
  className?: string;
}) {
  const n = NETWORKS[network];
  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[9px] font-semibold text-white",
        className,
      )}
      style={{ backgroundColor: n.color }}
    >
      {n.short}
    </span>
  );
}
