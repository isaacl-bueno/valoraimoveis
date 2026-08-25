"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type FavoriteProperty,
  readFavoritesFromStorage,
  writeFavoritesToStorage,
} from "@/lib/favorites";

type FavoritesContextValue = {
  favorites: FavoriteProperty[];
  ready: boolean;
  count: number;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (property: FavoriteProperty) => void;
  removeFavorite: (slug: string) => void;
  clearFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFavorites(readFavoritesFromStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeFavoritesToStorage(favorites);
  }, [favorites, ready]);

  const isFavorite = useCallback(
    (slug: string) => favorites.some((item) => item.slug === slug),
    [favorites],
  );

  const toggleFavorite = useCallback((property: FavoriteProperty) => {
    setFavorites((current) => {
      const exists = current.some((item) => item.slug === property.slug);
      if (exists) return current.filter((item) => item.slug !== property.slug);
      return [property, ...current];
    });
  }, []);

  const removeFavorite = useCallback((slug: string) => {
    setFavorites((current) => current.filter((item) => item.slug !== slug));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      ready,
      count: favorites.length,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [favorites, ready, isFavorite, toggleFavorite, removeFavorite, clearFavorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
