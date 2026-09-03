import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetStoreBackend, usingMemoryStore } from "@/lib/store-backend";

describe("store-backend", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetStoreBackend();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    resetStoreBackend();
  });

  it("usa arquivo quando banco não está configurado", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_URL_UNPOOLED;
    delete process.env.DB_HOST;
    delete process.env.DB_USER;
    delete process.env.DB_NAME;
    delete process.env.DB_PROVIDER;
    delete process.env.USE_MEMORY_DB;

    await expect(usingMemoryStore()).resolves.toBe(true);
  });

  it("usa arquivo quando USE_MEMORY_DB=true", async () => {
    process.env.USE_MEMORY_DB = "true";
    await expect(usingMemoryStore()).resolves.toBe(true);
  });
});
