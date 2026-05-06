import Link from "next/link";

type Props = {
  categories: string[];
  active: string | null;
};

export function CategoryFilter({ categories, active }: Props) {
  const all = !active;
  return (
    <nav className="flex flex-wrap items-center gap-2">
      <FilterChip href="/" active={all} label="All" />
      {categories.map((c) => (
        <FilterChip
          key={c}
          href={`/?category=${encodeURIComponent(c)}`}
          active={active === c}
          label={c}
        />
      ))}
    </nav>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={
        "border px-3 py-1 text-xs uppercase tracking-[0.16em] transition-colors " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-transparent text-foreground hover:border-primary hover:text-primary")
      }
    >
      {label}
    </Link>
  );
}
