"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MOBILE_NAV_ITEMS, NAV_ITEMS } from "@/lib/nav";
import { MoreHorizontal, X } from "lucide-react";
import { signOut } from "@/app/auth/actions";

const MORE_ITEMS = NAV_ITEMS.filter(
  (i) => !MOBILE_NAV_ITEMS.some((m) => m.href === i.href),
);

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreActive = MORE_ITEMS.some((i) => pathname.startsWith(i.href));

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Fermer"
            className="absolute inset-0 bg-ink/30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 animate-fade-up rounded-t-2xl border border-line bg-surface p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-ink">Plus</span>
              <button onClick={() => setOpen(false)} aria-label="Fermer">
                <X className="h-4 w-4 text-ink-secondary" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-ink/5"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <form action={signOut}>
                <button
                  type="submit"
                  className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink-secondary hover:bg-ink/5"
                >
                  Se déconnecter
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-emerald" : "text-ink-secondary",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
            moreActive ? "text-emerald" : "text-ink-secondary",
          )}
        >
          <MoreHorizontal className="h-5 w-5" />
          Plus
        </button>
      </nav>
    </>
  );
}
