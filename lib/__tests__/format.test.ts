import { describe, expect, it } from "vitest";
import { buildLocationShort, formatPrice, slugify } from "@/lib/format";

describe("format", () => {
  it("slugify normaliza título para slug", () => {
    expect(slugify("Mansão Horizon Glass")).toBe("mansao-horizon-glass");
    expect(slugify("  Apartamento #101  ")).toBe("apartamento-101");
  });

  it("formatPrice formata em BRL", () => {
    expect(formatPrice(850000)).toContain("850");
    expect(formatPrice(850000)).toContain("R$");
  });

  it("buildLocationShort monta localização curta", () => {
    expect(buildLocationShort("Centro", "Curitiba", "PR")).toBe("Curitiba / PR");
    expect(buildLocationShort("Centro", "Curitiba")).toBe("Centro, Curitiba");
  });
});
