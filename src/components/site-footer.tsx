import { loadMeta } from "@/lib/works";

export function SiteFooter() {
  const meta = loadMeta();
  const date = meta.scraped_at?.slice(0, 10);
  return (
    <footer className="mt-24 border-t border-border/70 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          PMA Explorer is an unofficial demo. All images and metadata © Portland
          Museum of Art and respective artists, used for non-commercial
          demonstration purposes.
        </p>
        <p className="font-data">
          {meta.count} works · scraped {date}
        </p>
      </div>
    </footer>
  );
}
