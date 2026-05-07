import Link from "next/link";
import type { DecadeBucket } from "@/lib/works";

type Props = {
  decades: DecadeBucket[];
  active: string | null;
  /** Search query string to preserve when navigating between decades. */
  preserve?: Record<string, string | undefined>;
};

export function DecadeScrubber({ decades, active, preserve }: Props) {
  if (decades.length === 0) return null;
  const max = Math.max(...decades.map((d) => d.count));

  // Continuous range from earliest to latest decade — fill gaps with zeros so
  // the bar is monotonic in time.
  const start = decades[0].sortKey;
  const end = decades[decades.length - 1].sortKey;
  const filled: DecadeBucket[] = [];
  for (let y = start; y <= end; y += 10) {
    const hit = decades.find((d) => d.sortKey === y);
    filled.push(
      hit ?? { decade: `${y}s`, count: 0, sortKey: y }
    );
  }

  const baseQuery = new URLSearchParams();
  if (preserve) {
    for (const [k, v] of Object.entries(preserve)) {
      if (k === "decade") continue;
      if (v) baseQuery.set(k, v);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Decade
        </p>
        {active ? (
          <Link
            href={`/?${baseQuery.toString()}`}
            className="font-data text-[10px] uppercase tracking-[0.18em] text-primary hover:underline"
          >
            Clear ✕
          </Link>
        ) : null}
      </div>
      <div
        role="group"
        aria-label="Filter by decade"
        className="grid items-end gap-px"
        style={{
          gridTemplateColumns: `repeat(${filled.length}, minmax(0, 1fr))`,
        }}
      >
        {filled.map((d) => {
          const isActive = active === d.decade;
          const params = new URLSearchParams(baseQuery);
          if (!isActive) params.set("decade", d.decade);
          const href = `/?${params.toString()}`;
          const heightPct = max ? Math.max(8, Math.round((d.count / max) * 100)) : 8;
          return (
            <Link
              key={d.sortKey}
              href={href}
              title={`${d.decade} · ${d.count} ${d.count === 1 ? "work" : "works"}`}
              aria-label={`${d.decade}, ${d.count} works`}
              className="group relative block h-28 bg-transparent sm:h-32"
            >
              <span
                className="absolute bottom-0 left-0 right-0 transition-colors"
                style={{
                  height: `${heightPct}%`,
                  background: isActive
                    ? "var(--primary)"
                    : d.count === 0
                    ? "var(--border)"
                    : "var(--muted-foreground)",
                  opacity: d.count === 0 ? 0.35 : 1,
                }}
              />
              <span
                className={
                  "pointer-events-none absolute inset-x-0 top-0 -translate-y-full pb-1 text-center font-data text-[10px] uppercase " +
                  (isActive
                    ? "text-primary"
                    : "text-muted-foreground opacity-0 group-hover:opacity-100")
                }
              >
                {d.decade}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="flex justify-between font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{filled[0]?.decade}</span>
        <span>{filled[filled.length - 1]?.decade}</span>
      </div>
    </div>
  );
}
