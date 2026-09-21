import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadCaptureForm } from "@/components/capter/lead-capture-form";

const TYPE_LABEL: Record<string, string> = {
  Checklist: "Checklist gratuite",
  "Guide PDF": "Guide gratuit",
  "Mini-formation": "Mini-formation gratuite",
};

export default async function LeadMagnetCapturePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("get_public_lead_magnet", { p_id: id });
  const magnet = data?.[0];
  if (!magnet) notFound();

  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-4 py-16">
      <div className="w-full max-w-sm">
        <p
          className="mb-2 text-center text-xs font-medium uppercase tracking-wide"
          style={{ color: magnet.brand_color }}
        >
          {TYPE_LABEL[magnet.type] ?? magnet.type}
        </p>
        <h1 className="mb-1 text-center font-serif text-2xl text-ink">{magnet.title}</h1>
        <p className="mb-6 text-center text-sm text-ink-secondary">
          Proposé par {magnet.org_name}. Laissez votre email pour le recevoir.
        </p>

        <LeadCaptureForm magnetId={magnet.id} brandColor={magnet.brand_color} />
      </div>
    </div>
  );
}
