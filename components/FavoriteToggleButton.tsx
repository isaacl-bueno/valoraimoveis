"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/components/FavoritesProvider";
import type { FavoriteProperty } from "@/lib/favorites";

type FavoriteToggleButtonProps = {
  property: FavoriteProperty;
  className?: string;
  label?: boolean;
};

export function FavoriteToggleButton({
  property,
  className = "",
  label = true,
}: FavoriteToggleButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.slug);

  return (
    <button
      type="button"
      className={`flex items-center gap-2 text-xs font-bold transition-colors ${
        favorited ? "text-orange" : "text-ink hover:text-brand"
      } ${className}`}
      onClick={() => toggleFavorite(property)}
    >
      <Heart className={`h-4 w-4 ${favorited ? "fill-orange" : ""}`} />
      {label ? (favorited ? "Favoritado" : "Favoritar") : null}
    </button>
  );
}
