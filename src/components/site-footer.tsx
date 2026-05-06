import Link from "next/link";
import { loadMeta } from "@/lib/works";

export function SiteFooter() {
  const meta = loadMeta();
  const date = meta.scraped_at?.slice(0, 10);
  return (
    <footer className="mt-24 border-t-[3px] border-arc-black bg-card">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 sm:grid-cols-3">
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
            About
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            PMA Explorer is an unofficial demonstration. All images and metadata
            © Portland Museum of Art and the respective artists, used for
            non-commercial demonstration only.
          </p>
        </div>
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
            Pages
          </p>
          <ul className="mt-2 space-y-1 text-[13px]">
            <li><Link className="hover:text-primary" href="/">Collection</Link></li>
            <li><Link className="hover:text-primary" href="/artists">Artists</Link></li>
            <li><Link className="hover:text-primary" href="/stats">Stats</Link></li>
            <li>
              <a
                className="hover:text-primary"
                href="https://www.portlandmuseum.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                portlandmuseum.org ↗
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
            Build
          </p>
          <p className="mt-2 font-data text-[12px] text-muted-foreground">
            {meta.count} works · scraped {date}
          </p>
          <p className="mt-1 font-data text-[12px] text-muted-foreground">
            v0.3 demo
          </p>
          <p className="mt-3 font-data text-[12px] text-muted-foreground">
            Questions →{" "}
            <a className="hover:text-primary" href="mailto:jbf@jbf.com">
              jbf@jbf.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
