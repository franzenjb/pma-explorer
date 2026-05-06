import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { MaineMap } from "@/components/maine-map";
import { loadMainePins } from "@/lib/maine";

export const metadata = {
  title: "On this coast · PMA Explorer",
  description:
    "Pinning works whose subject is a real Maine place — from Castine Harbor to Mount Katahdin.",
};

export default function MapPage() {
  const pins = loadMainePins();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <SectionHeading
          number="00"
          kicker="On this coast"
          title="Where the works were made"
          subtitle="A hand-curated selection of works in the demo whose subject is a recognizable Maine place. Click a pin to see the work; click the title to open the full record."
        />

        <div className="mt-8">
          <MaineMap pins={pins} />
        </div>

        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pins.map((p) => (
            <li key={p.work_id} className="border border-border bg-card p-4">
              <Link
                href={`/work/${encodeURIComponent(p.work_id)}`}
                className="group flex gap-4"
              >
                <span className="relative size-20 shrink-0 overflow-hidden bg-muted">
                  {p.work?.image_url ? (
                    <Image
                      src={p.work.image_url}
                      alt={p.work.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
                    {p.place}
                  </span>
                  <span className="mt-1 block truncate font-headline text-base italic group-hover:text-primary">
                    {p.work?.title}
                  </span>
                  <span className="block text-[12px] text-muted-foreground">
                    {p.work?.artist}
                    {p.work?.year ? ` · ${p.work.year}` : ""}
                  </span>
                  <span className="mt-1 block font-data text-[10px] text-muted-foreground">
                    {p.lat.toFixed(3)}, {p.lng.toFixed(3)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <p className="mt-10 max-w-3xl text-[13px] text-muted-foreground">
          Coverage is illustrative — only {pins.length} of the {77} demo works
          are tagged. The full {`22,000-object`} index would surface every Maine
          subject automatically by mining the catalog descriptions, exhibition
          history, and conservation notes.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
