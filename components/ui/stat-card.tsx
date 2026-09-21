import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  trend?: { value: string; positive?: boolean };
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-secondary">{label}</span>
        {Icon ? <Icon className="h-4 w-4 text-ink-secondary" /> : null}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl font-medium tabular-nums text-ink">
          {value}
        </span>
        {trend ? (
          <span
            className={cn(
              "text-xs font-medium",
              trend.positive ? "text-emerald" : "text-ink-secondary",
            )}
          >
            {trend.value}
          </span>
        ) : null}
      </div>
    </Card>
  );
}
