"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Pause, Play, FlipHorizontal, X, Type } from "lucide-react";

export function Prompter({
  text,
  onClose,
}: {
  text: string;
  onClose: () => void;
}) {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(3);
  const [mirror, setMirror] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    let raf: number;
    const step = () => {
      const el = containerRef.current;
      if (el) {
        el.scrollTop += speed * 0.4;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink text-paper">
      <div
        ref={containerRef}
        className={cn(
          "flex-1 overflow-y-auto px-8 py-24 text-center",
          mirror && "scale-x-[-1]",
        )}
      >
        <p
          className={cn(
            "mx-auto max-w-2xl font-serif leading-relaxed",
            largeText ? "text-5xl" : "text-3xl",
          )}
        >
          {text}
        </p>
        <div className="h-[60vh]" />
      </div>

      <div className="flex items-center justify-center gap-3 border-t border-paper/10 bg-ink px-4 py-4">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald text-emerald-ink"
          aria-label={playing ? "Pause" : "Lecture"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <label className="flex items-center gap-2 text-xs text-paper/70">
          Vitesse
          <input
            type="range"
            min={1}
            max={8}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="accent-emerald"
          />
        </label>

        <button
          onClick={() => setMirror((m) => !m)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-paper/20",
            mirror && "bg-paper/10",
          )}
          aria-label="Effet miroir"
          title="Effet miroir"
        >
          <FlipHorizontal className="h-4 w-4" />
        </button>

        <button
          onClick={() => setLargeText((v) => !v)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-paper/20",
            largeText && "bg-paper/10",
          )}
          aria-label="Agrandir le texte"
          title="Agrandir le texte"
        >
          <Type className="h-4 w-4" />
        </button>

        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/20"
          aria-label="Fermer le prompteur"
          title="Fermer (Échap)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
