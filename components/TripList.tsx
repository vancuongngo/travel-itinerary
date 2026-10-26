"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Trip } from "@/data/types";
import { daysUntil, fmtDate, tripLength, tripStatus, type TripStatus } from "@/lib/dates";

const LABEL: Record<TripStatus, string> = { upcoming: "Upcoming", active: "In progress", past: "Past" };

export default function TripList({ trips }: { trips: Trip[] }) {
  // Status depends on the viewer's clock, so resolve after hydration.
  const [now, setNow] = useState(false);
  useEffect(() => setNow(true), []);

  const sorted = [...trips].sort((a, b) => a.start.localeCompare(b.start));
  const withStatus = sorted.map((t) => ({ trip: t, status: now ? tripStatus(t.start, t.end) : ("upcoming" as TripStatus) }));
  const order: TripStatus[] = ["active", "upcoming", "past"];
  const groups = order
    .map((s) => ({ status: s, items: withStatus.filter((x) => x.status === s) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="shell">
      <header className="hero">
        <p className="eyebrow">Itineraries</p>
        <h1>My trips</h1>
        <p className="muted">{trips.length} {trips.length === 1 ? "trip" : "trips"}</p>
      </header>

      <main className="content">
        {groups.map((g) => (
          <section key={g.status} className="group">
            <h2 className="group-title">{LABEL[g.status]}</h2>
            <ul className="list">
              {g.items.map(({ trip, status }) => (
                <li key={trip.slug}>
                  <Link href={`/trips/${trip.slug}/`} className="trip-card">
                    <div className="trip-cover" style={{ background: trip.cover }} aria-hidden>
                      <span>{trip.emoji}</span>
                      {now && status === "upcoming" && <em>{daysUntil(trip.start)} days to go</em>}
                      {status === "active" && <em>Happening now</em>}
                    </div>
                    <div className="trip-body">
                      <h3>{trip.name}</h3>
                      <p className="muted">{trip.tagline}</p>
                      <p className="small muted">
                        {fmtDate(trip.start, { day: "numeric", month: "short" })} – {fmtDate(trip.end, { day: "numeric", month: "short", year: "numeric" })}
                        {" · "}{tripLength(trip.start, trip.end)} days · {trip.cities.map((c) => c.name).join(" → ")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
