import data from "../../data/compare-narratives.json";

export type CompareNarrative = {
  ids: string[];
  narrative: string;
  related_ids?: string[];
  generated_at: string;
  generated_by: "anthropic" | "placeholder";
};

const cache = data as Record<string, CompareNarrative>;

export function slugForIds(ids: string[]): string {
  return [...ids].sort().join("+");
}

export function getCompareNarrative(ids: string[]): CompareNarrative | null {
  if (ids.length < 2 || ids.length > 4) return null;
  return cache[slugForIds(ids)] ?? null;
}
