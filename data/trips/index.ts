import type { Trip } from "../types";
import { portugal2026 } from "./portugal-2026";

// Register new trips here. Order doesn't matter; the home page sorts by start date.
export const TRIPS: Trip[] = [portugal2026];

export const getTrip = (slug: string) => TRIPS.find((t) => t.slug === slug);
