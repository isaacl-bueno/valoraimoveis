import { describe, expect, it } from "vitest";
import { formatCep, normalizeCep } from "@/lib/cep";

describe("cep", () => {
  it("normaliza e formata CEP", () => {
    expect(normalizeCep("80.060-000")).toBe("80060000");
    expect(formatCep("80060000")).toBe("80060-000");
  });
});
