"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendCoachMessage } from "@/app/(app)/conseil/actions";
import { Send } from "lucide-react";

type Message = { id: string; role: "user" | "assistant"; content: string };

export function CoachChat({
  initialMessages,
  limit,
  used,
}: {
  initialMessages: Message[];
  limit: number | null;
  used: number;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [remainingUsed, setRemainingUsed] = useState(used);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const remaining = limit === null ? null : Math.max(0, limit - remainingUsed);
  const limitReached = remaining !== null && remaining <= 0;

  function handleSend() {
    const content = draft.trim();
    if (!content || limitReached) return;
    setError(null);
    setDraft("");
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: "user", content }]);

    startTransition(async () => {
      const result = await sendCoachMessage(content);
      if (result.error) {
        setError(result.error);
        return;
      }
      setRemainingUsed((prev) => prev + 1);
      setMessages((prev) => [
        ...prev,
        { id: `local-${Date.now()}-r`, role: "assistant", content: result.reply! },
      ]);
    });
  }

  return (
    <div className="flex h-[560px] flex-col rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="text-sm font-medium text-ink">Votre conseiller</p>
        {limit !== null ? (
          <span className="text-xs text-ink-secondary">
            {remaining} / {limit} questions restantes ce mois-ci
          </span>
        ) : (
          <span className="text-xs text-ink-secondary">Questions illimitées</span>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            Posez votre première question : sur votre positionnement, vos contenus ou votre stratégie.
          </p>
        ) : null}
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
        {isPending ? (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl border border-line bg-paper px-4 py-2.5 text-sm text-ink-secondary">
              Le conseiller réfléchit…
            </div>
          </div>
        ) : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </div>

      <div className="flex items-end gap-2 border-t border-line p-3">
        <Textarea
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={limitReached ? "Limite mensuelle atteinte" : "Posez votre question…"}
          className="resize-none"
          disabled={limitReached}
        />
        <Button size="md" onClick={handleSend} disabled={isPending || limitReached || !draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
