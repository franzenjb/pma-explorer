import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WorkCard } from "@/components/work-card";
import { CategoryFilter } from "@/components/category-filter";
import { HeroRotator } from "@/components/hero-rotator";
import { Toolbar } from "@/components/toolbar";
import { SectionHeading } from "@/components/section-heading";
import { StatBar } from "@/components/stat-bar";
import {
  loadCategories,
  loadDecades,
  loadWorks,
  pickRandom,
  searchAndSort,
} from "@/lib/works";

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

  const filtered = searchAndSort(works, sp);
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
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <section className="border-b border-border pb-12">
          <hr className="rule-red" />
          <h2 className="mt-3 max-w-3xl font-headline text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Featured works from the{" "}
            <em className="text-primary">Portland Museum of Art</em>.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
            A small, fast browse of paintings, photographs, decorative arts, and
            modern works highlighted on the museum&rsquo;s public collection
            page. This demo pulls from{" "}
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

        {hero.length > 0 ? (
          <section className="space-y-6 pt-12">
            <SectionHeading
              number="01"
              kicker="Today"
              title="Featured this morning"
              subtitle="Three works pulled from the catalog at random — refreshes daily."
            />
            <HeroRotator works={hero} />
          </section>
        ) : null}

        <section className="space-y-6 pt-12">
          <SectionHeading
            number="02"
            kicker="Browse"
            title={
              hasFilter
                ? `${filtered.length} of ${works.length} works`
                : "The full demo collection"
            }
            subtitle="Search by title, artist, medium, or accession number. Sort to compare across centuries."
          />
          <Toolbar totalCount={works.length} />
          <CategoryFilter categories={categories} active={sp.category ?? null} />
        </section>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((work) => (
              <li key={work.id}>
                <WorkCard work={work} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function countArtists(works: { artist: string | null }[]) {
  const set = new Set<string>();
  for (const w of works) if (w.artist) set.add(w.artist);
  return set.size;
}

function EmptyState() {
  return (
    <div className="mt-10 border border-dashed border-border p-12 text-center">
      <h2 className="font-headline text-2xl">No matches</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Try a different search term or clear the filters.
      </p>
    </div>
  );
}
