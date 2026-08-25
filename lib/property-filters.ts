import { formatPrice } from "@/lib/format";
import type { Property } from "@/lib/types";

export type FilterOption = {
  value: string;
  label: string;
};

export type HeroFilterOptions = {
  locations: FilterOption[];
  types: FilterOption[];
  prices: FilterOption[];
  refs: string[];
};

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export function buildHeroFilterOptions(properties: Property[]): HeroFilterOptions {
  const locations = uniqueSorted(
    properties.map((item) => {
      const parts = [item.neighborhood, item.city].filter(Boolean);
      return parts.join(", ") || item.location;
    }),
  ).map((label) => ({ value: label, label }));

  const types = uniqueSorted(properties.map((item) => item.type)).map((label) => ({
    value: label,
    label,
  }));

  const prices = properties.map((item) => item.price).filter((price) => price > 0);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;

  const priceBands: FilterOption[] = [];
  if (prices.length) {
    if (min < 1_000_000) {
      priceBands.push({ value: "0-1000000", label: "Até R$ 1 milhão" });
    }
    if (max >= 1_000_000 && min < 5_000_000) {
      priceBands.push({ value: "1000000-5000000", label: "R$ 1M – R$ 5M" });
    }
    if (max >= 5_000_000) {
      priceBands.push({ value: "5000000+", label: `Acima de R$ 5M` });
    }
    // Always include a band covering the actual max if none matched oddly
    if (!priceBands.length) {
      priceBands.push({
        value: `0-${max}`,
        label: `Até ${formatPrice(max)}`,
      });
    }
  }

  return {
    locations,
    types,
    prices: priceBands,
    refs: uniqueSorted(properties.map((item) => item.ref)),
  };
}

export type PropertySearchParams = {
  intent?: string;
  onde?: string;
  tipo?: string;
  preco?: string;
  ref?: string;
};

export function filterProperties(properties: Property[], params: PropertySearchParams) {
  const onde = params.onde?.trim().toLowerCase() || "";
  const tipo = params.tipo?.trim().toLowerCase() || "";
  const ref = params.ref?.trim().toLowerCase() || "";
  const preco = params.preco?.trim() || "";

  return properties.filter((item) => {
    const locationLabel = [item.neighborhood, item.city].filter(Boolean).join(", ");
    const matchesLocation =
      !onde ||
      locationLabel.toLowerCase() === onde ||
      item.location.toLowerCase() === onde ||
      item.city.toLowerCase() === onde ||
      item.neighborhood.toLowerCase() === onde;

    const matchesType =
      !tipo || item.type.toLowerCase() === tipo || item.typeLabel.toLowerCase() === tipo;
    const matchesRef =
      !ref || item.ref.toLowerCase().includes(ref) || item.slug.toLowerCase().includes(ref);

    let matchesPrice = true;
    if (preco) {
      if (preco.endsWith("+")) {
        const minPrice = Number(preco.replace("+", ""));
        matchesPrice = item.price >= minPrice;
      } else if (preco.includes("-")) {
        const [minRaw, maxRaw] = preco.split("-");
        const minPrice = Number(minRaw);
        const maxPrice = Number(maxRaw);
        matchesPrice = item.price >= minPrice && item.price <= maxPrice;
      }
    }

    return matchesLocation && matchesType && matchesRef && matchesPrice;
  });
}
