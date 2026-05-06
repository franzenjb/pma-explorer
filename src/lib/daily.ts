import dailyJson from "../../data/daily.json";

export type DailyEntry = {
  date: string;
  work_id: string;
  essay: string;
  generated_at: string;
  generated_by: "anthropic" | "placeholder";
};

const data = dailyJson as Record<string, DailyEntry>;

export function getDaily(date: string): DailyEntry | null {
  return data[date] ?? null;
}

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function listDailyDates(): string[] {
  return Object.keys(data).sort();
}

export function neighborDates(date: string): { prev: string | null; next: string | null } {
  const dates = listDailyDates();
  const i = dates.indexOf(date);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? dates[i - 1] : null,
    next: i < dates.length - 1 ? dates[i + 1] : null,
  };
}
