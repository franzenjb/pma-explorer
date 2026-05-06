import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WorkCard } from "@/components/work-card";
import { CategoryFilter } from "@/components/category-filter";
import { loadCategories, loadWorks } from "@/lib/works";

type SearchParams = Promise<{ category?: string }>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category } = await searchParams;
  const works = loadWorks();
  const categories = loadCategories();
  const filtered = category
    ? works.filter((w) => w.category === category)
    : works;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <section className="border-b border-border/60 pb-10">
          <p className="font-data text-xs uppercase tracking-[0.22em] text-muted-foreground">
            A demonstration collection explorer
          </p>
          <h1 className="mt-3 max-w-3xl font-headline text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Featured works from the{" "}
            <em className="text-primary">Portland Museum of Art</em>.
          </h1>
          <hr className="rule-red mt-6" />
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
            A small, fast browse of paintings, photographs, decorative arts, and
            modern works highlighted on the museum&rsquo;s public collection
            page. This demo pulls from{" "}
            <a
              className="border-b border-primary/60 text-foreground hover:text-primary"
              href="https://www.portlandmuseum.org/collection/"
              target="_blank"
              rel="noopener noreferrer"
            >
              portlandmuseum.org/collection
            </a>{" "}
            and is the proof-of-concept for a full 22,000-object index.
          </p>
        </section>

        <section className="py-8">
          <CategoryFilter categories={categories} active={category ?? null} />
        </section>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
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

function EmptyState() {
  return (
    <div className="border border-dashed border-border p-12 text-center">
      <h2 className="font-headline text-2xl">No works yet</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Run the scraper to populate{" "}
        <code className="font-data text-[12px]">data/works.json</code>:
      </p>
      <pre className="mx-auto mt-4 inline-block bg-muted px-4 py-2 text-left text-xs">
        <code className="font-data">python scripts/scrape_pma.py</code>
      </pre>
    </div>
  );
}
