import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
  { href: "/cgv", label: "CGV" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="flex gap-4 text-xs text-ink-secondary">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-ink">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <article className="flex flex-col gap-4 text-sm leading-relaxed text-ink-secondary [&_h1]:font-serif [&_h1]:text-3xl [&_h1]:text-ink [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-4 [&_li]:list-disc [&_p]:leading-relaxed [&_strong]:text-ink">
          {children}
        </article>
      </main>
    </div>
  );
}
