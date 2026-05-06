"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import {
  isFavorite,
  subscribeFavorites,
  toggleFavorite,
} from "@/lib/favorites";

type Props = {
  id: string;
  size?: "sm" | "md";
};

export function FavoriteButton({ id, size = "md" }: Props) {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical hydration guard
    setMounted(true);
    setActive(isFavorite(id));
    return subscribeFavorites(() => setActive(isFavorite(id)));
  }, [id]);

  const dim = size === "sm" ? "size-3.5" : "size-4";
  const px = size === "sm" ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]";
  const label = active ? "Saved" : "Save";

  return (
    <button
      type="button"
      aria-pressed={mounted ? active : undefined}
      aria-label={active ? `Remove ${id} from favorites` : `Save ${id} to favorites`}
      onClick={() => setActive(toggleFavorite(id))}
      className={
        "inline-flex items-center gap-1.5 border font-data uppercase tracking-[0.18em] transition-colors " +
        px +
        " " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary hover:text-primary")
      }
    >
      <Heart
        className={dim + (active ? " fill-current" : "")}
        strokeWidth={1.75}
      />
      <span>{label}</span>
    </button>
  );
}
