import maine from "../../data/maine-locations.json";
import { findWork, type Work } from "@/lib/works";

export type MainePin = {
  work_id: string;
  place: string;
  lat: number;
  lng: number;
  note: string;
  work: Work;
};

type RawPin = Omit<MainePin, "work">;
const file = maine as { pins: RawPin[] };

export function loadMainePins(): MainePin[] {
  const out: MainePin[] = [];
  for (const p of file.pins) {
    const work = findWork(p.work_id);
    if (!work) continue;
    out.push({ ...p, work });
  }
  return out;
}
