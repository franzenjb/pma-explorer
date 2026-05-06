import Link from "next/link";
import { Dices } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/command-palette";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
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
  return (
    <header className="border-b-[3px] border-arc-black bg-card">
      <div className="mx-auto max-w-7xl px-6 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <Mark />
          <span className="font-data text-[13px] font-semibold uppercase tracking-[0.18em] text-primary">
            Portland Museum of Art
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-6">
          <Link href="/" className="block">
            <h1 className="font-headline text-[30px] font-bold leading-tight tracking-tight">
              PMA Explorer
            </h1>
            <p className="mt-1 text-[15px] text-muted-foreground">
              A demonstration index of the museum&rsquo;s public collection.
            </p>
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:gap-5">
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
      </div>
    </header>
  );
}

function Mark() {
  return (
    <span
      aria-hidden
      className="inline-flex h-7 w-7 items-center justify-center bg-primary font-headline text-[13px] italic font-bold text-primary-foreground"
    >
      P
    </span>
  );
}
