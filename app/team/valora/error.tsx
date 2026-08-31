"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function TeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Valora Admin]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl border border-line bg-white p-8 shadow-sm space-y-5 text-center">
        <p className="text-xs uppercase tracking-[.18em] text-brand font-bold">Área da equipe</p>
        <h1 className="h-display text-3xl text-ink">Não foi possível carregar o painel</h1>
        <p className="text-sm text-muted leading-relaxed">
          {error.message ||
            "Verifique se o banco de dados está configurado corretamente no arquivo .env.local."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button type="button" onClick={reset}>
            Tentar novamente
          </Button>
          <Button asChild variant="outline">
            <Link href="/team/valora/login">Voltar ao login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
