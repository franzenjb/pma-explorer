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

export default function ColorPage() {
  const sorted = loadByHue();
  const buckets = loadHueBuckets();
  const total = loadWorks().length;
  const covered = sorted.length;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <SectionHeading
          number="00"
          kicker="Pure looking"
          title={<>The <em className="text-primary">Color of Maine</em>.</>}
          subtitle="Every work in the collection sorted by dominant hue. Scroll from Atlantic blues through Hopper yellows to gallery-wall reds. Pure visual joy, zero text."
        />

        {/* Continuous hue strip */}
        <div className="mt-8 flex h-10 w-full overflow-hidden rounded-sm">
          {sorted.map((w) => (
            <Link
              key={w.id}
              href={`/work/${encodeURIComponent(w.id)}`}
              title={`${w.title} — ${w.artist ?? ""}`}
              aria-label={w.title}
              style={{ background: w.dominant_hex ?? "transparent" }}
              className="block flex-1 transition-transform duration-200 hover:scale-y-150"
            />
          ))}
        </div>

        {/* Bucket legend */}
        <ul className="mt-4 flex flex-wrap gap-2 text-[12px]">
          {buckets.map((b) => (
            <li
              key={b.bucket}
              className="inline-flex items-center gap-2 border border-border bg-card px-2.5 py-1"
            >
              <span
                aria-hidden
                className="block size-3 rounded-sm"
                style={{ background: b.hex }}
              />
              <span className="font-data uppercase tracking-[0.18em]">
                {b.bucket}
              </span>
              <span className="font-data text-muted-foreground">{b.count}</span>
            </li>
          ))}
          <li className="ml-auto self-center font-data text-[11px] text-muted-foreground">
            {covered} / {total} works tagged
          </li>
        </ul>

        {/* Mosaic — square tiles, color-sorted */}
        <ul className="mt-10 grid grid-cols-3 gap-1 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
          {sorted.map((w) => (
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
      </main>
      <SiteFooter />
    </>
  );
}
