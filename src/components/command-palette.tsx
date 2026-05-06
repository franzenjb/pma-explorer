"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Palette, GalleryThumbnails, BarChart3, Users, ArrowLeftRight, Calendar, Search as SearchIcon } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { Work } from "@/lib/works";

type Props = {
  works: Work[];
};

const NAV = [
  { label: "Collection", href: "/", icon: GalleryThumbnails },
  { label: "Color of Maine", href: "/color", icon: Palette },
  { label: "Stats", href: "/stats", icon: BarChart3 },
  { label: "Artists", href: "/artists", icon: Users },
  { label: "Compare", href: "/compare", icon: ArrowLeftRight },
  { label: "Daily Painting", href: "/daily", icon: Calendar },
];

export function CommandPalette({ works }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((s) => !s);
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  // Trim works list for command performance — first 100 by id.
  const items = useMemo(() => works.slice(0, 200), [works]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-8 items-center gap-2 border border-border bg-card px-2 font-data text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:border-foreground hover:text-foreground sm:inline-flex"
        aria-label="Open command palette"
      >
        <SearchIcon className="size-3.5" />
        <span>Search</span>
        <kbd className="ml-2 rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[10px]">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Jump to a work, artist, or page">
        <CommandInput placeholder="Search works, artists, pages…" />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>
          <CommandGroup heading="Pages">
            {NAV.map((n) => (
              <CommandItem
                key={n.href}
                value={`page ${n.label}`}
                onSelect={() => go(n.href)}
              >
                <n.icon className="size-4 text-muted-foreground" />
                <span>{n.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Works">
            {items.map((w) => (
              <CommandItem
                key={w.id}
                value={`${w.title} ${w.artist ?? ""} ${w.medium ?? ""} ${w.accession_number ?? ""}`}
                onSelect={() => go(`/work/${encodeURIComponent(w.id)}`)}
              >
                <span
                  className="size-3 shrink-0"
                  style={{ background: w.dominant_hex ?? "var(--muted)" }}
                />
                <span className="truncate">
                  <span className="font-headline italic">{w.title}</span>
                  <span className="text-muted-foreground"> · {w.artist ?? "Unknown"}{w.year ? ` · ${w.year}` : ""}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
