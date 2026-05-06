import Image from "next/image";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { loadPairings, type Pairing } from "@/lib/conversations";

export const metadata = {
  title: "Two works in conversation · PMA Explorer",
  description:
    "A weekly pairing of two works from the collection that argue, echo, or rhyme with each other.",
};

export default function ConversationPage() {
  const pairings = loadPairings();
  const [current, ...past] = pairings;

  if (!current) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-7xl flex-1 px-6 py-12">
          <p className="text-muted-foreground">No pairings yet.</p>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <SectionHeading
          number="00"
          kicker="This week"
          title="Two works in conversation"
          subtitle="Each week the curators (or, in production, a curator-tuned model) pair two works from the collection that talk to each other. Read across, then look back."
        />

        <PairingHero pairing={current} />

        {past.length > 0 ? (
          <section className="mt-16 space-y-6">
            <SectionHeading
              number="01"
              kicker="Archive"
              title="Past pairings"
            />
            <ul className="grid gap-6 sm:grid-cols-2">
              {past.map((p) => (
                <li key={p.week}>
                  <PairingCard pairing={p} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

function PairingHero({ pairing }: { pairing: Pairing }) {
  return (
    <article className="mt-8 border border-border bg-card p-6 sm:p-8">
      <header className="space-y-2">
        <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
          Week {pairing.week}
        </p>
        <h2 className="font-headline text-3xl tracking-tight sm:text-4xl">
          {pairing.title}
        </h2>
        <p className="text-[14px] text-muted-foreground">{pairing.subtitle}</p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,auto,1fr] lg:items-center">
        <Side work={pairing.left!} side="left" />
        <ArrowLeftRight className="hidden size-6 text-muted-foreground lg:block" />
        <Side work={pairing.right!} side="right" />
      </div>

      <hr className="rule-red mt-10" />
      <p className="mt-5 max-w-3xl whitespace-pre-line text-[15px] leading-relaxed">
        {pairing.dialogue}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/compare?ids=${pairing.left_id},${pairing.right_id}`}
          className="inline-flex border border-primary px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Read across in Compare →
        </Link>
        <Link
          href={`/work/${encodeURIComponent(pairing.left_id)}`}
          className="inline-flex border border-border px-3 py-1.5 text-xs uppercase tracking-[0.18em] hover:border-primary hover:text-primary"
        >
          Left full record
        </Link>
        <Link
          href={`/work/${encodeURIComponent(pairing.right_id)}`}
          className="inline-flex border border-border px-3 py-1.5 text-xs uppercase tracking-[0.18em] hover:border-primary hover:text-primary"
        >
          Right full record
        </Link>
      </div>
    </article>
  );
}

function Side({
  work,
  side,
}: {
  work: NonNullable<Pairing["left"]>;
  side: "left" | "right";
}) {
  return (
    <Link
      href={`/work/${encodeURIComponent(work.id)}`}
      className="group block"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {work.image_url ? (
          <Image
            src={work.image_url}
            alt={work.title}
            fill
            sizes="(min-width:1024px) 40vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            unoptimized
          />
        ) : null}
      </div>
      <div className="mt-3">
        <p
          className={
            "font-data text-[10px] uppercase tracking-[0.22em] " +
            (side === "left" ? "text-primary" : "text-muted-foreground")
          }
        >
          {side === "left" ? "Left" : "Right"}
        </p>
        <h3 className="mt-1 font-headline text-xl italic leading-tight group-hover:text-primary">
          {work.title}
        </h3>
        <p className="text-sm">
          {work.artist}
          {work.year ? <span className="text-muted-foreground"> · {work.year}</span> : null}
        </p>
      </div>
    </Link>
  );
}

function PairingCard({ pairing }: { pairing: Pairing }) {
  return (
    <article className="border border-border bg-card p-4">
      <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Week {pairing.week}
      </p>
      <h3 className="mt-1 font-headline text-lg tracking-tight">{pairing.title}</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[pairing.left, pairing.right].map(
          (w) =>
            w && (
              <div key={w.id} className="relative aspect-[4/5] overflow-hidden bg-muted">
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
            )
        )}
      </div>
      <p className="mt-3 line-clamp-3 text-[13px] text-muted-foreground">
        {pairing.dialogue}
      </p>
      <Link
        href={`/compare?ids=${pairing.left_id},${pairing.right_id}`}
        className="mt-3 inline-flex font-data text-[11px] uppercase tracking-[0.18em] text-primary hover:underline"
      >
        Open comparison →
      </Link>
    </article>
  );
}
