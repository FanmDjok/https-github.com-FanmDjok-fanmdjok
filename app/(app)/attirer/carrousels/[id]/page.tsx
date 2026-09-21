import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CarouselDetail } from "@/components/attirer/carousel-detail";
import { ArrowLeft } from "lucide-react";

export default async function CarouselPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: carousel } = await supabase
    .from("carousels")
    .select("id, title, caption, slides")
    .eq("id", id)
    .maybeSingle();

  if (!carousel) notFound();

  return (
    <div className="animate-fade-up">
      <Link
        href="/attirer/carrousels"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tous les carrousels
      </Link>

      <CarouselDetail title={carousel.title} caption={carousel.caption} slides={carousel.slides} />
    </div>
  );
}
