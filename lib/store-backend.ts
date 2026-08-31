import { ensureDbReady, isDatabaseConfigured } from "@/lib/db";

type Backend = "memory" | "db";

let resolvedBackend: Backend | null = null;

/** Com DATABASE_URL usa banco; sem banco usa arquivo local (/tmp na Vercel). */
export async function usingMemoryStore(): Promise<boolean> {
  if (resolvedBackend === "memory") return true;
  if (resolvedBackend === "db") return false;

  if (process.env.USE_MEMORY_DB === "true") {
    resolvedBackend = "memory";
    return true;
  }

  if (!isDatabaseConfigured()) {
    resolvedBackend = "memory";
    return true;
  }

  await ensureDbReady();
  resolvedBackend = "db";
  return false;
}

export function resetStoreBackend() {
  resolvedBackend = null;
}
