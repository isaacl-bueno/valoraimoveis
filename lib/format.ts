export function formatArea(value: number) {
  return `${value.toLocaleString("pt-BR")}m²`;
}

export function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildLocation(neighborhood: string, city: string, state?: string) {
  const base = [neighborhood, city].filter(Boolean).join(", ");
  if (!state) return base;
  return `${neighborhood}, ${city} — ${city}, ${state}`.replace(/^,\s*/, "");
}

export function buildLocationShort(neighborhood: string, city: string, state?: string) {
  if (state) return `${city} / ${state}`;
  return [neighborhood, city].filter(Boolean).join(", ");
}
