"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const PERIODS = [
  { value: "7", label: "7 j" },
  { value: "30", label: "30 j" },
  { value: "90", label: "90 j" },
];

export function PeriodTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("period") ?? "30";

  return (
    <div className="flex w-fit gap-1 rounded-full border border-line bg-surface p-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => router.push(`/mesurer?period=${p.value}`)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            current === p.value
              ? "bg-emerald text-emerald-ink"
              : "text-ink-secondary hover:text-ink",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
