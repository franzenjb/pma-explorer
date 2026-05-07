import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroRotator } from "@/components/hero-rotator";
import { SectionHeading } from "@/components/section-heading";
import { StatBar } from "@/components/stat-bar";
import { CollectionBrowser } from "@/components/collection-browser";
import {
  loadCategories,
  loadDecades,
  loadWorks,
  pickRandom,
} from "@/lib/works";
import { getDaily, todayUTC, listDailyDates } from "@/lib/daily";
import { findWork } from "@/lib/works";

type SearchParams = Promise<{
  category?: string;
  q?: string;
  sort?: string;
  decade?: string;
  artist?: string;
}>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const works = loadWorks();
  const categories = loadCategories();
  const decades = loadDecades();

  const hasFilter =
    Boolean(sp.q) ||
    Boolean(sp.category) ||
    Boolean(sp.decade) ||
    Boolean(sp.artist);

  const today = new Date();
  const seed =
    today.getUTCFullYear() * 10000 +
    (today.getUTCMonth() + 1) * 100 +
    today.getUTCDate();
  const hero = hasFilter ? [] : pickRandom(works, 3, seed);

  const earliest = decades[0]?.sortKey ?? null;
  const latest = decades[decades.length - 1]?.sortKey ?? null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">
        {/* Collection browser is the page's first feature — sticky filter
         * ribbon pins to viewport top so search/filter is always reachable.
         */}
        <section id="collection" className="pt-4 sm:pt-6">
          <CollectionBrowser
            works={works}
            categories={categories}
            decades={decades}
            initial={sp}
          />
        </section>

        {!hasFilter ? (
          <>
            <section className="border-t border-border pt-12">
              <SectionHeading
                number="01"
                kicker="Today"
                title="Featured this morning"
                subtitle="Three works from the catalog. Read today's Daily Painting essay for the curatorial pick."
              />
              <div className="mt-6">
                <DailyTeaser />
              </div>
              <div className="mt-6">
                <HeroRotator works={hero} />
              </div>
            </section>

            <section className="border-t border-border py-12">
              <SectionHeading
                number="02"
                kicker="About this demo"
                title="Featured works from the Portland Museum of Art"
                subtitle="A small, fast browse of paintings, photographs, decorative arts, and modern works highlighted on the museum's public collection page. Proof-of-concept for a full 22,000-object index."
              />
              <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground">
                Source data scraped from{" "}
                <a
                  className="border-b border-primary text-foreground hover:text-primary"
                  href="https://www.portlandmuseum.org/collection/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  portlandmuseum.org/collection
                </a>
                . This is the Claude V1 build — design language pulls Barlow
                Condensed headlines, IBM Plex Mono for data, surgical PMA red,
                and a sticky filter ribbon that follows the user as they
                browse.
              </p>
              <StatBar
                stats={[
                  { label: "Works in demo", value: works.length, accent: true },
                  { label: "Categories", value: categories.length },
                  {
                    label: "Date range",
                    value: earliest && latest ? `${earliest}–${latest}` : "—",
                  },
                  { label: "Artists", value: countArtists(works) },
                ]}
              />
            </section>
          </>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

function DailyTeaser() {
  const today = todayUTC();
  const dates = listDailyDates();
  const targetDate = dates.includes(today) ? today : dates[0] ?? today;
  const entry = getDaily(targetDate);
  if (!entry) return null;
  const work = findWork(entry.work_id);
  if (!work) return null;
  const snippet = entry.essay.replace(/\s+/g, " ").slice(0, 200).trim();
  return (
    <Link
      href={`/daily/${targetDate}`}
      className="group flex items-center gap-5 border border-border bg-card p-4 transition-colors hover:border-foreground"
    >
      <span className="relative size-20 shrink-0 overflow-hidden bg-muted">
        {work.image_url ? (
          <Image
            src={work.image_url}
            alt={work.title}
            fill
            sizes="80px"
            className="object-cover"
            unoptimized
          />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
          Daily Painting · {targetDate}
        </span>
        <span className="mt-1 block truncate font-headline text-lg font-medium">
          {work.title}
        </span>
        <span className="block truncate text-[13px] text-muted-foreground">
          {snippet}…
        </span>
      </span>
      <span className="hidden font-data text-[11px] uppercase tracking-[0.18em] text-muted-foreground group-hover:text-foreground sm:inline">
        Read →
      </span>
    </Link>
  );
}

function countArtists(works: { artist: string | null }[]) {
  const set = new Set<string>();
  for (const w of works) if (w.artist) set.add(w.artist);
  return set.size;
}
