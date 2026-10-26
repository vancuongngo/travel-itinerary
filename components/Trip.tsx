"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Category, Day, Stop, Trip as TripData } from "@/data/types";
import { daysUntil, fmtDate } from "@/lib/dates";
import type { MapStop } from "./DayMap";

// Leaflet touches `window`, so the map is client-only and loaded on demand.
const DayMap = dynamic(() => import("./DayMap"), { ssr: false });

type Tab = "plan" | "eat" | "prep";

const ICON: Record<Category, string> = {
  sight: "🏛️",
  food: "🍽️",
  transit: "🚆",
  stay: "🛏️",
  walk: "🚶",
  culture: "🎨",
  "day-trip": "🧭",
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const storageKey = (slug: string) => `trip-state-v1:${slug}`;

interface Persisted {
  done: Record<string, boolean>;
  packed: Record<string, boolean>;
  rainMode: boolean;
}

const EMPTY: Persisted = { done: {}, packed: {}, rainMode: false };

function loadState(slug: string): Persisted {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Google Maps query for a stop: the real place name plus its city. Placeholders resolve to null. */
function locationOf(s: Stop, day: Day): string | null {
  if (!s.place || s.place.startsWith("{{")) return null;
  return `${s.place}, ${day.city === "Transit" ? "Portugal" : `${day.city}, Portugal`}`;
}

function mapsUrl(loc: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
}

function dayRouteUrl(day: Day) {
  const locs = day.stops.map((s) => locationOf(s, day)).filter((l): l is string => l !== null);
  if (locs.length < 2) return null;
  return `https://www.google.com/maps/dir/${locs.map(encodeURIComponent).join("/")}`;
}

export default function Trip({ trip }: { trip: TripData }) {
  const { days: DAYS, foods: FOODS, packing: PACKING, tips: TIPS } = trip;
  const cityColor = (city: string) => trip.cities.find((c) => c.name === city)?.color ?? "var(--transit)";
  const [tab, setTab] = useState<Tab>("plan");
  const [activeId, setActiveId] = useState(DAYS[0].id);
  const [state, setState] = useState<Persisted>(EMPTY);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [mapAt, setMapAt] = useState<number | null>(null); // index into mapItems; null = closed
  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setState(loadState(trip.slug));
    setCountdown(daysUntil(trip.start));
    // Open on today's day while travelling.
    const today = new Date().toISOString().slice(0, 10);
    const match = DAYS.find((d) => d.date === today);
    if (match) setActiveId(match.id);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey(trip.slug), JSON.stringify(state));
    } catch {
      /* storage unavailable; state stays in memory */
    }
  }, [state, ready, trip.slug]);

  useEffect(() => {
    chipsRef.current
      ?.querySelector<HTMLElement>("[aria-selected='true']")
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeId]);

  const day = useMemo(() => DAYS.find((d) => d.id === activeId) ?? DAYS[0], [activeId]);
  const idx = DAYS.indexOf(day);
  const route = dayRouteUrl(day);

  const toggle = (key: "done" | "packed", id: string) =>
    setState((s) => ({ ...s, [key]: { ...s[key], [id]: !s[key][id] } }));

  const stops = state.rainMode ? day.stops.filter((s) => s.rainy || s.category === "transit" || s.category === "stay" || s.category === "food") : day.stops;
  const mapItems: MapStop[] = stops.flatMap((s) => {
    if (!s.coords) return [];
    const [lat, lng] = s.coords.split(",").map(Number);
    const loc = locationOf(s, day);
    return [{ stop: s, lat, lng, link: loc ? mapsUrl(loc) : null }];
  });
  const doneCount = day.stops.filter((s) => state.done[s.id]).length;

  return (
    <div className="shell">
      <header className="hero">
        <Link href="/" className="back">← All trips</Link>
        <p className="eyebrow">
          {fmtDate(trip.start, { day: "numeric", month: "short" })} – {fmtDate(trip.end, { day: "numeric", month: "short", year: "numeric" })}
        </p>
        <h1>{trip.name}</h1>
        <div className="hero-meta">
          <span className="pill">{DAYS.length} days</span>
          <span className="pill">{trip.cities.map((c) => c.name).join(" → ")}</span>
          {countdown !== null && countdown > 0 && <span className="pill accent">{countdown} days to go</span>}
          {countdown !== null && countdown <= 0 && countdown >= -DAYS.length && <span className="pill accent">Trip in progress</span>}
        </div>
      </header>

      {tab === "plan" && (
        <>
          <div className="chips" role="tablist" ref={chipsRef} aria-label="Days">
            {DAYS.map((d, i) => (
              <button
                key={d.id}
                role="tab"
                aria-selected={d.id === activeId}
                className="chip"
                style={{ "--city": cityColor(d.city) } as React.CSSProperties}
                onClick={() => setActiveId(d.id)}
              >
                <span className="chip-dow">{fmtDate(d.date, { weekday: "short" })}</span>
                <span className="chip-num">{fmtDate(d.date, { day: "numeric" })}</span>
                <span className="chip-city">D{i + 1}</span>
              </button>
            ))}
          </div>

          <main className="content">
            <section className="day-head" style={{ "--city": cityColor(day.city) } as React.CSSProperties}>
              <p className="eyebrow">
                {fmtDate(day.date, { weekday: "long", day: "numeric", month: "long" })} · {day.city}
              </p>
              <h2>{day.title}</h2>
              <p className="muted">{day.summary}</p>
              <div className="toolbar">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={state.rainMode}
                    onChange={() => setState((s) => ({ ...s, rainMode: !s.rainMode }))}
                  />
                  <span>☂ Rain mode</span>
                </label>
                {mapItems.length > 0 && (
                  <button className="btn primary" onClick={() => setMapAt(0)}>
                    🗺 Map
                  </button>
                )}
                {route && (
                  <a className="btn" href={route} target="_blank" rel="noopener noreferrer">
                    Day route ↗
                  </a>
                )}
                <span className="muted small">
                  {doneCount}/{day.stops.length} done
                </span>
              </div>
            </section>

            <ol className="timeline">
              {stops.map((s) => (
                <li key={s.id} className={`stop ${state.done[s.id] ? "done" : ""}`}>
                  <div className="time">{s.time}</div>
                  <div className="dot" aria-hidden>{ICON[s.category]}</div>
                  <div className="card">
                    <div className="card-top">
                      <h3>{s.title}</h3>
                      <input
                        type="checkbox"
                        aria-label={`Mark "${s.title}" done`}
                        checked={!!state.done[s.id]}
                        onChange={() => toggle("done", s.id)}
                      />
                    </div>
                    {s.note && <p className="note">{s.note}</p>}
                    <div className="card-foot">
                      {s.rainy && <span className="tag">☂ rain-proof</span>}
                      {s.coords && (
                        <button className="linkbtn" onClick={() => setMapAt(mapItems.findIndex((m) => m.stop.id === s.id))}>
                          📍 On map
                        </button>
                      )}
                      {locationOf(s, day) && (
                        <a href={mapsUrl(locationOf(s, day)!)} target="_blank" rel="noopener noreferrer">
                          Open in Maps ↗
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {stops.length === 0 && <li className="muted">Nothing rain-proof planned for this day.</li>}
            </ol>

            <nav className="pager">
              <button disabled={idx === 0} onClick={() => setActiveId(DAYS[idx - 1].id)}>← Previous</button>
              <button disabled={idx === DAYS.length - 1} onClick={() => setActiveId(DAYS[idx + 1].id)}>Next →</button>
            </nav>
          </main>
        </>
      )}

      {tab === "eat" && (
        <main className="content">
          <p className="muted small">What to try, with well-regarded places from travel guides (opening hours and prices unverified). Dishes already on your plan are tagged.</p>
          {FOODS.map((section) => (
            <section key={section.title} className="food-group" style={{ "--city": section.city ? cityColor(section.city) : "var(--accent)" } as React.CSSProperties}>
              <h2>{section.title}</h2>
              <ul className="list">
                {section.dishes.map((d) => (
                  <li key={d.name} className="card dish">
                    {d.image && (
                      <figure className="dish-fig">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`${BASE_PATH}/food/${d.image.file}`} alt={d.image.alt} loading="lazy" width={640} height={420} />
                        <figcaption>
                          Photo: {d.image.credit}, {d.image.license} ·{" "}
                          <a href={d.image.source} target="_blank" rel="noopener noreferrer">source</a>
                        </figcaption>
                      </figure>
                    )}
                    <h3>{d.name}</h3>
                    <p className="note">{d.what}</p>
                    {d.onPlan && <p className="card-foot"><span className="tag">On your plan: {d.onPlan}</span></p>}
                    {d.bestAt && (
                      <ul className="venues">
                        {d.bestAt.map((v) => (
                          <li key={v.name}>
                            <a href={mapsUrl(`${v.place}, Portugal`)} target="_blank" rel="noopener noreferrer">{v.name} ↗</a>
                            {v.note && <span className="muted small"> {v.note}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                    {d.tip && <p className="note small">💡 {d.tip}</p>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </main>
      )}

      {tab === "prep" && (
        <main className="content">
          <h2>Packing</h2>
          <ul className="list">
            {PACKING.map((item) => (
              <li key={item} className="card row">
                <label className={state.packed[item] ? "done" : ""}>
                  <input type="checkbox" checked={!!state.packed[item]} onChange={() => toggle("packed", item)} />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
          <h2>Good to know</h2>
          <ul className="list">
            {TIPS.map((t) => (
              <li key={t.title} className="card">
                <h3>{t.title}</h3>
                <p className="note">{t.body}</p>
              </li>
            ))}
          </ul>
        </main>
      )}

      {mapAt !== null && mapItems.length > 0 && (
        <DayMap
          key={day.id + state.rainMode}
          title={`${day.title} · ${fmtDate(day.date, { weekday: "short", day: "numeric", month: "short" })}`}
          color={cityColor(day.city)}
          items={mapItems}
          initial={Math.max(mapAt, 0)}
          onClose={() => setMapAt(null)}
        />
      )}

      <nav className="tabbar" aria-label="Sections">
        {([
          ["plan", "🗓️", "Plan"],
          ["eat", "🍽️", "Eat"],
          ["prep", "🎒", "Prep"],
        ] as const).map(([id, icon, label]) => (
          <button key={id} aria-current={tab === id} onClick={() => setTab(id)}>
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
