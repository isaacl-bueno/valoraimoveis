import { ensureDbReady, isDatabaseConfigured } from "@/lib/db";

type Backend = "memory" | "db";

let resolvedBackend: Backend | null = null;

/** Usa arquivo/ memória quando não há banco configurado (Vercel sem Neon, dev local). */
export async function usingMemoryStore(): Promise<boolean> {
  if (resolvedBackend === "memory") return true;
  if (resolvedBackend === "db") return false;

  if (process.env.USE_MEMORY_DB === "true" || !isDatabaseConfigured()) {
    resolvedBackend = "memory";
    return true;
  }

  try {
    await ensureDbReady();
    resolvedBackend = "db";
    return false;
  } catch (error) {
    console.warn("[Valora] Banco indisponível — usando armazenamento em arquivo.", error);
    resolvedBackend = "memory";
    return true;
  }
}

export function resetStoreBackend() {
  resolvedBackend = null;
}
