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
      // Painter's palette pin — kidney path with thumb cutout, four paint
      // dabs + a white aperture for the active spot. Ported from V2 (Codex)
      // with PMA palette colors. Soft drop shadow keeps the pin legible
      // on the cream Positron basemap.
      setPmaIcon(
        L.divIcon({
          className: "pma-palette-marker",
          iconSize: [38, 34],
          iconAnchor: [19, 17],
          popupAnchor: [0, -18],
          html:
            '<svg viewBox="0 0 38 34" width="38" height="34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="filter: drop-shadow(0 5px 12px rgba(0,0,0,.22))">' +
            // Kidney palette body with thumb cutout
            '<path d="M20 1.5C9.8 1.5 2.5 8.4 2.5 17.2c0 8.1 6.7 14.5 15.9 14.5h3.3c2.6 0 4.2-2.8 2.8-5-.7-1.1-.1-2.5 1.2-2.6l3.2-.2c4-.3 6.6-3.4 6.6-7.1 0-8.3-6.4-15.3-15.5-15.3Z" fill="rgba(255,255,255,.96)" stroke="#111111" stroke-width="1.1"/>' +
            // Paint dabs
            '<circle cx="12.2" cy="13.2" r="2.5" fill="#4b8da4"/>' +
            '<circle cx="19.2" cy="9.5" r="2.5" fill="#f76a0c"/>' +
            '<circle cx="26.4" cy="13.4" r="2.5" fill="#df1924"/>' +
            '<circle cx="16.1" cy="20.7" r="2.5" fill="#111111"/>' +
            // White aperture (active dab)
            '<circle cx="26.4" cy="21.3" r="3.2" fill="#ffffff" stroke="#111111" stroke-width="1"/>' +
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
    <div className="relative h-[520px] w-full overflow-hidden border border-border bg-[#f4f1ec] [&_.leaflet-control-attribution]:font-data [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-popup-content-wrapper]:rounded-none [&_.leaflet-popup-content-wrapper]:border [&_.leaflet-popup-content-wrapper]:border-border [&_.leaflet-popup-content-wrapper]:shadow-xl [&_.leaflet-popup-content]:m-4">
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        {/* CARTO Positron (light_all) — minimal cream/grey editorial
         * cartography. Free, no API key. Sits quiet beneath the pins so
         * the painter palette + the work imagery in popups carry the
         * visual weight.
         */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
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
