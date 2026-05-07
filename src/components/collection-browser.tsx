"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { WorkCard } from "@/components/work-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchAndSort, type DecadeBucket, type Work } from "@/lib/works";

const SORT_OPTIONS = [
  { value: "default", label: "Curator order" },
  { value: "color", label: "Color of Maine (hue)" },
  { value: "year-desc", label: "Year — newest first" },
  { value: "year-asc", label: "Year — oldest first" },
  { value: "artist", label: "Artist (A→Z)" },
  { value: "title", label: "Title (A→Z)" },
];

type Props = {
  works: Work[];
  categories: string[];
  decades: DecadeBucket[];
  initial: {
    q?: string;
    sort?: string;
    category?: string;
    decade?: string;
    artist?: string;
  };
};

export function CollectionBrowser({ works, categories, decades, initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = useState(initial.q ?? "");
  const [sort, setSort] = useState(initial.sort ?? "default");
  const [category, setCategory] = useState<string | null>(initial.category ?? null);
  const [decade, setDecade] = useState<string | null>(initial.decade ?? null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const artist = initial.artist ?? null;

  // In-memory filter on every keystroke. No round-trip.
  const filtered = useMemo(
    () =>
      searchAndSort(works, {
        q: q || undefined,
        sort,
        category: category || undefined,
        decade: decade || undefined,
        artist: artist || undefined,
      }),
    [works, q, sort, category, decade, artist]
  );

  // Sync state → URL with a 300ms debounce so the address bar stays shareable
  // without thrashing history while the user types.
  useEffect(() => {
    const handle = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      const setOrDelete = (key: string, val: string | null | undefined, fallback?: string) => {
        if (val && val !== fallback) next.set(key, val);
        else next.delete(key);
      };
      setOrDelete("q", q || null);
      setOrDelete("sort", sort, "default");
      setOrDelete("category", category);
      setOrDelete("decade", decade);
      setOrDelete("artist", artist);
      const qs = next.toString();
      const target = qs ? `${pathname}?${qs}` : pathname;
      router.replace(target, { scroll: false });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sort, category, decade, artist]);

  const total = works.length;
  const showingCount = filtered.length;
  const hasFilter = Boolean(q) || Boolean(category) || Boolean(decade) || Boolean(artist);
  const activeFilterCount = [category, decade, artist].filter(Boolean).length;
  const showFullFilters = filtersOpen || !hasFilter;

  return (
    <div className="space-y-5">
      <div className="sticky top-[52px] z-30 -mx-4 border-y border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:-mx-6 sm:px-6 sm:py-4 lg:top-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
              {hasFilter ? `${showingCount} of ${total}` : `${total} works`}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                className="inline-flex h-8 items-center gap-2 border border-border px-3 font-data text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:border-foreground hover:text-foreground"
                aria-expanded={showFullFilters}
              >
                <SlidersHorizontal className="size-3.5" />
                Filters{activeFilterCount ? ` ${activeFilterCount}` : ""}
              </button>
              {hasFilter ? (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setCategory(null);
                    setDecade(null);
                    setSort("default");
                    setFiltersOpen(false);
                  }}
                  className="font-data text-[10px] uppercase tracking-[0.18em] text-primary hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${total} works — title, artist, medium…`}
                className="pl-9"
                aria-label="Search works"
              />
              {q ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-primary"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:inline">
                Sort
              </span>
              <Select value={sort} onValueChange={(v) => setSort(v || "default")}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasFilter ? (
            <ActiveFilters
              category={category}
              decade={decade}
              artist={artist}
              onClearCategory={() => setCategory(null)}
              onClearDecade={() => setDecade(null)}
            />
          ) : null}

          {showFullFilters ? (
            <div className="space-y-3 border-t border-border pt-3">
              <CategoryPills
                categories={categories}
                active={category}
                onSelect={setCategory}
              />

              <DecadeScrubberLive
                decades={decades}
                active={decade}
                onSelect={setDecade}
              />
            </div>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((work) => (
            <li key={work.id}>
              <WorkCard work={work} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActiveFilters({
  category,
  decade,
  artist,
  onClearCategory,
  onClearDecade,
}: {
  category: string | null;
  decade: string | null;
  artist: string | null;
  onClearCategory: () => void;
  onClearDecade: () => void;
}) {
  if (!category && !decade && !artist) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {category ? (
        <ActiveChip label={category} onClear={onClearCategory} />
      ) : null}
      {decade ? <ActiveChip label={decade} onClear={onClearDecade} /> : null}
      {artist ? <ActiveChip label={artist} /> : null}
    </div>
  );
}

function ActiveChip({
  label,
  onClear,
}: {
  label: string;
  onClear?: () => void;
}) {
  return (
    <span className="inline-flex h-7 items-center gap-2 border border-primary/45 px-2.5 font-data text-[10px] uppercase tracking-[0.14em] text-primary">
      {label}
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          aria-label={`Clear ${label}`}
          className="text-primary/70 hover:text-primary"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </span>
  );
}

function CategoryPills({
  categories,
  active,
  onSelect,
}: {
  categories: string[];
  active: string | null;
  onSelect: (next: string | null) => void;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="pill"
        data-active={!active ? "true" : "false"}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          type="button"
          key={c}
          className="pill"
          data-active={active === c ? "true" : "false"}
          onClick={() => onSelect(active === c ? null : c)}
        >
          {c}
        </button>
      ))}
    </nav>
  );
}

function DecadeScrubberLive({
  decades,
  active,
  onSelect,
}: {
  decades: DecadeBucket[];
  active: string | null;
  onSelect: (next: string | null) => void;
}) {
  if (decades.length === 0) return null;
  const max = Math.max(...decades.map((d) => d.count));
  const start = decades[0].sortKey;
  const end = decades[decades.length - 1].sortKey;
  const filled: DecadeBucket[] = [];
  for (let y = start; y <= end; y += 10) {
    const hit = decades.find((d) => d.sortKey === y);
    filled.push(hit ?? { decade: `${y}s`, count: 0, sortKey: y });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Decade
        </p>
        {active ? (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="font-data text-[10px] uppercase tracking-[0.18em] text-primary hover:underline"
          >
            Clear ✕
          </button>
        ) : null}
      </div>
      <div
        role="group"
        aria-label="Filter by decade"
        className="grid items-end gap-px"
        style={{ gridTemplateColumns: `repeat(${filled.length}, minmax(0, 1fr))` }}
      >
        {filled.map((d) => {
          const isActive = active === d.decade;
          const heightPct = max ? Math.max(8, Math.round((d.count / max) * 100)) : 8;
          return (
            <button
              type="button"
              key={d.sortKey}
              onClick={() => onSelect(isActive ? null : d.decade)}
              title={`${d.decade} · ${d.count} ${d.count === 1 ? "work" : "works"}`}
              aria-label={`${d.decade}, ${d.count} works`}
              aria-pressed={isActive}
              className="group relative block h-16 cursor-pointer bg-transparent sm:h-24"
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
            </button>
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

function EmptyState() {
  return (
    <div className="border border-dashed border-border p-12 text-center">
      <h2 className="font-headline text-2xl">No matches</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Try a different search term or clear the filters.
      </p>
    </div>
  );
}
