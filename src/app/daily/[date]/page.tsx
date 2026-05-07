import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { findWork } from "@/lib/works";
import { getDaily, listDailyDates, neighborDates } from "@/lib/daily";

type PageProps = { params: Promise<{ date: string }> };

export async function generateStaticParams() {
  return listDailyDates().map((d) => ({ date: d }));
}

export async function generateMetadata({ params }: PageProps) {
  const { date } = await params;
  const entry = getDaily(date);
  if (!entry) return { title: `Daily Painting — ${date}` };
  const work = findWork(entry.work_id);
  const title = work ? `${work.title} — ${date}` : `Daily Painting — ${date}`;
  return {
    title: `${title} · PMA Explorer`,
    description: entry.essay.slice(0, 160),
    openGraph: {
      title,
      images: work?.image_url ? [{ url: work.image_url }] : undefined,
    },
  };
}

export default async function DailyPage({ params }: PageProps) {
  const { date } = await params;
  const entry = getDaily(date);
  if (!entry) notFound();
  const work = findWork(entry.work_id);
  if (!work) notFound();

  const { prev, next } = neighborDates(date);
  const formatted = formatDate(date);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <header className="space-y-3">
          <hr className="rule-red" />
          <p className="font-data text-[11px] uppercase tracking-[0.24em] text-primary">
            Daily painting
          </p>
          <h1 className="font-headline text-4xl tracking-tight sm:text-5xl">
            {formatted}
          </h1>
          {entry.generated_by === "placeholder" ? (
            <p className="inline-flex border border-border bg-muted px-2 py-1 font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Placeholder essay · set ANTHROPIC_API_KEY to regenerate
            </p>
          ) : null}
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[3fr,2fr]">
          <Link
            href={`/work/${encodeURIComponent(work.id)}`}
            className="block bg-muted"
          >
            <div className="relative aspect-[4/5] w-full">
              {work.image_url ? (
                <Image
                  src={work.image_url}
                  alt={`${work.title}, by ${work.artist ?? "unknown artist"}`}
                  fill
                  sizes="(min-width:1024px) 60vw, 100vw"
                  className="object-contain"
                  unoptimized
                  priority
                />
              ) : null}
            </div>
          </Link>

          <article className="space-y-5">
            <div>
              <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {work.category ?? "Today's work"}
              </p>
              <h2 className="mt-1 font-headline text-3xl font-medium leading-tight">
                {work.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {work.artist ?? "Artist unknown"}
                {work.year ? <span> · {work.year}</span> : null}
              </p>
            </div>
            <hr className="rule-red" />
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
              {entry.essay}
            </div>
            <Link
              href={`/work/${encodeURIComponent(work.id)}`}
              className="inline-flex items-center gap-2 border border-primary px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Full record →
            </Link>
          </article>
        </div>

        <nav className="mt-16 grid grid-cols-2 gap-4 border-t border-border pt-8 text-sm">
          {prev ? (
            <Link href={`/daily/${prev}`} className="flex items-center gap-2 hover:text-primary">
              <ArrowLeft className="size-4" />
              <span className="font-data">{prev}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/daily/${next}`} className="ml-auto flex items-center gap-2 hover:text-primary">
              <span className="font-data">{next}</span>
              <ArrowRight className="size-4" />
            </Link>
          ) : <span />}
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
