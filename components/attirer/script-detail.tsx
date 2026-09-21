"use client";

import { useState } from "react";
import { Prompter } from "@/components/attirer/prompter";
import { Button } from "@/components/ui/button";
import { Presentation } from "lucide-react";

export function ScriptDetail({
  hook,
  body,
  cta,
}: {
  hook: string;
  body: string;
  cta: string;
}) {
  const [open, setOpen] = useState(false);
  const fullText = [hook, body, cta].join("\n\n");

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Presentation className="h-4 w-4" />
        Ouvrir le prompteur
      </Button>
      {open ? <Prompter text={fullText} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
