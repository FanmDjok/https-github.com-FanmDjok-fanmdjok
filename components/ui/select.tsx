import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-line bg-paper px-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-emerald",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
    </div>
  );
}
