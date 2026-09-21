import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { NETWORKS } from "@/lib/networks";
import { NetworkIcon } from "@/components/publier/network-icon";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export type CalendarPost = { id: string; title: string; scheduledAt: string };

export function CalendarMonth({
  month = new Date(),
  posts,
}: {
  month?: Date;
  posts: CalendarPost[];
}) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const today = new Date();

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="grid grid-cols-7 border-b border-line bg-paper text-xs font-medium text-ink-secondary">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-3 py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayPosts = posts.filter((p) => isSameDay(new Date(p.scheduledAt), day));
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-28 border-b border-r border-line p-2 last:border-r-0",
                !isSameMonth(day, month) && "bg-paper/60",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                  isSameDay(day, today)
                    ? "bg-emerald text-emerald-ink"
                    : "text-ink-secondary",
                )}
              >
                {format(day, "d", { locale: fr })}
              </span>
              <div className="mt-1.5 flex flex-col gap-1">
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    className="truncate rounded-md bg-emerald/10 px-1.5 py-1 text-[11px] font-medium text-emerald"
                    title={post.title}
                  >
                    {format(new Date(post.scheduledAt), "HH:mm")} · {post.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function NetworkLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-ink-secondary">
      {Object.entries(NETWORKS).map(([id, n]) => (
        <span key={id} className="flex items-center gap-1.5">
          <NetworkIcon network={id as keyof typeof NETWORKS} />
          {n.label}
        </span>
      ))}
    </div>
  );
}
