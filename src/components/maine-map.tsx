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
      // Stylized painter's palette pin — kidney-shaped wood palette with
      // a thumb-hole and four paint dabs (PMA red, ochre, slate blue,
      // pine green). Thin black stem drops to the exact lat/lng so the
      // pin reads as a marker, not a sticker.
      setPmaIcon(
        L.divIcon({
          className: "pma-pin",
          iconSize: [30, 34],
          iconAnchor: [15, 33],
          popupAnchor: [0, -30],
          html: [
            '<svg viewBox="0 0 30 34" width="30" height="34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="filter:drop-shadow(0 1px 1px rgba(0,0,0,.18))">',
            // Stem
            '<line x1="15" y1="22" x2="15" y2="33" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="square"/>',
            // Palette body — warm cream with ink outline
            '<ellipse cx="15" cy="11" rx="13" ry="9" fill="#faf3e6" stroke="#1a1a1a" stroke-width="1.4"/>',
            // Thumb hole
            '<ellipse cx="7.5" cy="11" rx="2" ry="2.6" fill="#1a1a1a" opacity="0.12"/>',
            '<ellipse cx="7.5" cy="11" rx="2" ry="2.6" fill="none" stroke="#1a1a1a" stroke-width="0.9"/>',
            // Paint dabs (PMA red, ochre, slate blue, pine green, plum)
            '<circle cx="15" cy="5.2" r="1.5" fill="#df1924"/>',
            '<circle cx="20" cy="7.5" r="1.4" fill="#e3c93c"/>',
            '<circle cx="22" cy="12.5" r="1.4" fill="#4b8da4"/>',
            '<circle cx="18" cy="16.5" r="1.4" fill="#3a8a64"/>',
            '<circle cx="13" cy="17" r="1.3" fill="#a13e8a"/>',
            "</svg>",
          ].join(""),
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
        {/* Stamen Watercolor — painter-grade tiles, hosted by Stadia
         * Maps. Free for low-traffic non-commercial use. Toner Labels
         * overlay sits on top so place names stay legible against the
         * watercolor wash.
         */}
        <TileLayer
          attribution='Tiles &copy; <a href="https://stamen.com" target="_blank" rel="noreferrer">Stamen Design</a>, hosted by <a href="https://stadiamaps.com" target="_blank" rel="noreferrer">Stadia Maps</a> · Data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
          url="https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg"
        />
        <TileLayer
          attribution=""
          url="https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}.png"
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
