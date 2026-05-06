"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "default", label: "Curator order" },
  { value: "color", label: "Color of Maine (hue)" },
  { value: "year-desc", label: "Year — newest first" },
  { value: "year-asc", label: "Year — oldest first" },
  { value: "artist", label: "Artist (A→Z)" },
  { value: "title", label: "Title (A→Z)" },
];

export function Toolbar({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const [q, setQ] = useState(search.get("q") ?? "");
  const sort = search.get("sort") ?? "default";

  // Debounce URL updates so typing doesn't thrash history.
  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(search.toString());
      if (q) params.set("q", q);
      else params.delete("q");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 200);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(search.toString());
      if (value && value !== "default") params.set(key, value);
      else params.delete(key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, search]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${totalCount} works — title, artist, medium…`}
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
      <div className="flex items-center gap-3">
        <span className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:inline">
          Sort
        </span>
        <Select value={sort} onValueChange={(v) => setParam("sort", v)}>
          <SelectTrigger className="w-[200px]">
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
  );
}
