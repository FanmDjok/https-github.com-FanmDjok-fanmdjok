"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { disconnectAccount } from "@/app/(app)/publier/comptes/actions";

export function DisconnectButton({ accountId }: { accountId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await disconnectAccount(accountId);
          router.refresh();
        })
      }
    >
      {pending ? "…" : "Déconnecter"}
    </Button>
  );
}
