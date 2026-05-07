"use client";

import Link from "next/link";
import { Player } from "@remotion/player";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Work } from "@/lib/works";

type ReelWork = Pick<
  Work,
  "id" | "title" | "artist" | "year" | "category" | "image_url" | "dominant_hex"
>;

const FPS = 30;
const FRAMES_PER_WORK = 120; // 4 seconds at 30fps.
const CROSSFADE_FRAMES = 12;
const MAX_REEL_WORKS = 8;

export function CollectionReel({ works }: { works: ReelWork[] }) {
  const reelWorks = works.filter((work) => work.image_url).slice(0, MAX_REEL_WORKS);
  if (reelWorks.length < 3) return null;
  const durationInFrames = reelWorks.length * FRAMES_PER_WORK;

  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-foreground text-background">
      <div className="absolute inset-0 opacity-20">
        <AmbientBackdrop works={reelWorks} />
      </div>
      <div className="relative mx-auto grid min-h-[calc(100svh-146px)] w-full max-w-7xl items-end gap-8 px-6 py-8 sm:py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="max-w-2xl pb-4">
          <hr className="rule-red" />
          <p className="mt-5 font-data text-[11px] uppercase tracking-[0.22em] text-background/70">
            Codex version 2.0
          </p>
          <h2 className="mt-3 font-headline text-[58px] font-semibold uppercase leading-[0.92] text-background sm:text-[82px] lg:text-[104px]">
            The collection, in motion.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-background/72 sm:text-lg">
            A cinematic browser for PMA&rsquo;s public collection proof of
            concept: color, place, century, artist, and daily discovery in one
            fast editorial surface.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#collection"
              className="inline-flex h-11 items-center justify-center bg-primary px-5 font-data text-[12px] font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-pma-red-deep"
            >
              Browse works
            </Link>
            <Link
              href="/color"
              className="inline-flex h-11 items-center justify-center border border-background/35 px-5 font-data text-[12px] font-semibold uppercase tracking-[0.16em] text-background transition-colors hover:border-background"
            >
              Color study
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-4 -top-4 z-10 hidden bg-primary px-3 py-2 font-data text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-foreground lg:block">
            Live composition
          </div>
          <div className="relative overflow-hidden border border-background/20 bg-black shadow-2xl shadow-black/35">
            <Player
              component={CollectionComposition}
              inputProps={{ works: reelWorks }}
              durationInFrames={durationInFrames}
              compositionWidth={1600}
              compositionHeight={1000}
              fps={FPS}
              loop
              autoPlay
              initiallyMuted
              controls={false}
              clickToPlay={false}
              acknowledgeRemotionLicense
              style={{ width: "100%", aspectRatio: "16 / 10" }}
            />
          </div>
          <ol className="mt-4 grid grid-cols-4 gap-2">
            {reelWorks.slice(0, 4).map((work, index) => (
              <li
                key={work.id}
                className="border-t border-background/25 pt-2 font-data text-[10px] uppercase tracking-[0.14em] text-background/65"
              >
                <span className="text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>{" "}
                {work.category ?? "Work"}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function AmbientBackdrop({ works }: { works: ReelWork[] }) {
  return (
    <div className="grid h-full grid-cols-4 gap-1">
      {works.slice(0, 4).map((work) => (
        <div key={work.id} className="relative overflow-hidden bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={work.image_url ?? ""}
            alt=""
            loading="eager"
            className="h-full w-full object-cover opacity-80"
          />
        </div>
      ))}
    </div>
  );
}

function CollectionComposition({ works }: { works: ReelWork[] }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const active = Math.floor(frame / FRAMES_PER_WORK) % works.length;
  const next = (active + 1) % works.length;
  const third = (active + 3) % works.length;
  const slotFrame = frame % FRAMES_PER_WORK;
  const fadeIn = interpolate(
    slotFrame,
    [0, CROSSFADE_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const fadeOut = interpolate(
    slotFrame,
    [FRAMES_PER_WORK - CROSSFADE_FRAMES, FRAMES_PER_WORK],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const nextFade = interpolate(
    slotFrame,
    [FRAMES_PER_WORK - CROSSFADE_FRAMES, FRAMES_PER_WORK],
    [0, 0.22],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const lift = spring({ frame: slotFrame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ backgroundColor: "#050505", overflow: "hidden" }}>
      <ArtworkLayer
        work={works[active]}
        opacity={Math.min(fadeIn, fadeOut)}
        scale={1}
      />
      <ArtworkLayer
        work={works[next]}
        opacity={nextFade}
        scale={0.82}
        x={460}
        y={80}
      />
      <ArtworkLayer
        work={works[third]}
        opacity={0.18}
        scale={0.5}
        x={-460}
        y={-120}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.78), rgba(0,0,0,0.06) 54%, rgba(0,0,0,0.55))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 92,
          bottom: 86,
          width: 760,
          transform: `translateY(${interpolate(lift, [0, 1], [30, 0])}px)`,
          opacity: interpolate(lift, [0, 1], [0, 1]),
          color: "#fff",
          fontFamily: "var(--font-headline), sans-serif",
        }}
      >
        <div
          style={{
            marginBottom: 18,
            height: 5,
            width: 72,
            background: works[active].dominant_hex ?? "#df1924",
          }}
        />
        <div
          style={{
            fontSize: 88,
            lineHeight: 0.9,
            textTransform: "uppercase",
            maxWidth: 720,
          }}
        >
          {works[active].title}
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: "var(--font-body), sans-serif",
            fontSize: 25,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          {works[active].artist ?? "Artist unknown"}
          {works[active].year ? `, ${works[active].year}` : ""}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 68,
          top: 64,
          display: "grid",
          gap: 8,
          fontFamily: "var(--font-data), monospace",
          fontSize: 16,
          color: "rgba(255,255,255,0.62)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          textAlign: "right",
        }}
      >
        <span>PMA Explorer</span>
        <span style={{ color: "#df1924" }}>
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(works.length).padStart(2, "0")}
        </span>
      </div>
    </AbsoluteFill>
  );
}

function ArtworkLayer({
  work,
  opacity,
  scale,
  x = 0,
  y = 0,
}: {
  work: ReelWork;
  opacity: number;
  scale: number;
  x?: number;
  y?: number;
}) {
  return (
    // Remotion renders this inside a frame composition; a native image avoids
    // Next image layout wrappers affecting frame transforms.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={work.image_url ?? ""}
      alt=""
      loading="eager"
      style={{
        position: "absolute",
        inset: "10% 8%",
        width: "84%",
        height: "80%",
        objectFit: "cover",
        opacity,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        transformOrigin: "center",
        filter: "saturate(0.94) contrast(1.08)",
      }}
    />
  );
}
