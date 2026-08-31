import { beforeEach, describe, expect, it } from "vitest";
import { sampleProperties } from "@/lib/__tests__/fixtures";
import * as memoryStore from "@/lib/memory-store";
import type { PropertyInput } from "@/lib/types";

describe("memory-store", () => {
  beforeEach(() => {
    memoryStore.resetMemoryStoreForTests();
    for (const property of sampleProperties) {
      memoryStore.createProperty({
        ...property,
        id: property.id,
        slug: property.slug,
      });
    }
  });

  it("lista imóveis publicados via filtro de status", () => {
    const published = memoryStore.listProperties({ publishedOnly: true });
    expect(published).toHaveLength(2);
  });

  it("busca por slug e id", () => {
    expect(memoryStore.getPropertyBySlug("apto-batel")?.title).toBe("Apartamento Batel");
    expect(memoryStore.getPropertyById("p1")?.ref).toBe("VAL-001");
  });

  it("cria imóvel com slug único", () => {
    const created = memoryStore.createProperty({
      title: "Nova Casa",
      type: "Casa",
      price: 500000,
      status: "Publicado",
      bedrooms: 2,
      suites: 1,
      bathrooms: 1,
      parking: 1,
      area: 100,
      builtArea: 90,
      landArea: 100,
      city: "Curitiba",
      neighborhood: "Centro",
      state: "PR",
    } as PropertyInput);

    expect(created.slug).toBe("nova-casa");
    expect(memoryStore.listProperties()).toHaveLength(4);
  });

  it("atualiza imóvel existente", () => {
    const updated = memoryStore.updateProperty("p1", {
      title: "Casa Atualizada",
      type: "Casa",
      price: 900000,
      status: "Publicado",
      bedrooms: 3,
      suites: 1,
      bathrooms: 2,
      parking: 2,
      area: 180,
      builtArea: 160,
      landArea: 180,
      city: "Curitiba",
      neighborhood: "Centro",
      state: "PR",
    } as PropertyInput);

    expect(updated?.title).toBe("Casa Atualizada");
    expect(updated?.priceLabel).toContain("900");
  });

  it("exclui imóvel", () => {
    expect(memoryStore.deleteProperty("p2")).toBe(true);
    expect(memoryStore.getPropertyById("p2")).toBeNull();
  });

  it("listAdminProperties retorna dados para tabela admin", () => {
    const items = memoryStore.listAdminProperties();
    expect(items[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      ref: expect.any(String),
      status: expect.any(String),
    });
  });
});
