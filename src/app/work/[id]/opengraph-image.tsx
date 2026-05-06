import { ImageResponse } from "next/og";
import { findWork, loadWorks } from "@/lib/works";

export const runtime = "nodejs";
export const alt = "PMA Explorer — work preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateImageMetadata() {
  return loadWorks().map((w) => ({
    id: w.id,
    alt: `${w.title}${w.artist ? `, ${w.artist}` : ""}`,
    contentType: "image/png",
    size,
  }));
}

export default async function OG({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = findWork(decodeURIComponent(id));
  const accent = work?.dominant_hex ?? "#ED1B2E";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#f7f5f2",
          fontFamily: "Georgia, serif",
          color: "#1a1a1a",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px",
            width: "60%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "#ED1B2E",
                color: "white",
                fontSize: 22,
                fontStyle: "italic",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              P
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 16,
                color: "#ED1B2E",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Portland Museum of Art
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                width: 60,
                height: 4,
                background: accent,
              }}
            />
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                fontStyle: "italic",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}
            >
              {work?.title ?? "PMA Explorer"}
            </div>
            <div
              style={{
                fontSize: 28,
                fontFamily: "Helvetica, sans-serif",
                color: "#4a4a4a",
              }}
            >
              {work?.artist ?? "A demonstration index of the collection"}
              {work?.year ? `  ·  ${work.year}` : ""}
            </div>
          </div>

          <div
            style={{
              fontFamily: "monospace",
              fontSize: 14,
              color: "#737373",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            pma-explorer.jbf.com{work?.accession_number ? `  ·  ${work.accession_number}` : ""}
          </div>
        </div>

        {work?.image_url ? (
          <div
            style={{
              display: "flex",
              width: "40%",
              background: accent,
            }}
          >
            <img
              src={work.image_url}
              alt=""
              width={480}
              height={630}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </div>
        ) : (
          <div style={{ width: "40%", background: accent }} />
        )}
      </div>
    ),
    { ...size }
  );
}
