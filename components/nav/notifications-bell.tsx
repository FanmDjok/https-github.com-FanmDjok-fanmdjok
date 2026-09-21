"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { markAllNotificationsRead } from "@/app/(app)/notifications-actions";

export type NotificationItem = {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export function NotificationsBell({ notifications }: { notifications: NotificationItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-ink/5 hover:text-ink"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-72 rounded-lg border border-line bg-surface p-1 shadow-sm">
          <div className="flex items-center justify-between px-2.5 py-2">
            <span className="text-xs font-medium text-ink">Notifications</span>
            {unreadCount > 0 ? (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await markAllNotificationsRead();
                    router.refresh();
                  })
                }
                className="text-xs text-ink-secondary hover:text-ink"
              >
                Tout marquer comme lu
              </button>
            ) : null}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-2.5 py-4 text-center text-xs text-ink-secondary">
                Aucune notification.
              </p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "/publier"}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-md px-2.5 py-2 text-xs hover:bg-ink/5",
                    n.read ? "text-ink-secondary" : "text-ink",
                  )}
                >
                  {n.message}
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
