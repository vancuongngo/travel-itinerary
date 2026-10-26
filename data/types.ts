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

export interface Venue {
  name: string;
  note?: string;
  /** Google Maps search query. */
  place: string;
}

export interface DishImage {
  /** File name under public/food. */
  file: string;
  alt: string;
  credit: string;
  license: string;
  /** Wikimedia Commons page for the file. */
  source: string;
}

export interface Dish {
  name: string;
  what: string;
  image?: DishImage;
  /** Well-regarded places to try it, from travel guides (unverified). */
  bestAt?: Venue[];
  /** Advice when there's no specific place to name. */
  tip?: string;
  /** Set when a stop in the itinerary already covers this dish. */
  onPlan?: string;
}

export interface FoodSection {
  title: string;
  /** Matches a name in Trip.cities for the heading colour; omit for country-wide sections. */
  city?: string;
  dishes: Dish[];
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
  foods: FoodSection[];
  packing: string[];
  tips: { title: string; body: string }[];
}
