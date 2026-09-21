"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import { NETWORKS, type NetworkId } from "@/lib/networks";
import { formatDate } from "@/lib/utils";

export type AnalysisOption = { id: string; title: string; network: NetworkId; publishedAt: string };

export function PostAnalysisSelector({
  options,
  selectedId,
}: {
  options: AnalysisOption[];
  selectedId: string;
}) {
  const router = useRouter();

  return (
    <Select
      value={selectedId}
      onChange={(e) => router.push(`/attirer/analyse?postTargetId=${e.target.value}`)}
      className="max-w-sm"
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.title} — {NETWORKS[o.network].label} ({formatDate(o.publishedAt)})
        </option>
      ))}
    </Select>
  );
}
