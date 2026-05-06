type Stat = {
  label: string;
  value: string | number;
  accent?: boolean;
};

export function StatBar({ stats }: { stats: Stat[] }) {
  return (
    <dl className="mt-8 flex flex-wrap items-baseline gap-x-12 gap-y-4">
      {stats.map((s) => (
        <div key={s.label} className="space-y-1">
          <dd
            className={
              "font-data text-[28px] font-medium leading-none sm:text-[32px] " +
              (s.accent ? "text-primary" : "text-foreground")
            }
          >
            {s.value}
          </dd>
          <dt className="font-data text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {s.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
