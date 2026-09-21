import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export default async function PublicLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_public_link_page", { p_slug: slug });
  const page = data?.[0];

  if (error || !page) notFound();

  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-4 py-16">
      <div
        className="h-20 w-20 shrink-0 rounded-full"
        style={{ backgroundColor: page.brand_color }}
      />
      <h1 className="mt-5 text-center text-lg font-semibold text-ink">{page.display_name}</h1>
      <p className="mt-2 max-w-sm text-center text-sm leading-relaxed text-ink-secondary">
        {page.bio}
      </p>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        {page.buttons.map((btn) => (
          <a
            key={btn.id}
            href={btn.code ? `/l/${btn.code}` : btn.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: page.brand_color }}
          >
            {btn.label}
          </a>
        ))}
      </div>

      {page.plan === "gratuit" ? (
        <Link
          href="/"
          className="mt-12 flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink"
        >
          Réalisé avec <Logo size="sm" className="text-xs" />
        </Link>
      ) : null}
    </div>
  );
}
