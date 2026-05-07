"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import type { Work } from "@/lib/works";

type Props = {
  works: Work[];
  /** Crossfade interval in ms */
  intervalMs?: number;
};

export function HeroCarousel({ works, intervalMs = 7000 }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (works.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % works.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [works.length, intervalMs]);

  if (works.length === 0) return null;
  const current = works[active];

  return (
    <section className="relative w-full overflow-hidden bg-foreground text-background">
      <div className="relative aspect-[16/9] max-h-[680px] w-full sm:aspect-[21/9]">
        {works.map((w, i) => (
          <div
            key={w.id}
            aria-hidden={i !== active}
            className={
              "absolute inset-0 transition-opacity duration-[1500ms] ease-in-out " +
              (i === active ? "opacity-100" : "opacity-0")
            }
          >
            {w.image_url ? (
              <Image
                src={w.image_url}
                alt={w.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className={
                  "object-cover " +
                  (i === active ? "animate-kenburns" : "")
                }
                unoptimized
              />
            ) : null}
          </div>
        ))}

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Caption */}
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12">
            <p className="font-data text-[11px] uppercase tracking-[0.24em] text-primary">
              Now on view · {current.category ?? "Collection"}
            </p>
            <h1 className="mt-3 max-w-4xl font-headline text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {current.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/80 sm:text-lg">
              {current.artist ?? "—"}
              {current.year ? ` · ${current.year}` : ""}
              {current.medium ? ` · ${current.medium}` : ""}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/work/${encodeURIComponent(current.id)}`}
                className="inline-flex items-center gap-2 bg-primary px-4 py-2 font-data text-[12px] font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
              >
                View this work <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/collection"
                className="inline-flex items-center gap-2 border border-white/40 bg-transparent px-4 py-2 font-data text-[12px] font-semibold uppercase tracking-[0.18em] text-white hover:border-white"
              >
                Search the collection <Search className="size-3.5" />
              </Link>
            </div>
            {/* Slide dots */}
            {works.length > 1 ? (
              <div className="mt-6 flex items-center gap-2">
                {works.map((w, i) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show ${w.title}`}
                    aria-pressed={i === active}
                    className={
                      "h-1.5 transition-all " +
                      (i === active
                        ? "w-10 bg-primary"
                        : "w-6 bg-white/40 hover:bg-white/70")
                    }
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
