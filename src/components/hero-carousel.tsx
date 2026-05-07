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

/**
 * Per-work overrides for object-position so the Ken Burns pan settles on
 * the most interesting region of each painting instead of dead-centre.
 * Keyed by accession id. Use percentages: `"50% 70%"` pushes the view
 * 70% down (good for seascapes with lots of empty sky).
 */
const HERO_FOCUS: Record<string, string> = {
  // Castine Harbor — Fitz Henry Lane. Center crop shows blank sky;
  // shift view down to feature the shoreline + boats.
  "1996.38.29": "50% 78%",
  // Anne and her Nurse — Mary Cassatt. Eyes sit in the upper third;
  // pull the crop up so the figures stay in frame across the pan.
  "1996.12": "50% 28%",
};

/**
 * Trim catalog titles for the hero. Many PMA titles include parenthetical
 * translations or sub-titles — fine in the detail page, distracting at
 * 6xl on the homepage. Strip the trailing parenthetical and clamp to a
 * comfortable width.
 */
function shortenTitle(title: string, max = 56): string {
  const cleaned = title.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (cleaned.length <= max) return cleaned;
  const slice = cleaned.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice) + "…";
}

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
  const displayTitle = shortenTitle(current.title);

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
                className="object-cover animate-kenburns"
                style={{ objectPosition: HERO_FOCUS[w.id] ?? "center" }}
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
              {displayTitle}
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
                    aria-label={`Show ${shortenTitle(w.title, 40)}`}
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
