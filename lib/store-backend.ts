import { ensureDbReady, useMemoryInDev } from "@/lib/db";

type Backend = "memory" | "db";

let resolvedBackend: Backend | null = null;

export async function usingMemoryStore(): Promise<boolean> {
  if (resolvedBackend === "memory") return true;
  if (resolvedBackend === "db") return false;

  if (useMemoryInDev()) {
    resolvedBackend = "memory";
    return true;
  }

  try {
    await ensureDbReady();
    resolvedBackend = "db";
    return false;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Valora] Banco indisponível — usando armazenamento em memória.", error);
      resolvedBackend = "memory";
      return true;
    }
    throw error;
  }
}

export function resetStoreBackend() {
  resolvedBackend = null;
}
