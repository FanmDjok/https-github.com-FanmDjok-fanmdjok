import { Badge } from "@/components/ui/badge";

const TONE = {
  Nouveau: "neutral",
  Contacté: "warning",
  Client: "emerald",
} as const;

export function LeadStatusBadge({ status }: { status: keyof typeof TONE }) {
  return <Badge tone={TONE[status]}>{status}</Badge>;
}
