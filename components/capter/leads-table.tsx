"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  updateLeadStatus,
  generateReactivationMessage,
} from "@/app/(app)/capter/prospects/actions";
import { Download, Search, MessageSquareText, X } from "lucide-react";

const STATUSES = ["Tous", "Nouveau", "Contacté", "Client"] as const;

export type LeadRow = {
  id: string;
  name: string;
  email: string;
  status: "Nouveau" | "Contacté" | "Client";
  source: string;
  network: string | null;
  created_at: string;
};

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("Tous");
  const [rows, setRows] = useState(leads);
  const [openMessageFor, setOpenMessageFor] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(false);

  const filtered = useMemo(() => {
    return rows.filter((lead) => {
      const matchesStatus = status === "Tous" || lead.status === status;
      const matchesQuery =
        query.trim() === "" ||
        lead.name.toLowerCase().includes(query.toLowerCase()) ||
        lead.email.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [rows, query, status]);

  async function handleStatusChange(id: string, next: LeadRow["status"]) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    await updateLeadStatus(id, next);
  }

  async function handleMessage(id: string) {
    setOpenMessageFor(id);
    setMessage(null);
    setLoadingMessage(true);
    const result = await generateReactivationMessage(id);
    setLoadingMessage(false);
    setMessage(result.message ?? result.error ?? "Une erreur est survenue.");
  }

  function handleExportCsv() {
    const header = ["Nom", "Email", "Origine", "Réseau", "Date", "Statut"];
    const csvRows = filtered.map((lead) => [
      lead.name,
      lead.email,
      lead.source,
      lead.network ?? "",
      formatDate(lead.created_at),
      lead.status,
    ]);
    const csv = [header, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "prospects.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un prospect…"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}
          className="w-40"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Button variant="secondary" size="sm" onClick={handleExportCsv}>
          <Download className="h-4 w-4" />
          Exporter en CSV
        </Button>
      </div>

      {openMessageFor ? (
        <div className="mb-4 rounded-2xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Message de relance proposé</p>
            <button onClick={() => setOpenMessageFor(null)} aria-label="Fermer" type="button">
              <X className="h-4 w-4 text-ink-secondary" />
            </button>
          </div>
          <p className="text-sm text-ink-secondary">
            {loadingMessage ? "Génération en cours…" : message}
          </p>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-secondary">
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Origine</th>
              <th className="px-4 py-3 font-medium">Réseau</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{lead.name}</p>
                  <p className="text-xs text-ink-secondary">{lead.email}</p>
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 text-ink-secondary">
                  {lead.source}
                </td>
                <td className="px-4 py-3 text-ink-secondary">{lead.network ?? "—"}</td>
                <td className="px-4 py-3 text-ink-secondary">{formatDate(lead.created_at)}</td>
                <td className="px-4 py-3">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadRow["status"])}
                    className="rounded-full border border-line bg-paper px-2 py-1 text-xs text-ink"
                  >
                    <option value="Nouveau">Nouveau</option>
                    <option value="Contacté">Contacté</option>
                    <option value="Client">Client</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleMessage(lead.id)}
                    className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink"
                    type="button"
                  >
                    <MessageSquareText className="h-3.5 w-3.5" />
                    Relance
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-secondary">
                  Aucun prospect ne correspond à votre recherche.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
