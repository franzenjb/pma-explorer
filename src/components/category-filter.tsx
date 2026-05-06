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
    <Link href={href} className="pill" data-active={active ? "true" : "false"}>
      {label}
    </Link>
  );
}
