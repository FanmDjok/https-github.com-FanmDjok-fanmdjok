import { formatNumber } from "@/lib/utils";

export type FunnelStage = { stage: string; value: number };

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const max = stages[0]?.value || 1;

  return (
    <div className="flex flex-col gap-3">
      {stages.map((stage, i) => {
        const width = Math.max(2, (stage.value / max) * 100);
        const prev = stages[i - 1];
        const rate = prev && prev.value > 0 ? ((stage.value / prev.value) * 100).toFixed(1) : null;
        return (
          <div key={stage.stage}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-medium text-ink">{stage.stage}</span>
              <span className="font-mono text-ink-secondary">
                {formatNumber(stage.value)}
                {rate ? <span className="ml-2 text-xs text-emerald">{rate} %</span> : null}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-ink/5">
              <div className="h-full rounded-full bg-emerald" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
