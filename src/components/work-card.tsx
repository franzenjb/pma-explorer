import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/lib/works";

export function WorkCard({ work }: { work: Work }) {
  return (
    <Link
      href={`/work/${encodeURIComponent(work.id)}`}
      className="group flex flex-col focus:outline-none"
    >
      <article className="flex flex-col">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
          {work.image_url ? (
            <Image
              src={work.image_url}
              alt={`${work.title}${work.artist ? `, by ${work.artist}` : ""}`}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 ring-0 ring-primary transition-all duration-200 group-hover:ring-2" />
        </div>
        <div className="mt-3 space-y-1">
          {work.category ? (
            <p className="font-data text-[10px] uppercase tracking-[0.16em] text-primary">
              {work.category}
            </p>
          ) : null}
          <h3 className="font-headline text-[20px] font-medium leading-tight tracking-tight group-hover:text-primary">
            {work.title}
          </h3>
          <p className="text-[14px] text-muted-foreground">
            {work.artist ?? "Artist unknown"}
            {work.year ? <span> · {work.year}</span> : null}
          </p>
        </div>
      </article>
    </Link>
  );
}
