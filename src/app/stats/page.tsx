import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { StatBar } from "@/components/stat-bar";
import {
  CategoryDonut,
  DecadeBars,
  MediumBars,
} from "@/components/charts";
import {
  loadArtists,
  loadCategoryBuckets,
  loadDecades,
  loadMediumBuckets,
  loadWorks,
  parseYear,
} from "@/lib/works";

export const metadata = {
  title: "Stats · PMA Explorer",
  description: "Quantitative breakdown of the PMA Explorer demo collection.",
};

export default function StatsPage() {
  const works = loadWorks();
  const decades = loadDecades().map((d) => ({ name: d.decade, value: d.count }));
  const categories = loadCategoryBuckets().map((c) => ({
    name: c.category,
    value: c.count,
  }));
  const mediums = loadMediumBuckets(8).map((m) => ({
    name: m.medium,
    value: m.count,
  }));
  const artists = loadArtists()
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const years = works.map((w) => parseYear(w.year)).filter((n): n is number => n != null);
  const earliest = years.length ? Math.min(...years) : null;
  const latest = years.length ? Math.max(...years) : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <SectionHeading
          number="00"
          kicker="By the numbers"
          title="The collection in aggregate"
          subtitle="A quantitative view of the 77 featured works currently in the demo. Each bar is a click away from filtering the catalog below."
        />
        <StatBar
          stats={[
            { label: "Works", value: works.length, accent: true },
            { label: "Categories", value: categories.length },
            { label: "Decades represented", value: decades.length },
            {
              label: "Span",
              value: earliest && latest ? `${earliest}–${latest}` : "—",
            },
            { label: "Distinct artists", value: artists.length ? loadArtists().length : 0 },
          ]}
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <Card
            number="01"
            title="Works by decade"
            subtitle="A coastal art collection's heart beats in the 19th and early 20th centuries."
          >
            <DecadeBars data={decades} />
          </Card>

          <Card
            number="02"
            title="Works by category"
            subtitle="Five curatorial buckets, weighted toward Modern & Contemporary."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr,160px] sm:items-center">
              <CategoryDonut data={categories} />
              <ul className="space-y-2 text-[12px]">
                {categories.map((c, i) => (
                  <li key={c.name} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span
                        className="block h-2 w-2"
                        style={{
                          background:
                            i === 0
                              ? "var(--primary)"
                              : ["#1e4a6d", "#4a4a4a", "#a3a3a3", "#2d5a27", "#737373"][
                                  i % 5
                                ],
                        }}
                      />
                      {c.name}
                    </span>
                    <span className="font-data text-muted-foreground">
                      {c.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card
            number="03"
            title="Top media"
            subtitle="What the artists actually used to make the work."
          >
            <MediumBars data={mediums} />
          </Card>

          <Card
            number="04"
            title="Most-collected artists"
            subtitle="By number of works held in the demo subset."
          >
            <ol className="divide-y divide-border">
              {artists.map((a, i) => (
                <li key={a.artist} className="flex items-center justify-between gap-4 py-3">
                  <span className="flex items-baseline gap-3">
                    <span className="section-num w-8 text-right">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Link
                      className="font-headline text-base hover:text-primary"
                      href={`/?artist=${encodeURIComponent(a.artist)}`}
                    >
                      {a.artist}
                    </Link>
                  </span>
                  <span className="font-data text-[13px] text-muted-foreground">
                    {a.count} {a.count === 1 ? "work" : "works"}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Card({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="border border-border bg-card p-6">
      <header className="mb-4 space-y-1">
        <p className="flex items-baseline gap-3">
          <span className="section-num">{number}</span>
          <span className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
            Chart
          </span>
        </p>
        <h3 className="font-headline text-[20px] font-bold tracking-tight">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-[13px] text-muted-foreground">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </article>
  );
}
