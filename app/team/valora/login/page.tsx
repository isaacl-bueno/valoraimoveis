import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function TeamLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
          Carregando...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
