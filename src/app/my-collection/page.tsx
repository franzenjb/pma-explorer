"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import {
  readFavorites,
  subscribeFavorites,
  toggleFavorite,
} from "@/lib/favorites";
import worksJson from "../../../data/works.json";
import type { WorksFile } from "@/lib/works";

const ALL_WORKS = (worksJson as WorksFile).works ?? [];

export default function MyCollectionPage() {
  const [ids, setIds] = useState<string[] | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hydration
    setIds(readFavorites());
    return subscribeFavorites(() => setIds(readFavorites()));
  }, []);

  const works = useMemo(
    () =>
      (ids ?? [])
        .map((id) => ALL_WORKS.find((w) => w.id === id))
        .filter(Boolean) as typeof ALL_WORKS,
    [ids]
  );

  const isLoading = ids === null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <SectionHeading
          number="00"
          kicker="Saved"
          title={
            isLoading
              ? "Loading…"
              : works.length === 0
              ? "Your collection is empty"
              : `${works.length} saved ${works.length === 1 ? "work" : "works"}`
          }
          subtitle="Favorites are stored locally on this device. Tap the heart on any work to add or remove it."
        />

        {isLoading ? (
          <div className="mt-10 h-40 animate-pulse bg-muted" />
        ) : works.length === 0 ? (
          <div className="mt-10 border border-dashed border-border p-10 text-center">
            <Heart className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 font-headline text-xl">Nothing saved yet</p>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-muted-foreground">
              When something stops you on the grid, hit{" "}
              <span className="font-data text-foreground">Save</span> on the
              detail page. It will land here for later.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex border border-primary px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Browse the collection →
            </Link>
          </div>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {works.map((w) => (
              <li key={w.id}>
                <article className="group flex flex-col">
                  <Link
                    href={`/work/${encodeURIComponent(w.id)}`}
                    className="block"
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                      {w.image_url ? (
                        <Image
                          src={w.image_url}
                          alt={w.title}
                          fill
                          sizes="(min-width:1024px) 25vw, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          unoptimized
                        />
                      ) : null}
                    </div>
                  </Link>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <Link
                      href={`/work/${encodeURIComponent(w.id)}`}
                      className="min-w-0 flex-1"
                    >
                      <h3 className="truncate font-headline text-lg font-medium group-hover:text-primary">
                        {w.title}
                      </h3>
                      <p className="text-sm">
                        {w.artist ?? "Artist unknown"}
                        {w.year ? (
                          <span className="text-muted-foreground"> · {w.year}</span>
                        ) : null}
                      </p>
                    </Link>
                    <button
                      type="button"
                      aria-label="Remove from favorites"
                      onClick={() => toggleFavorite(w.id)}
                      className="border border-border bg-card p-1.5 text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
