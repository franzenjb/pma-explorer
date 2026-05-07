"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Work } from "@/lib/works";

type Bucket = { bucket: string; count: number; hex: string };

/**
 * Client-side color browser. State lives in React, not the URL — every click
 * filters the mosaic instantly without a server round-trip. Ported from V2's
 * ColorBrowser (Codex), then refined for V1.
 */
export function ColorBrowser({
  works,
  buckets,
  total,
}: {
  works: Work[];
  buckets: Bucket[];
  total: number;
}) {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      selectedBucket
        ? works.filter((w) => w.hue_bucket === selectedBucket)
        : works,
    [selectedBucket, works]
  );
  const selected = selectedBucket
    ? buckets.find((b) => b.bucket === selectedBucket) ?? null
    : null;

  return (
    <section className="mt-6">
      {/* Sticky color ribbon — clears mobile sticky header (52px) and
       * pins to viewport top on lg+. Wraps the entire selector so the
       * rainbow + chips + the selected-color lockup all travel together
       * as the user scrolls the mosaic.
       */}
      <div className="sticky top-[52px] z-30 -mx-4 border-y border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:-mx-6 sm:px-6 sm:py-4 lg:top-0">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Selected color
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span
                  aria-hidden
                  className="block h-9 w-20 shrink-0 border border-border"
                  style={{
                    background:
                      selected?.hex ??
                      "linear-gradient(90deg,#df1924,#f76a0c,#e3c93c,#3a8a64,#4b8da4,#253f8f,#5b3990,#a13e8a)",
                  }}
                />
                <p className="truncate font-headline text-2xl font-semibold uppercase leading-none sm:text-3xl">
                  {selected ? selected.bucket : "All colors"}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right font-data text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="text-primary">{filtered.length}</span> / {total}{" "}
              works
            </div>
          </div>

          {/* Continuous hue strip — every work as a clickable slice that
           * grows on hover so dense bands stay legible.
           */}
          <div className="mt-4 flex h-12 w-full overflow-hidden border border-border bg-muted">
            {works.map((w) => (
              <button
                key={w.id}
                type="button"
                title={`${w.title} — ${w.artist ?? ""} · ${w.hue_bucket ?? "untagged"}`}
                aria-label={`Show ${w.hue_bucket ?? "this color"} works`}
                onClick={() => setSelectedBucket(w.hue_bucket ?? null)}
                style={{ background: w.dominant_hex ?? "transparent" }}
                className={
                  "block min-w-[3px] flex-1 transition-[flex-grow,transform,opacity] duration-200 hover:flex-[3] hover:scale-y-110 " +
                  (selectedBucket && w.hue_bucket !== selectedBucket
                    ? "opacity-25"
                    : "opacity-100")
                }
              />
            ))}
          </div>

          {/* Bucket pills */}
          <ul className="-mx-1 mt-4 flex flex-wrap items-center gap-2 px-1">
            <li>
              <button
                type="button"
                onClick={() => setSelectedBucket(null)}
                aria-pressed={selectedBucket === null}
                className={
                  "inline-flex items-center gap-2 border px-2.5 py-1 text-[12px] transition-colors " +
                  (selectedBucket === null
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:border-foreground")
                }
              >
                <span className="font-data uppercase tracking-[0.18em]">
                  All
                </span>
                <span className="font-data opacity-70">{works.length}</span>
              </button>
            </li>
            {buckets.map((b) => {
              const isActive = selectedBucket === b.bucket;
              return (
                <li key={b.bucket}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedBucket(isActive ? null : b.bucket)
                    }
                    aria-pressed={isActive}
                    className={
                      "inline-flex items-center gap-2 border px-2.5 py-1 text-[12px] transition-colors " +
                      (isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card hover:border-foreground")
                    }
                  >
                    <span
                      aria-hidden
                      className="block size-3"
                      style={{ background: b.hex }}
                    />
                    <span className="font-data uppercase tracking-[0.18em]">
                      {b.bucket}
                    </span>
                    <span className="font-data opacity-70">{b.count}</span>
                  </button>
                </li>
              );
            })}
            {selected ? (
              <li className="ml-auto">
                <button
                  type="button"
                  onClick={() => setSelectedBucket(null)}
                  className="font-data text-[10px] uppercase tracking-[0.18em] text-primary hover:underline"
                >
                  Clear ✕
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      {/* Mosaic */}
      {filtered.length === 0 ? (
        <div className="my-10 border border-dashed border-border p-12 text-center">
          <h2 className="font-headline text-2xl">No works in this hue</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Pick another color above.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-3 gap-1 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
          {filtered.map((w) => (
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
                    <span className="bg-black/70 px-1 py-0.5 font-data uppercase tracking-[0.1em]">
                      {w.dominant_hex}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
