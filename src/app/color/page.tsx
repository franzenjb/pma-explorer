import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { loadByHue, loadHueBuckets, loadWorks } from "@/lib/works";

export const metadata = {
  title: "Color of Maine · PMA Explorer",
  description:
    "Every work in the collection sorted by dominant hue. Scroll from Atlantic blues to Hopper yellows.",
};

type SearchParams = Promise<{ bucket?: string }>;

export default async function ColorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const active = sp.bucket?.toLowerCase() ?? null;
  const allSorted = loadByHue();
  const buckets = loadHueBuckets();
  const total = loadWorks().length;
  const covered = allSorted.length;

  const visible = active
    ? allSorted.filter((w) => w.hue_bucket?.toLowerCase() === active)
    : allSorted;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <SectionHeading
          number="00"
          kicker="Pure looking"
          title={<>The <span className="text-primary">Color of Maine</span>.</>}
          subtitle="Every work in the collection sorted by dominant hue. Pick a bucket below to drill in; pick another to switch. Click any tile to open the work."
        />

        {/* Sticky color filter ribbon — always visible while you browse the mosaic */}
        <div className="sticky top-0 z-30 -mx-6 mt-8 border-y border-border bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="space-y-3">
            {/* Continuous hue strip — every work as one slice */}
            <div className="flex h-9 w-full overflow-hidden rounded-sm">
              {allSorted.map((w) => {
                const dim =
                  active && w.hue_bucket?.toLowerCase() !== active
                    ? "opacity-30"
                    : "opacity-100";
                return (
                  <Link
                    key={w.id}
                    href={`/work/${encodeURIComponent(w.id)}`}
                    title={`${w.title} — ${w.artist ?? ""}`}
                    aria-label={w.title}
                    style={{ background: w.dominant_hex ?? "transparent" }}
                    className={
                      "block flex-1 transition-all duration-200 hover:scale-y-150 " +
                      dim
                    }
                  />
                );
              })}
            </div>

            {/* Bucket pills — click to filter, click again to clear */}
            <div className="flex flex-wrap items-center gap-2">
              <BucketChip
                href="/color"
                hex="transparent"
                label="All"
                count={covered}
                active={!active}
                isAll
              />
              {buckets.map((b) => {
                const isActive = active === b.bucket.toLowerCase();
                const href = isActive
                  ? "/color"
                  : `/color?bucket=${encodeURIComponent(b.bucket.toLowerCase())}`;
                return (
                  <BucketChip
                    key={b.bucket}
                    href={href}
                    hex={b.hex}
                    label={b.bucket}
                    count={b.count}
                    active={isActive}
                  />
                );
              })}
              <span className="ml-auto font-data text-[11px] text-muted-foreground">
                {active
                  ? `${visible.length} ${active} ${visible.length === 1 ? "work" : "works"}`
                  : `${covered} / ${total} works tagged`}
              </span>
            </div>
          </div>
        </div>

        {/* Mosaic — square tiles, color-sorted */}
        {visible.length === 0 ? (
          <div className="mt-10 border border-dashed border-border p-12 text-center">
            <h2 className="font-headline text-2xl">No works in this hue</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Pick another color above.
            </p>
          </div>
        ) : (
          <ul className="mt-10 grid grid-cols-3 gap-1 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
            {visible.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/work/${encodeURIComponent(w.id)}`}
                  className="group block"
                >
                  <span
                    className="relative block aspect-square overflow-hidden"
                    style={{ background: w.dominant_hex ?? "var(--muted)" }}
                  >
                    {w.image_url ? (
                      <Image
                        src={w.image_url}
                        alt={`${w.title}${w.artist ? `, ${w.artist}` : ""}`}
                        fill
                        sizes="(min-width:1024px) 11vw, (min-width:640px) 20vw, 33vw"
                        className="object-cover opacity-100 transition-all duration-300 group-hover:opacity-0"
                        unoptimized
                      />
                    ) : null}
                    <span className="absolute inset-0 flex items-end p-1 text-[9px] leading-tight text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="rounded-sm bg-black/65 px-1 py-0.5 font-data uppercase tracking-[0.1em]">
                        {w.dominant_hex}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function BucketChip({
  href,
  hex,
  label,
  count,
  active,
  isAll,
}: {
  href: string;
  hex: string;
  label: string;
  count: number;
  active: boolean;
  isAll?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={
        "inline-flex items-center gap-2 border px-2.5 py-1 text-[12px] transition-colors " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground hover:border-foreground")
      }
    >
      <span
        aria-hidden
        className={
          "block size-3 rounded-sm " + (isAll ? "border border-border" : "")
        }
        style={{ background: hex }}
      />
      <span className="font-data uppercase tracking-[0.18em]">{label}</span>
      <span
        className={
          "font-data " + (active ? "text-background/70" : "text-muted-foreground")
        }
      >
        {count}
      </span>
    </Link>
  );
}
