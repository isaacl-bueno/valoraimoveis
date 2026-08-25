export type FavoriteProperty = {
  slug: string;
  title: string;
  location: string;
  priceLabel: string;
  image: string;
  ref: string;
};

export const FAVORITES_STORAGE_KEY = "valora_favorites";

export function readFavoritesFromStorage(): FavoriteProperty[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FavoriteProperty[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.slug === "string" && typeof item.title === "string",
    );
  } catch {
    return [];
  }
}

export function writeFavoritesToStorage(items: FavoriteProperty[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
}
