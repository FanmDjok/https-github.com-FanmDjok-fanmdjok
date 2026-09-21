"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sampleCoachMessages } from "@/lib/sample-data";
import { Send } from "lucide-react";

const MONTHLY_LIMIT = 5;
const USED = 2;

export function CoachChat() {
  const [messages] = useState(sampleCoachMessages);
  const [draft, setDraft] = useState("");
  const remaining = MONTHLY_LIMIT - USED;

  return (
    <div className="flex h-[560px] flex-col rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="text-sm font-medium text-ink">Votre conseiller</p>
        <span className="text-xs text-ink-secondary">
          {remaining} / {MONTHLY_LIMIT} questions restantes ce mois-ci
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                m.role === "user"
                  ? "bg-emerald text-emerald-ink"
                  : "bg-paper text-ink border border-line",
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-end gap-2 border-t border-line p-3">
        <Textarea
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Posez votre question…"
          className="resize-none"
        />
        <Button size="md" disabled={remaining <= 0}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
