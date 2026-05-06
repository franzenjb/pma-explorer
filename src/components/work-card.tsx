import Image from "next/image";
import type { Work } from "@/lib/works";

export function WorkCard({ work }: { work: Work }) {
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {work.image_url ? (
          <Image
            src={work.image_url}
            alt={`${work.title}${work.artist ? `, by ${work.artist}` : ""}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-headline text-lg italic leading-snug">
          {work.title}
        </h3>
        <p className="text-sm">
          {work.artist ?? "Artist unknown"}
          {work.year ? (
            <span className="text-muted-foreground"> · {work.year}</span>
          ) : null}
        </p>
        {work.category ? (
          <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {work.category}
          </p>
        ) : null}
      </div>
    </article>
  );
}
