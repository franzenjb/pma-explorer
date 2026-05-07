import Link from "next/link";
import { Dices } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/command-palette";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { MobileMenu } from "@/components/mobile-menu";
import { loadWorks } from "@/lib/works";

const NAV = [
  { href: "/", label: "Collection" },
  { href: "/color", label: "Color" },
  { href: "/map", label: "Map" },
  { href: "/artists", label: "Artists" },
  { href: "/compare", label: "Compare" },
  { href: "/daily", label: "Daily" },
  { href: "/conversation", label: "Pairing" },
  { href: "/stats", label: "Stats" },
  { href: "/my-collection", label: "Saved" },
];

export function SiteHeader() {
  const works = loadWorks();
  const artists = new Set(works.map((w) => w.artist).filter(Boolean)).size;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85 lg:static lg:bg-card">
      {/* Mobile: slim bar — brand + dice + menu */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Mark />
          <span className="font-headline text-[18px] font-semibold uppercase leading-none tracking-tight">
            PMA Explorer
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/random"
            prefetch={false}
            className="inline-flex h-9 w-9 items-center justify-center border border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
            aria-label="Random work"
            title="Random work"
          >
            <Dices className="size-4" />
          </Link>
          <ThemeToggle />
          <MobileMenu nav={NAV} worksCount={works.length} artistsCount={artists} />
        </div>
      </div>

      {/* Desktop: compact editorial header */}
      <div className="mx-auto hidden max-w-7xl items-center justify-between gap-6 px-6 py-3 lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <Mark />
          <h1 className="font-headline text-[22px] font-semibold uppercase leading-none tracking-tight">
            PMA Explorer
          </h1>
          <span className="hidden font-data text-[11px] uppercase tracking-[0.18em] text-muted-foreground xl:inline">
            Portland Museum of Art · Demo
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <CommandPalette works={works} />
            <nav className="flex flex-wrap items-center gap-3 text-sm sm:gap-5">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="font-semibold uppercase tracking-[0.12em] text-[12px] text-foreground hover:text-primary"
                >
                  {n.label}
                </Link>
              ))}
              <a
                href="https://www.portlandmuseum.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold uppercase tracking-[0.12em] text-[12px] text-muted-foreground hover:text-primary"
              >
                portlandmuseum.org ↗
              </a>
            </nav>
            <Link
              href="/random"
              prefetch={false}
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
              aria-label="Random work"
              title="Random work"
            >
              <Dices className="size-4" />
            </Link>
            <span className="hidden h-5 w-px bg-border sm:inline-block" />
            <KeyboardShortcuts />
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function Mark() {
  return (
    <span
      aria-hidden
      className="inline-flex h-7 w-7 items-center justify-center bg-primary font-headline text-[14px] font-semibold uppercase text-primary-foreground"
    >
      P
    </span>
  );
}
