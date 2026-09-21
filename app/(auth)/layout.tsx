import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex justify-center py-8">
        <Link href="/">
          <Logo size="lg" />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16">
        <div className="w-full max-w-sm animate-fade-up">{children}</div>
      </main>
      <footer className="flex justify-center gap-4 pb-8 text-xs text-ink-secondary">
        <Link href="/mentions-legales" className="hover:text-ink">
          Mentions légales
        </Link>
        <Link href="/confidentialite" className="hover:text-ink">
          Confidentialité
        </Link>
        <Link href="/cgu" className="hover:text-ink">
          CGU
        </Link>
        <Link href="/cgv" className="hover:text-ink">
          CGV
        </Link>
      </footer>
    </div>
  );
}
