import TripList from "@/components/TripList";
import { TRIPS } from "@/data/trips";

export default function Page() {
  return <TripList trips={TRIPS} />;
}
