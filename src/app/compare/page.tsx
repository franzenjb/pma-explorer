import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { findWork, loadWorks, parseYear, pickRandom } from "@/lib/works";

type SearchParams = Promise<{ ids?: string }>;

export const metadata = {
  title: "Compare · PMA Explorer",
  description: "Place 2–4 works side by side and read across.",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const ids = (sp.ids ?? "")
    .split(",")
    .map((s) => decodeURIComponent(s.trim()))
    .filter(Boolean);

  const picked = ids.map((id) => findWork(id)).filter((w): w is NonNullable<typeof w> => Boolean(w));
  const empty = picked.length === 0;

  // Default suggestion when the user lands on /compare with no ids: pick three
  // contrasting works (different categories, spread across time).
  const suggestion = empty ? curatedSuggestion() : [];

  const cols = picked.length >= 4 ? "lg:grid-cols-4" : picked.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <SectionHeading
          number="00"
          kicker="Conversation"
          title="Two works in conversation"
          subtitle="Drop 2–4 works side by side and read across. Click any column to open the full record. Build a comparison by appending ?ids=accession,accession to the URL — or pick from the demo suggestion below."
        />

        {empty ? (
          <SuggestionPicker picks={suggestion} />
        ) : (
          <>
            <div className={`mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 ${cols}`}>
              {picked.map((w) => (
                <article key={w.id} className="space-y-3">
                  <Link
                    href={`/work/${encodeURIComponent(w.id)}`}
                    className="block"
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
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
                  </Link>
                  <h2 className="font-headline text-xl italic leading-tight">
                    {w.title}
                  </h2>
                  <p className="text-sm">
                    {w.artist ?? "Artist unknown"}
                    {w.year ? <span className="text-muted-foreground"> · {w.year}</span> : null}
                  </p>
                </article>
              ))}
            </div>

            {/* Read-across table */}
            <table className="mt-12 w-full border-t border-border text-[13px]">
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-border align-top">
                    <th
                      scope="row"
                      className="w-44 py-3 pr-4 text-left font-data text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      {row.label}
                    </th>
                    {picked.map((w) => (
                      <td key={w.id} className="py-3 pr-4 align-top">
                        {row.value(w) || <span className="text-muted-foreground">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-8 text-[12px] text-muted-foreground">
              Span:{" "}
              <span className="font-data">
                {minYear(picked)} – {maxYear(picked)}
              </span>
              {" · "}
              {picked.length} works · share via{" "}
              <code className="font-data text-[11px]">
                ?ids={picked.map((w) => w.id).join(",")}
              </code>
            </p>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

const ROWS: Array<{ label: string; value: (w: ReturnType<typeof findWork> & object) => React.ReactNode }> = [
  { label: "Title", value: (w) => <em className="font-headline">{w.title}</em> },
  { label: "Artist", value: (w) => w.artist ?? null },
  { label: "Year", value: (w) => w.year ?? null },
  { label: "Medium", value: (w) => w.medium ?? null },
  { label: "Dimensions", value: (w) => w.dimensions ?? null },
  { label: "Category", value: (w) => w.category ?? null },
  { label: "Accession", value: (w) => (w.accession_number ? <span className="font-data">{w.accession_number}</span> : null) },
  { label: "Credit line", value: (w) => w.credit_line ?? null },
  {
    label: "Dominant color",
    value: (w) =>
      w.dominant_hex ? (
        <span className="inline-flex items-center gap-2">
          <span className="block size-3" style={{ background: w.dominant_hex }} />
          <span className="font-data text-[12px]">{w.dominant_hex}</span>
          <span className="text-muted-foreground">({w.hue_bucket})</span>
        </span>
      ) : null,
  },
];

function minYear(ws: ReturnType<typeof findWork>[]) {
  const ys = ws.map((w) => w && parseYear(w.year)).filter(Boolean) as number[];
  return ys.length ? Math.min(...ys) : "—";
}

function maxYear(ws: ReturnType<typeof findWork>[]) {
  const ys = ws.map((w) => w && parseYear(w.year)).filter(Boolean) as number[];
  return ys.length ? Math.max(...ys) : "—";
}

function curatedSuggestion(): string[] {
  // Three deterministic but varied picks across categories.
  const works = loadWorks();
  const buckets = ["American Art", "Photography", "Modern & Contemporary Art"];
  const picks: string[] = [];
  for (const b of buckets) {
    const bucket = works.filter((w) => w.category === b);
    if (bucket.length === 0) continue;
    const seed = bucket.length * 31 + b.length;
    const [w] = pickRandom(bucket, 1, seed);
    if (w) picks.push(w.id);
  }
  return picks;
}

function SuggestionPicker({ picks }: { picks: string[] }) {
  const works = picks.map((id) => findWork(id)).filter(Boolean);
  return (
    <div className="mt-10 border border-dashed border-border bg-card p-8">
      <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
        Try this comparison
      </p>
      <h3 className="mt-2 font-headline text-2xl">
        American Art × Photography × Modern & Contemporary
      </h3>
      <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">
        Three works pulled from different curatorial buckets. Click below to
        load them side by side.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {works.map((w) =>
          w ? (
            <div key={w.id} className="space-y-2">
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {w.image_url ? (
                  <Image
                    src={w.image_url}
                    alt={w.title}
                    fill
                    sizes="33vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <p className="font-headline text-sm italic leading-tight">{w.title}</p>
              <p className="text-[11px] text-muted-foreground">{w.artist}</p>
            </div>
          ) : null
        )}
      </div>
      <Link
        href={`/compare?ids=${picks.join(",")}`}
        className="mt-6 inline-flex border border-primary px-3 py-2 text-xs uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-primary-foreground"
      >
        Load comparison →
      </Link>
    </div>
  );
}
