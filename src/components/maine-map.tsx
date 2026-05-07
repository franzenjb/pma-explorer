"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { MainePin } from "@/lib/maine";
import type { DivIcon } from "leaflet";

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
  const [pmaIcon, setPmaIcon] = useState<DivIcon | null>(null);

  useEffect(() => {
    let mounted = true;
    import("leaflet").then((L) => {
      if (!mounted) return;
      // Leaflet's default marker images aren't bundled by Next, so we render
      // the pin as inline SVG via a DivIcon. PMA red pin with a white dot.
      setPmaIcon(
        L.divIcon({
          className: "pma-pin",
          iconSize: [22, 28],
          iconAnchor: [11, 28],
          popupAnchor: [0, -26],
          html:
            '<svg viewBox="0 0 22 28" width="22" height="28" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 1px rgba(0,0,0,.35))">' +
            '<path d="M11 0C5 0 0 4.5 0 10.5 0 18 11 28 11 28S22 18 22 10.5C22 4.5 17 0 11 0Z" fill="#df1924"/>' +
            '<circle cx="11" cy="10.5" r="4" fill="#ffffff"/>' +
            "</svg>",
        })
      );
    });
    return () => {
      mounted = false;
    };
  }, []);

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
        {pmaIcon ? pins.map((p) => (
          <Marker key={p.work_id} position={[p.lat, p.lng]} icon={pmaIcon}>
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
                    fontWeight: 600,
                    fontSize: 17,
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
        )) : null}
      </MapContainer>
    </div>
  );
}
