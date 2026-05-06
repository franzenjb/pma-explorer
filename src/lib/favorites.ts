"use client";

const KEY = "pma-explorer:favorites";
const EVENT = "pma-explorer:favorites-changed";

export function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function isFavorite(id: string): boolean {
  return readFavorites().includes(id);
}

export function toggleFavorite(id: string): boolean {
  const cur = readFavorites();
  const idx = cur.indexOf(id);
  let next: string[];
  if (idx >= 0) {
    next = cur.filter((x) => x !== id);
  } else {
    next = [id, ...cur].slice(0, 200);
  }
  writeFavorites(next);
  return next.includes(id);
}

export function subscribeFavorites(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) handler();
  });
  return () => {
    window.removeEventListener(EVENT, handler);
  };
}
