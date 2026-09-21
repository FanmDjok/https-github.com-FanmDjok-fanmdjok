import { cn } from "@/lib/utils";

export function LinkPagePreview({
  displayName,
  bio,
  brandColor,
  buttons,
  showBadge,
}: {
  displayName: string;
  bio: string;
  brandColor: string;
  buttons: { id: string; label: string }[];
  showBadge: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-[2.5rem] border-8 border-ink bg-paper shadow-lg">
      <div className="flex min-h-[520px] flex-col items-center px-5 py-10">
        <div
          className="h-16 w-16 shrink-0 rounded-full"
          style={{ backgroundColor: brandColor }}
        />
        <p className="mt-4 text-center text-sm font-semibold text-ink">{displayName}</p>
        <p className="mt-1.5 text-center text-xs leading-relaxed text-ink-secondary">{bio}</p>

        <div className="mt-6 flex w-full flex-col gap-2.5">
          {buttons.map((btn) => (
            <div
              key={btn.id}
              className={cn(
                "flex h-10 w-full items-center justify-center rounded-full text-xs font-medium text-white",
              )}
              style={{ backgroundColor: brandColor }}
            >
              {btn.label}
            </div>
          ))}
        </div>

        {showBadge ? (
          <p className="mt-auto pt-8 text-[10px] text-ink-secondary/70">Réalisé avec growthis</p>
        ) : null}
      </div>
    </div>
  );
}
