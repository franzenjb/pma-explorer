import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/lib/works";

export function HeroRotator({ works }: { works: Work[] }) {
  if (works.length === 0) return null;
  const featured = works[0];
  const tail = works.slice(1, 3);

  return (
    <section className="grid gap-6 border-b border-border/60 pb-10 lg:grid-cols-[2fr,1fr]">
      <FeaturedTile work={featured} primary />
      <div className="grid gap-6 lg:grid-rows-2">
        {tail.map((w) => (
          <FeaturedTile key={w.id} work={w} />
        ))}
      </div>
    </section>
  );
}

function FeaturedTile({
  work,
  primary,
}: {
  work: Work;
  primary?: boolean;
}) {
  return (
    <Link
      href={`/work/${encodeURIComponent(work.id)}`}
      className="group relative block overflow-hidden bg-muted"
    >
      <div className={primary ? "relative aspect-[16/10]" : "relative aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[180px]"}>
        {work.image_url ? (
          <Image
            src={work.image_url}
            alt={`${work.title}${work.artist ? `, by ${work.artist}` : ""}`}
            fill
            sizes={primary ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            unoptimized
            priority={primary}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p className="font-data text-[10px] uppercase tracking-[0.22em] text-white/80">
            {work.category ?? "Featured"}
          </p>
          <h2 className={`mt-1 font-headline italic ${primary ? "text-3xl sm:text-4xl" : "text-xl"}`}>
            {work.title}
          </h2>
          <p className="mt-1 text-sm text-white/85">
            {work.artist ?? "Artist unknown"}
            {work.year ? <span className="text-white/65"> · {work.year}</span> : null}
          </p>
        </div>
      </div>
    </Link>
  );
}
