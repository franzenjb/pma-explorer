import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroRotator } from "@/components/hero-rotator";
import { CollectionReel } from "@/components/collection-reel";
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
import Link from "next/link";
import Image from "next/image";

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
  const reel = pickRandom(works, 8, seed + 220);

  const earliest = decades[0]?.sortKey ?? null;
  const latest = decades[decades.length - 1]?.sortKey ?? null;

  return (
    <>
      {hasFilter ? <SearchHeader /> : <SiteHeader />}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6 sm:py-8">
        <section id="collection" className="scroll-mt-4">
          {!hasFilter ? (
            <SectionHeading
              number="01"
              kicker="Browse"
              title="Search the collection"
              subtitle="Find works by title, artist, medium, accession number, category, or decade."
            />
          ) : null}
          <div className={hasFilter ? "" : "mt-6"}>
            <CollectionBrowser
              works={works}
              categories={categories}
              decades={decades}
              initial={sp}
            />
          </div>
        </section>

        {!hasFilter ? (
          <>
            <section className="pt-12">
              <CollectionReel works={reel} />
            </section>

            <section className="border-b border-border py-12">
              <hr className="rule-red" />
              <h2 className="mt-4 max-w-4xl font-headline text-[48px] font-semibold uppercase leading-[0.98] tracking-tight sm:text-[74px]">
                Browse PMA by{" "}
                <span className="text-primary">work, color, place, and time</span>.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
                A fast, editorial collection surface for paintings, photographs,
                decorative arts, and modern works highlighted on the museum&rsquo;s
                public collection page. This Codex v2 concept keeps the PMA palette
                and Barlow type system, then adds a restrained motion layer powered
                by React composition. Source data comes from{" "}
                <a
                  className="border-b border-primary text-foreground hover:text-primary"
                  href="https://www.portlandmuseum.org/collection/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  portlandmuseum.org/collection
                </a>{" "}
                and is the proof-of-concept for a full 22,000-object index.
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

            <section className="space-y-6 pt-12">
            <SectionHeading
              number="02"
              kicker="Today"
              title="Featured this morning"
              subtitle="Three works from the catalog. Read today's Daily Painting essay for the curatorial pick."
            />
            <DailyTeaser />
            <HeroRotator works={hero} />
            </section>
          </>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

function SearchHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center bg-primary font-headline text-[14px] font-semibold uppercase text-primary-foreground"
          >
            P
          </span>
          <span className="min-w-0">
            <span className="block truncate font-headline text-2xl font-semibold uppercase leading-none">
              PMA Explorer
            </span>
            <span className="mt-1 block font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Search mode
            </span>
          </span>
        </Link>
        <Link
          href="/"
          className="shrink-0 font-data text-[10px] uppercase tracking-[0.18em] text-primary hover:underline"
        >
          Exit
        </Link>
      </div>
    </header>
  );
}

function DailyTeaser() {
  const today = todayUTC();
  const dates = listDailyDates();
  const targetDate = dates.includes(today)
    ? today
    : dates[0] ?? today;
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
