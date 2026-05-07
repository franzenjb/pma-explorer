import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Compass,
  GalleryThumbnails,
  MapPin,
  MessageSquare,
  Palette,
  Search,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatBar } from "@/components/stat-bar";
import { HeroCarousel } from "@/components/hero-carousel";
import {
  loadCategories,
  loadDecades,
  loadWorks,
  pickRandom,
  findWork,
} from "@/lib/works";
import { getDaily, todayUTC, listDailyDates } from "@/lib/daily";
import { loadPairings } from "@/lib/conversations";

export default async function Home() {
  const works = loadWorks();
  const categories = loadCategories();
  const decades = loadDecades();

  // Daily-rotating hero pool — five image-rich works that crossfade with
  // a slow Ken Burns pan in the HeroCarousel client component.
  const today = new Date();
  const seed =
    today.getUTCFullYear() * 10000 +
    (today.getUTCMonth() + 1) * 100 +
    today.getUTCDate();
  const heroPool = pickHeroWorks(works, seed);
  const featured = pickRandom(works, 8, seed + 7);

  const earliest = decades[0]?.sortKey ?? null;
  const latest = decades[decades.length - 1]?.sortKey ?? null;

  // Daily Painting teaser
  const dailyDates = listDailyDates();
  const todayKey = todayUTC();
  const targetDailyDate = dailyDates.includes(todayKey)
    ? todayKey
    : dailyDates[0] ?? todayKey;
  const dailyEntry = getDaily(targetDailyDate);
  const dailyWork = dailyEntry ? findWork(dailyEntry.work_id) : null;

  // This week's pairing
  const [thisPairing] = loadPairings();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* 1 — Hero carousel: panning, crossfading, full-bleed */}
        <HeroCarousel works={heroPool} />

        {/* 2 — From the collection (large image grid up high) */}
        {featured.length > 0 ? (
          <section className="border-b border-border">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
              <hr className="rule-red" />
              <div className="mt-4 flex items-end justify-between gap-4">
                <h2 className="font-headline text-2xl font-semibold uppercase tracking-tight sm:text-4xl">
                  From the collection
                </h2>
                <Link
                  href="/collection"
                  className="font-data text-[11px] uppercase tracking-[0.18em] text-primary hover:underline"
                >
                  See all {works.length} →
                </Link>
              </div>
              <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                {featured.map((w) => (
                  <li key={w.id}>
                    <Link
                      href={`/work/${encodeURIComponent(w.id)}`}
                      className="group block"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                        {w.image_url ? (
                          <Image
                            src={w.image_url}
                            alt={w.title}
                            fill
                            sizes="(min-width:1024px) 25vw, 50vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            unoptimized
                          />
                        ) : null}
                      </div>
                      <p className="mt-3 font-headline text-base font-medium leading-tight group-hover:text-primary">
                        {w.title}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {w.artist}
                        {w.year ? ` · ${w.year}` : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* 3 — Today's daily painting + this week's pairing */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2">
            {dailyEntry && dailyWork ? (
              <article>
                <hr className="rule-red" />
                <p className="mt-4 font-data text-[10px] uppercase tracking-[0.22em] text-primary">
                  Today · {targetDailyDate}
                </p>
                <h2 className="mt-2 font-headline text-2xl font-semibold uppercase tracking-tight sm:text-3xl">
                  Daily painting
                </h2>
                <Link href={`/daily/${targetDailyDate}`} className="group mt-5 block">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    {dailyWork.image_url ? (
                      <Image
                        src={dailyWork.image_url}
                        alt={dailyWork.title}
                        fill
                        sizes="(min-width:1024px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <p className="mt-4 font-headline text-xl font-medium leading-tight group-hover:text-primary">
                    {dailyWork.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dailyWork.artist}
                    {dailyWork.year ? ` · ${dailyWork.year}` : ""}
                  </p>
                  <p className="mt-3 line-clamp-3 text-[14px] text-muted-foreground">
                    {dailyEntry.essay}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 font-data text-[11px] uppercase tracking-[0.18em] text-primary group-hover:underline">
                    Read today&rsquo;s essay <ArrowRight className="size-3" />
                  </span>
                </Link>
              </article>
            ) : null}

            {thisPairing ? (
              <article>
                <hr className="rule-red" />
                <p className="mt-4 font-data text-[10px] uppercase tracking-[0.22em] text-primary">
                  This week · {thisPairing.week}
                </p>
                <h2 className="mt-2 font-headline text-2xl font-semibold uppercase tracking-tight sm:text-3xl">
                  Two works in conversation
                </h2>
                <Link href="/conversation" className="group mt-5 block">
                  <div className="grid grid-cols-2 gap-2">
                    {[thisPairing.left, thisPairing.right].map((w) => (
                      <div key={w.id} className="relative aspect-[4/5] overflow-hidden bg-muted">
                        {w.image_url ? (
                          <Image
                            src={w.image_url}
                            alt={w.title}
                            fill
                            sizes="(min-width:1024px) 25vw, 50vw"
                            className="object-cover"
                            unoptimized
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 font-headline text-xl font-medium leading-tight group-hover:text-primary">
                    {thisPairing.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{thisPairing.subtitle}</p>
                  <span className="mt-3 inline-flex items-center gap-2 font-data text-[11px] uppercase tracking-[0.18em] text-primary group-hover:underline">
                    Read the conversation <ArrowRight className="size-3" />
                  </span>
                </Link>
              </article>
            ) : null}
          </div>
        </section>

        {/* 4 — By the numbers */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <hr className="rule-red" />
            <h2 className="mt-4 max-w-3xl font-headline text-3xl font-semibold uppercase leading-tight tracking-tight sm:text-4xl">
              A demonstration window onto the{" "}
              <span className="text-primary">PMA collection</span>.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Proof-of-concept for a full 22,000-object index. Current build
              features {works.length} highlights pulled from{" "}
              <a
                className="border-b border-primary text-foreground hover:text-primary"
                href="https://www.portlandmuseum.org/collection/"
                target="_blank"
                rel="noopener noreferrer"
              >
                portlandmuseum.org/collection
              </a>
              .
            </p>
            <StatBar
              stats={[
                { label: "Works in demo", value: works.length, accent: true },
                { label: "Categories", value: categories.length },
                {
                  label: "Date range",
                  value: earliest && latest ? `${earliest}–${latest}` : "—",
                },
                { label: "Distinct artists", value: countArtists(works) },
              ]}
            />
          </div>
        </section>

        {/* 5 — Ways to explore (moved low; images win above) */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <hr className="rule-red" />
            <h2 className="mt-4 font-headline text-2xl font-semibold uppercase tracking-tight sm:text-3xl">
              Ways to explore
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureTile
                href="/collection"
                icon={Search}
                kicker="Search"
                title="Search the collection"
                blurb="Live filter, category pills, decade scrubber. The classic explorer."
              />
              <FeatureTile
                href="/color"
                icon={Palette}
                kicker="Pure looking"
                title="Color of Maine"
                blurb="Every work sorted by dominant hue. Click a color, drill in."
              />
              <FeatureTile
                href="/map"
                icon={MapPin}
                kicker="On this coast"
                title="Where the works were made"
                blurb="Hand-tagged pins for Maine subjects: Castine, Katahdin, Mount Desert."
              />
              <FeatureTile
                href="/daily"
                icon={Calendar}
                kicker="Today"
                title="Daily painting"
                blurb="One work, one essay, every day. Permalinkable, shareable."
              />
              <FeatureTile
                href="/conversation"
                icon={MessageSquare}
                kicker="This week"
                title="Two works in conversation"
                blurb="Curatorial pairings that argue, echo, or rhyme with each other."
              />
              <FeatureTile
                href="/artists"
                icon={Users}
                kicker="Index"
                title="Artists A→Z"
                blurb="Every artist in the demo, with sample work and quick links."
              />
            </ul>
          </div>
        </section>

        {/* 6 — CTA strip */}
        <section className="bg-foreground text-background">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="font-data text-[11px] uppercase tracking-[0.22em] text-primary">
                Explorer
              </p>
              <h2 className="mt-1 font-headline text-3xl font-semibold uppercase tracking-tight sm:text-4xl">
                Open the search tools
              </h2>
              <p className="mt-2 max-w-xl text-[14px] text-background/80">
                Filter by title, artist, medium, decade, color, or category.
                The full demo collection in one keyboard-driven view.
              </p>
            </div>
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 bg-primary px-5 py-3 font-data text-[12px] font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
            >
              <Compass className="size-4" /> Launch explorer
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

/**
 * Pick five "hero-quality" works for the carousel — prefer landscapes /
 * paintings, skip drawings/works on paper that look thin at full bleed.
 */
/**
 * Works that don't pan well at full bleed — portrait-only crops, busy
 * compositions, or anything where the Ken Burns drift looks wrong. Filtered
 * out of the hero rotation regardless of category.
 */
const HERO_DENYLIST: ReadonlySet<string> = new Set([
  // "Woman Flying" — Katherine Bradford, oil on canvas dropcloth.
  // Composition reads poorly when zoomed/cropped for the carousel.
  "2012.14",
]);

function pickHeroWorks(
  works: ReturnType<typeof loadWorks>,
  seed: number
): typeof works {
  const candidates = works.filter(
    (w) =>
      Boolean(w.image_url) &&
      !HERO_DENYLIST.has(w.id) &&
      (w.category === "American Art" ||
        w.category === "European Art" ||
        w.category === "Modern & Contemporary Art")
  );
  const pool =
    candidates.length >= 5
      ? candidates
      : works.filter((w) => w.image_url && !HERO_DENYLIST.has(w.id));
  return pickRandom(pool, 5, seed);
}

function FeatureTile({
  href,
  icon: Icon,
  kicker,
  title,
  blurb,
}: {
  href: string;
  icon: typeof GalleryThumbnails;
  kicker: string;
  title: string;
  blurb: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex h-full flex-col border border-border bg-card p-5 transition-colors hover:border-foreground"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex size-8 items-center justify-center bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <span className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
            {kicker}
          </span>
        </div>
        <h3 className="mt-4 font-headline text-xl font-semibold uppercase leading-tight tracking-tight group-hover:text-primary">
          {title}
        </h3>
        <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
          {blurb}
        </p>
        <span className="mt-auto pt-4 font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-primary">
          Open →
        </span>
      </Link>
    </li>
  );
}

function countArtists(works: { artist: string | null }[]) {
  const set = new Set<string>();
  for (const w of works) if (w.artist) set.add(w.artist);
  return set.size;
}
