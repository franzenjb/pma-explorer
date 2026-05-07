import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
  const activeBucket = active
    ? buckets.find((b) => b.bucket.toLowerCase() === active) ?? null
    : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">
        {/* Sticky color filter ribbon — page's first element so nothing
         * pushes it off screen. top offset clears the slim mobile header
         * (~52px); on lg+ the SiteHeader is static so top-0 is fine.
         */}
        <div className="sticky top-[52px] z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:-mx-6 sm:px-6 sm:py-4 lg:top-0">
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
                  Color of Maine
                </p>
                <h1 className="mt-1 flex items-center gap-3 truncate font-headline text-3xl font-semibold uppercase leading-none tracking-tight sm:text-4xl">
                  {activeBucket ? (
                    <>
                      <span
                        aria-hidden
                        className="inline-block size-7 shrink-0 sm:size-9"
                        style={{ background: activeBucket.hex }}
                      />
                      <span>{activeBucket.bucket}</span>
                    </>
                  ) : (
                    <span>Every hue</span>
                  )}
                </h1>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {activeBucket ? "Showing" : "Tagged"}
                </p>
                <p className="font-data text-2xl font-medium leading-none text-primary sm:text-3xl">
                  {activeBucket ? activeBucket.count : covered}
                </p>
                <p className="mt-1 font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  / {total}
                </p>
              </div>
            </div>

            {/* Continuous hue strip — every work as one slice */}
            <div className="flex h-8 w-full overflow-hidden rounded-sm sm:h-9">
              {allSorted.map((w) => {
                const dim =
                  active && w.hue_bucket?.toLowerCase() !== active
                    ? "opacity-25"
                    : "opacity-100";
                return (
                  <Link
                    key={w.id}
                    href={`/work/${encodeURIComponent(w.id)}`}
                    title={`${w.title} — ${w.artist ?? ""}`}
                    aria-label={w.title}
                    style={{ background: w.dominant_hex ?? "transparent" }}
                    className={
                      "block flex-1 transition-all duration-200 hover:scale-y-125 " +
                      dim
                    }
                  />
                );
              })}
            </div>

            {/* Bucket pills — click to filter, click again to clear */}
            <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
              <BucketChip
                href="/color"
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
              {active ? (
                <Link
                  href="/color"
                  className="ml-auto shrink-0 font-data text-[10px] uppercase tracking-[0.18em] text-primary hover:underline"
                >
                  Clear ✕
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        {/* Mosaic — square tiles, color-sorted */}
        {visible.length === 0 ? (
          <div className="my-10 border border-dashed border-border p-12 text-center">
            <h2 className="font-headline text-2xl">No works in this hue</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Pick another color above.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-3 gap-1 py-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
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
  hex?: string;
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
        "inline-flex h-8 shrink-0 items-center gap-2 border px-2.5 text-[12px] transition-colors " +
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
        style={{ background: hex ?? "transparent" }}
      />
      <span className="font-data uppercase tracking-[0.18em]">{label}</span>
      <span
        className={
          "font-data " + (active ? "text-background/75" : "text-muted-foreground")
        }
      >
        {count}
      </span>
    </Link>
  );
}
