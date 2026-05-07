import { ImageResponse } from "next/og";
import { findWork } from "@/lib/works";

export const runtime = "nodejs";
export const alt = "PMA Explorer — work preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#f4f4f4",
          fontFamily: "Helvetica, Arial, sans-serif",
          color: "#000000",
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
                background: "#df1924",
                color: "white",
                fontSize: 18,
                fontWeight: 700,
                textTransform: "uppercase",
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
                color: "#df1924",
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
                fontFamily: "Helvetica, Arial, sans-serif",
                fontSize: 64,
                fontWeight: 700,
                textTransform: "uppercase",
                lineHeight: 1.0,
                letterSpacing: "-0.005em",
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
