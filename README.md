# Travel itinerary

A mobile-first itinerary app built with Next.js (static export) and hosted on GitHub Pages.
Each trip has its own page with a day-by-day timeline, a per-day map, bookings, packing and tips.

Live site: https://vancuongngo.github.io/travel-itinerary/

## Features

- Home page with a card per trip, grouped as in progress, upcoming and past.
- Day strip and timeline per trip, opening on today's day while travelling.
- Full-screen day map (Leaflet + OpenStreetMap) with numbered pins in visiting order.
- Rain mode: shows only indoor, food, transit and lodging stops.
- Tick-off stops and packing items, saved per trip in the browser (`localStorage`).
- Google Maps links built from place names, plus a chained "Day route" link.
- Light and dark mode.

## Run locally

```sh
npm install
npm run dev        # http://localhost:3000 (or the next free port)
npm run typecheck
npm run build      # static export to ./out
```

To test the build the way GitHub Pages serves it, set the base path:

```sh
BASE_PATH=/travel-itinerary npm run build
```

## Add a trip

1. Copy `data/trips/portugal-2026.ts` to a new file and edit it (types are in `data/types.ts`).
2. Register it in the `TRIPS` array in `data/trips/index.ts`.

The home page and the `/trips/<slug>/` route pick it up on the next build.

Stops can have a `place` (used for Google Maps links) and optional `coords` as `"lat,lng"`
(used only to draw pins on the in-app map). Stops without `coords` don't appear on the map.

## Privacy

This repo and the site are public. Keep booking references, hotel names and addresses out of the data files:
use placeholders like `{{PORTO_HOTEL_BOOKING_REF}}` and fill real values in locally only.

## Workflow

- `main` is protected: changes go through a feature branch and a pull request.
- Pull requests run `.github/workflows/ci.yml` (typecheck and build). The `check` job must pass.
- Pushes to `main` run `.github/workflows/deploy.yml`, which builds with `BASE_PATH=/<repo-name>` and deploys to GitHub Pages.

## Notes

- The map needs a network connection (tiles are not cached offline).
- Opening hours, prices and timings in the itinerary are unverified; check before booking.
