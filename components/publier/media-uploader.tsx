"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { uploadMedia } from "@/app/(app)/publier/medias/actions";
import { Upload } from "lucide-react";

export function MediaUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await uploadMedia(formData);
      if (result.error) setError(result.error);
      else router.refresh();
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleChange}
        className="hidden"
        id="media-upload-input"
      />
      <Button size="sm" disabled={pending} onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        {pending ? "Import…" : "Importer un fichier"}
      </Button>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
