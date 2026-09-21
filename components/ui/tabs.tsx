"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  className,
}: {
  tabs: { value: string; label: string }[];
  defaultTab?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.value);

  return (
    <div
      className={cn(
        "flex w-fit gap-1 rounded-full border border-line bg-surface p-1",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => {
            setActive(tab.value);
            onChange?.(tab.value);
          }}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            active === tab.value
              ? "bg-emerald text-emerald-ink"
              : "text-ink-secondary hover:text-ink",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
