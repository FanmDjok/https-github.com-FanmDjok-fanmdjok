import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <span
      className={cn(
        "font-sans font-semibold tracking-tight text-ink lowercase",
        sizes[size],
        className,
      )}
    >
      growth
      <span className="relative inline-block">
        ı
        <span className="absolute left-1/2 top-0 h-[0.16em] w-[0.16em] -translate-x-1/2 -translate-y-[0.95em] bg-emerald" />
      </span>
      s
    </span>
  );
}
