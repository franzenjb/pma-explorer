import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { loadArtists } from "@/lib/works";

export const metadata = {
  title: "Artists · PMA Explorer",
  description: "Every artist represented in the PMA Explorer demo, A→Z.",
};

export default function ArtistsPage() {
  const artists = loadArtists();
  const total = artists.length;
  const groups = groupByLetter(artists);
  const letters = Object.keys(groups);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <SectionHeading
          number="00"
          kicker="Index"
          title={`${total} artists, A→Z`}
          subtitle="Each name links back to the works that artist contributed to the demo collection."
        />

        <nav className="mt-8 flex flex-wrap gap-1 border-b border-border pb-4 font-data text-[12px]">
          {letters.map((l) => (
            <a
              key={l}
              href={`#letter-${l}`}
              className="rounded-sm px-2 py-1 uppercase tracking-[0.2em] text-muted-foreground hover:bg-foreground hover:text-background"
            >
              {l}
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-12">
          {letters.map((l) => (
            <section key={l} id={`letter-${l}`}>
              <header className="mb-4 flex items-baseline gap-4 border-b border-border pb-2">
                <span className="font-headline text-3xl text-primary">{l}</span>
                <span className="font-data text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {groups[l].length} {groups[l].length === 1 ? "artist" : "artists"}
                </span>
              </header>
              <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {groups[l].map((a) => {
                  const sample = a.works[0];
                  return (
                    <li key={a.artist}>
                      <Link
                        href={`/?artist=${encodeURIComponent(a.artist)}`}
                        className="group flex items-center gap-3"
                      >
                        <span className="relative size-12 shrink-0 overflow-hidden bg-muted">
                          {sample?.image_url ? (
                            <Image
                              src={sample.image_url}
                              alt={`Sample work by ${a.artist}`}
                              fill
                              sizes="48px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                        </span>
                        <span>
                          <span className="block font-headline text-[16px] leading-tight group-hover:text-primary">
                            {a.artist}
                          </span>
                          <span className="font-data text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {a.count} {a.count === 1 ? "work" : "works"}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function groupByLetter(artists: ReturnType<typeof loadArtists>) {
  const out: Record<string, typeof artists> = {};
  for (const a of artists) {
    const first = (a.artist[0] || "?").toUpperCase();
    const key = /[A-Z]/.test(first) ? first : "#";
    (out[key] ??= []).push(a);
  }
  // Sort keys alphabetically, # at end
  const sorted = Object.keys(out).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });
  const ordered: Record<string, typeof artists> = {};
  for (const k of sorted) ordered[k] = out[k];
  return ordered;
}
