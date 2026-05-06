import file from "../../data/conversations.json";
import { findWork, type Work } from "@/lib/works";

export type Pairing = {
  week: string;
  title: string;
  subtitle: string;
  left_id: string;
  right_id: string;
  dialogue: string;
  left: Work;
  right: Work;
};

type RawPairing = Omit<Pairing, "left" | "right">;
const data = file as { pairings: RawPairing[] };

export function loadPairings(): Pairing[] {
  const out: Pairing[] = [];
  for (const p of data.pairings) {
    const left = findWork(p.left_id);
    const right = findWork(p.right_id);
    if (!left || !right) continue;
    out.push({ ...p, left, right });
  }
  return out.sort((a, b) => b.week.localeCompare(a.week));
}

export function currentPairing(): Pairing | null {
  return loadPairings()[0] ?? null;
}
