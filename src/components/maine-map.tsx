"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "leaflet/dist/leaflet.css";
import type { MainePin } from "@/lib/maine";

// Leaflet uses `window` at import time → load only on the client.
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

export function MaineMap({ pins }: { pins: MainePin[] }) {
  // Center on coastal Maine. Bounds are adjusted to fit all pins via Leaflet's
  // own bounds API at runtime — but a sane initial center keeps the map quiet.
  const center = useMemo<[number, number]>(() => {
    if (pins.length === 0) return [44.5, -69.5];
    const lat = pins.reduce((s, p) => s + p.lat, 0) / pins.length;
    const lng = pins.reduce((s, p) => s + p.lng, 0) / pins.length;
    return [lat, lng];
  }, [pins]);

  return (
    <div className="relative h-[520px] w-full overflow-hidden border border-border bg-muted">
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((p) => (
          <Marker key={p.work_id} position={[p.lat, p.lng]}>
            <Popup>
              <div style={{ minWidth: 200 }}>
                <p
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "var(--primary)",
                    margin: 0,
                  }}
                >
                  {p.place}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-headline)",
                    fontStyle: "italic",
                    fontSize: 16,
                    margin: "4px 0",
                  }}
                >
                  {p.work?.title}
                </p>
                <p style={{ fontSize: 12, margin: 0 }}>
                  {p.work?.artist}
                  {p.work?.year ? ` · ${p.work.year}` : ""}
                </p>
                {p.note ? (
                  <p style={{ fontSize: 12, margin: "6px 0 8px", color: "#737373" }}>
                    {p.note}
                  </p>
                ) : null}
                <a
                  href={`/work/${encodeURIComponent(p.work_id)}`}
                  style={{
                    display: "inline-block",
                    fontFamily: "var(--font-data)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "var(--primary)",
                    textDecoration: "none",
                    borderBottom: "1px solid currentColor",
                  }}
                >
                  Open work →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
