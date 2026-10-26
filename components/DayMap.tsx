"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Stop } from "@/data/types";

export interface MapStop {
  stop: Stop;
  lat: number;
  lng: number;
  /** Google Maps link built from the real place name, or null. */
  link: string | null;
}

interface Props {
  title: string;
  color: string;
  items: MapStop[];
  initial: number;
  onClose: () => void;
}

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

function pin(n: number, color: string, active: boolean) {
  return L.divIcon({
    className: "pin-wrap",
    html: `<span class="pin${active ? " active" : ""}" style="--pin:${color}">${n}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

/** Full-screen day map: numbered pins in visiting order, a card for the selected stop underneath. */
export default function DayMap({ title, color, items, initial, onClose }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const [sel, setSel] = useState(Math.min(initial, items.length - 1));
  const selRef = useRef(sel);
  selRef.current = sel;

  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, { zoomControl: false, attributionControl: true });
    L.tileLayer(TILE_URL, {
      maxZoom: 19,
      className: "osm-tiles", // dimmed/inverted in dark mode via CSS
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m);
    const pts = items.map((i) => L.latLng(i.lat, i.lng));
    if (pts.length > 1) L.polyline(pts, { color, weight: 3, opacity: 0.7, dashArray: "6 8" }).addTo(m);
    markers.current = items.map((it, i) =>
      L.marker(pts[i], { icon: pin(i + 1, color, i === selRef.current), keyboard: false })
        .on("click", () => setSel(i))
        .addTo(m),
    );
    m.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 16 });
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, [items, color]);

  useEffect(() => {
    markers.current.forEach((mk, i) => mk.setIcon(pin(i + 1, color, i === sel)));
    const it = items[sel];
    // Keep the overview from fitBounds; only pan when the selected pin is off-screen.
    const m = map.current;
    if (it && m && !m.getBounds().pad(-0.1).contains([it.lat, it.lng])) m.panTo([it.lat, it.lng], { animate: true });
  }, [sel, items, color]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const cur = items[sel];
  return (
    <div className="mapsheet" role="dialog" aria-modal="true" aria-label={`Map: ${title}`}>
      <header className="mapsheet-head">
        <strong>{title}</strong>
        <button className="btn" onClick={onClose}>Close ✕</button>
      </header>
      <div ref={el} className="mapsheet-map" />
      {cur && (
        <div className="mapsheet-card">
          <div className="mapsheet-row">
            <span className="pin static" style={{ "--pin": color } as React.CSSProperties}>{sel + 1}</span>
            <div>
              <p className="small muted">{cur.stop.time} · {sel + 1} of {items.length}</p>
              <h3>{cur.stop.title}</h3>
            </div>
          </div>
          {cur.stop.note && <p className="note">{cur.stop.note}</p>}
          <div className="mapsheet-actions">
            <button className="btn" disabled={sel === 0} onClick={() => setSel(sel - 1)}>← Prev</button>
            <button className="btn" disabled={sel === items.length - 1} onClick={() => setSel(sel + 1)}>Next →</button>
            {cur.link && (
              <a className="btn" href={cur.link} target="_blank" rel="noopener noreferrer">Open in Maps ↗</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
