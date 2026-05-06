import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border/70 bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-headline text-2xl font-bold tracking-tight">
            PMA Explorer
          </span>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            Portland Museum of Art · Demo
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="hover:text-primary transition-colors"
          >
            Collection
          </Link>
          <a
            href="https://www.portlandmuseum.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            portlandmuseum.org ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
