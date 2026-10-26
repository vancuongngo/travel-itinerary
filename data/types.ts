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

export interface Dish {
  name: string;
  what: string;
  /** Short hint on where to try it. */
  where?: string;
  /** Google Maps search query for `where`; omit when it's a generic tip. */
  place?: string;
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
