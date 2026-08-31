"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { TEAM_BASE, TEAM_IMOVIES } from "@/lib/routes";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@valoraimoveis.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Não foi possível entrar.");
        return;
      }

      const next = searchParams.get("next") || TEAM_IMOVIES;
      router.replace(next.startsWith(TEAM_BASE) ? next : TEAM_IMOVIES);
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <section className="hidden lg:block relative overflow-hidden">
        <Image
          className="object-cover"
          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_d8d2c050c7_f70fd936a6c8d943.png"
          alt=""
          fill
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-ink/45" />
        <Link href="/" className="absolute left-12 top-12">
          <Image
            src="/Logovalorawhite.png"
            alt="Valora Imóveis"
            width={180}
            height={40}
            className="h-10 w-auto object-contain"
          />
        </Link>
        <div className="absolute left-12 right-12 bottom-14 text-white">
          <p className="text-xs uppercase tracking-[.22em] font-bold mb-4">Área restrita</p>
          <h1 className="h-display text-5xl max-w-lg">Gestão simples para boas oportunidades.</h1>
        </div>
      </section>
      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <span className="text-xs uppercase tracking-[.2em] text-brand font-bold">
              Valora Imóveis
            </span>
            <h2 className="h-display text-4xl mt-3">Acesso da equipe</h2>
            <p className="text-muted mt-3">Entre para gerenciar os imóveis publicados.</p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@valoraimoveis.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="border-white border-t-transparent" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          <p className="text-center text-xs text-muted mt-10">
            Acesso exclusivo para a equipe Valora.
          </p>
        </div>
      </section>
    </div>
  );
}
