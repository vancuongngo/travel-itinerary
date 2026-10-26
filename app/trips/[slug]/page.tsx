import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Trip from "@/components/Trip";
import { TRIPS, getTrip } from "@/data/trips";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRIPS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const trip = getTrip((await params).slug);
  return trip ? { title: trip.name, description: trip.tagline } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const trip = getTrip((await params).slug);
  if (!trip) notFound();
  return <Trip trip={trip} />;
}
