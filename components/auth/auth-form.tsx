"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import Link from "next/link";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState<"password" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("password");
    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        setError(traduireErreur(error.message));
        setLoading(null);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(traduireErreur(error.message));
        setLoading(null);
        return;
      }
    }

    router.push(next);
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    setLoading("google");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(traduireErreur(error.message));
      setLoading(null);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h1 className="font-serif text-2xl text-ink">
        {mode === "login" ? (
          <>Ravis de vous <em>retrouver</em></>
        ) : (
          <>Bienvenue dans votre <em>atelier</em></>
        )}
      </h1>
      <p className="mt-1 text-sm text-ink-secondary">
        {mode === "login"
          ? "Connectez-vous pour retrouver votre positionnement, vos contenus et vos prospects."
          : "Créez votre compte. 14 jours d'essai Business, sans carte bancaire."}
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== null}
        className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-full border border-line bg-paper text-sm font-medium text-ink transition-colors hover:border-ink/30 disabled:opacity-40"
      >
        Continuer avec Google
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-ink-secondary">ou avec votre email</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" ? (
          <Field label="Votre nom">
            <Input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Camille Dubois"
              autoComplete="name"
            />
          </Field>
        ) : null}
        <Field label="Email">
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.fr"
            autoComplete="email"
          />
        </Field>
        <Field label="Mot de passe">
          <Input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" size="lg" disabled={loading !== null} className="mt-1 w-full">
          {loading === "password"
            ? "Un instant…"
            : mode === "login"
              ? "Se connecter"
              : "Créer mon compte"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-secondary">
        {mode === "login" ? (
          <>Pas encore de compte ? <Link href="/signup" className="font-medium text-emerald">Créer un compte</Link></>
        ) : (
          <>Déjà un compte ? <Link href="/login" className="font-medium text-emerald">Se connecter</Link></>
        )}
      </p>
    </div>
  );
}

function traduireErreur(message: string) {
  if (message.includes("Invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (message.includes("User already registered")) {
    return "Un compte existe déjà avec cet email.";
  }
  return "Une erreur est survenue. Merci de réessayer.";
}
