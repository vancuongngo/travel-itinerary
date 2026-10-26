export type Category = "sight" | "food" | "transit" | "stay" | "walk" | "culture" | "day-trip";

export interface Stop {
  id: string;
  time: string; // "HH:MM"
  title: string;
  category: Category;
  note?: string;
  /** Google Maps search query; omit for stops without a location. */
  place?: string;
  /** "lat,lng"; only used to draw the in-app day map. Links to Google Maps always use `place`. */
  coords?: string;
  /** Marks stops that work in the rain; used by rain mode. */
  rainy?: boolean;
}

export interface Day {
  id: string;
  date: string; // ISO yyyy-mm-dd
  /** Must match a name in Trip.cities, or "Transit". */
  city: string;
  title: string;
  summary: string;
  stops: Stop[];
}

export interface City {
  name: string;
  /** Any CSS colour; used for the day strip and headings. */
  color: string;
}

export interface Trip {
  slug: string;
  name: string;
  tagline: string;
  emoji: string;
  /** CSS gradient for the home-page card. */
  cover: string;
  start: string; // ISO
  end: string; // ISO
  cities: City[];
  days: Day[];
  packing: string[];
  tips: { title: string; body: string }[];
}
