export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", opts);
}

export function daysUntil(iso: string) {
  const start = new Date(`${iso}T00:00:00`).getTime();
  return Math.ceil((start - Date.now()) / 86_400_000);
}

export type TripStatus = "upcoming" | "active" | "past";

export function tripStatus(start: string, end: string): TripStatus {
  const today = new Date().toISOString().slice(0, 10);
  if (today < start) return "upcoming";
  if (today > end) return "past";
  return "active";
}

export function tripLength(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1;
}
