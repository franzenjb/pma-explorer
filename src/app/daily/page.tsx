import { redirect } from "next/navigation";
import { listDailyDates, todayUTC } from "@/lib/daily";

export default function DailyIndex() {
  const dates = listDailyDates();
  const today = todayUTC();
  // Prefer today; otherwise the most recent generated date.
  const target = dates.includes(today)
    ? today
    : dates[dates.length - 1] ?? today;
  redirect(`/daily/${target}`);
}
