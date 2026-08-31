import { describe, expect, it } from "vitest";
import { sampleProperties } from "@/lib/__tests__/fixtures";
import {
  buildHeroFilterOptions,
  buildImoveisHref,
  buildListFilterOptions,
  categoryHref,
  describeActiveFilters,
  filterProperties,
  hasActiveFilters,
  normalizeSortOption,
  parseMinPlus,
  sortProperties,
} from "@/lib/property-filters";

describe("property-filters", () => {
  const published = sampleProperties.filter((item) => item.status === "Publicado");

  it("buildHeroFilterOptions usa dados reais dos imóveis", () => {
    const options = buildHeroFilterOptions(published);
    expect(options.types.map((item) => item.value)).toEqual(["Apartamento", "Casa"]);
    expect(options.locations).toHaveLength(2);
    expect(options.refs).toEqual(["VAL-001", "VAL-002"]);
  });

  it("buildListFilterOptions extrai cidades e bairros", () => {
    const options = buildListFilterOptions(published);
    expect(options.cities.map((item) => item.value)).toContain("Curitiba");
    expect(options.neighborhoods.map((item) => item.value)).toContain("Centro");
  });

  it("filterProperties filtra por tipo", () => {
    const result = filterProperties(published, { tipo: "Casa" });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("casa-centro-curitiba");
  });

  it("filterProperties filtra por cidade e bairro", () => {
    const result = filterProperties(published, { cidade: "Curitiba", bairro: "Batel" });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("apto-batel");
  });

  it("filterProperties filtra por faixa de preço da hero", () => {
    const result = filterProperties(published, { preco: "0-1000000" });
    expect(result).toHaveLength(1);
    expect(result[0].ref).toBe("VAL-001");
  });

  it("filterProperties filtra por preço mínimo e máximo", () => {
    const result = filterProperties(published, { precoMin: "900000", precoMax: "1300000" });
    expect(result).toHaveLength(1);
    expect(result[0].ref).toBe("VAL-002");
  });

  it("filterProperties filtra por quartos, banheiros e vagas", () => {
    expect(filterProperties(published, { quartos: "3+" })).toHaveLength(1);
    expect(filterProperties(published, { banheiros: "3+" })[0].ref).toBe("VAL-002");
    expect(filterProperties(published, { vagas: "2+" })[0].ref).toBe("VAL-001");
  });

  it("filterProperties filtra por área", () => {
    const result = filterProperties(published, { areaMin: "150", areaMax: "200" });
    expect(result).toHaveLength(1);
    expect(result[0].ref).toBe("VAL-001");
  });

  it("filterProperties filtra por referência", () => {
    const result = filterProperties(published, { ref: "val-002" });
    expect(result).toHaveLength(1);
    expect(result[0].ref).toBe("VAL-002");
  });

  it("sortProperties ordena por preço e data", () => {
    expect(sortProperties(published, "menor-preco").map((item) => item.ref)).toEqual([
      "VAL-001",
      "VAL-002",
    ]);
    expect(sortProperties(published, "maior-preco").map((item) => item.ref)).toEqual([
      "VAL-002",
      "VAL-001",
    ]);
    expect(sortProperties(published, "recentes")[0].ref).toBe("VAL-002");
  });

  it("buildImoveisHref monta URL de filtros", () => {
    expect(buildImoveisHref({ tipo: "Casa", quartos: "3+" })).toBe(
      "/imoveis?tipo=Casa&quartos=3%2B",
    );
  });

  it("categoryHref vincula categorias da home ao tipo", () => {
    expect(categoryHref("Casas")).toBe("/imoveis?tipo=Casa");
    expect(categoryHref("Apartamentos")).toBe("/imoveis?tipo=Apartamento");
  });

  it("hasActiveFilters e describeActiveFilters", () => {
    const params = { tipo: "Casa", quartos: "2+" };
    expect(hasActiveFilters(params)).toBe(true);
    expect(describeActiveFilters(params)).toEqual(["Casa", "2+ quartos"]);
  });

  it("parseMinPlus interpreta valores com +", () => {
    expect(parseMinPlus("3+")).toBe(3);
    expect(parseMinPlus(undefined)).toBeNull();
  });

  it("normalizeSortOption usa recentes como padrão", () => {
    expect(normalizeSortOption(undefined)).toBe("recentes");
    expect(normalizeSortOption("invalid")).toBe("recentes");
    expect(normalizeSortOption("menor-preco")).toBe("menor-preco");
  });
});
