import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WorkKeys } from "@/components/work-keys";
import { FavoriteButton } from "@/components/favorite-button";
import { findWork, loadWorks, neighbors } from "@/lib/works";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return loadWorks().map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const work = findWork(decodeURIComponent(id));
  if (!work) return { title: "Work not found" };
  const title = `${work.title} — ${work.artist ?? "Artist unknown"}`;
  return {
    title: `${title} · PMA Explorer`,
    description: work.medium ?? work.credit_line ?? title,
    openGraph: {
      title,
      images: work.image_url ? [{ url: work.image_url }] : undefined,
    },
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { id } = await params;
  const work = findWork(decodeURIComponent(id));
  if (!work) notFound();

  const { prev, next } = neighbors(work.id);

  const fields: Array<{ label: string; value: string | null | undefined }> = [
    { label: "Artist", value: work.artist },
    { label: "Nationality", value: work.artist_nationality },
    { label: "Date", value: work.year },
    { label: "Medium", value: work.medium },
    { label: "Dimensions", value: work.dimensions },
    { label: "Credit line", value: work.credit_line },
    { label: "Accession number", value: work.accession_number },
    { label: "Copyright", value: work.copyright_notice },
    { label: "Category", value: work.category },
  ];

  return (
    <>
      <SiteHeader />
      <WorkKeys
        prevHref={prev ? `/work/${encodeURIComponent(prev.id)}` : null}
        nextHref={next ? `/work/${encodeURIComponent(next.id)}` : null}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-3" /> Back to collection
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[3fr,2fr]">
          <div className="relative w-full overflow-hidden bg-muted">
            <div className="relative aspect-[4/5] w-full">
              {work.image_url ? (
                <Image
                  src={work.image_url}
                  alt={`${work.title}${work.artist ? `, by ${work.artist}` : ""}`}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-contain"
                  unoptimized
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No image
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="font-data text-[10px] uppercase tracking-[0.24em] text-primary">
              {work.category ?? "Work"}
            </p>
            <h1 className="mt-2 font-headline text-4xl font-medium leading-tight">
              {work.title}
            </h1>
            <p className="mt-2 text-base">
              {work.artist ?? "Artist unknown"}
              {work.year ? (
                <span className="text-muted-foreground"> · {work.year}</span>
              ) : null}
            </p>
            <hr className="rule-red mt-5" />

            <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 text-sm">
              {fields
                .filter((f) => f.value)
                .map((f) => (
                  <div key={f.label} className="grid grid-cols-[120px_1fr] gap-3">
                    <dt className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {f.label}
                    </dt>
                    <dd className="text-foreground">{f.value}</dd>
                  </div>
                ))}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <FavoriteButton id={work.id} />
              {work.accession_number ? (
                <a
                  href={`https://collections.portlandmuseum.org/kiosk/search.htm?q=${encodeURIComponent(work.accession_number)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-primary px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Search PMA collection <ExternalLink className="size-3" />
                </a>
              ) : null}
              <a
                href="https://www.portlandmuseum.org/collection/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border px-3 py-1 text-xs uppercase tracking-[0.18em] text-foreground hover:border-primary hover:text-primary"
              >
                On portlandmuseum.org <ExternalLink className="size-3" />
              </a>
            </div>

            {work.raw_caption ? (
              <details className="mt-8 border-t border-border pt-4 text-xs">
                <summary className="cursor-pointer font-data uppercase tracking-[0.18em] text-muted-foreground hover:text-primary">
                  Raw catalog caption
                </summary>
                <pre className="mt-3 whitespace-pre-wrap font-data text-[11px] leading-relaxed text-muted-foreground">
                  {work.raw_caption}
                </pre>
              </details>
            ) : null}
          </div>
        </div>

        <nav className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/work/${encodeURIComponent(prev.id)}`}
              className="group flex items-center gap-3"
            >
              <ArrowLeft className="size-4 text-muted-foreground group-hover:text-primary" />
              <div>
                <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Previous
                </p>
                <p className="font-headline font-medium group-hover:text-primary">
                  {prev.title}
                </p>
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/work/${encodeURIComponent(next.id)}`}
              className="group flex items-center justify-end gap-3 text-right sm:ml-auto"
            >
              <div>
                <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Next
                </p>
                <p className="font-headline font-medium group-hover:text-primary">
                  {next.title}
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
