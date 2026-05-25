import type {
  FlightDeal,
  HotelDeal,
  ShortTermRental,
} from "@/types/travel-marketplace";
import type { CustomItineraryDay } from "@/lib/generate-itinerary";

export type MyTripState = {
  flights: FlightDeal[];
  hotels: HotelDeal[];
  rentals: ShortTermRental[];
  attractions: Array<{ id: string; name: string; description?: string; price?: number }>;
  itinerary: CustomItineraryDay[];
  savedAt?: string;
};

export const myTripStorageKey = "trippilot:my-trip";

const emptyTrip: MyTripState = {
  flights: [],
  hotels: [],
  rentals: [],
  attractions: [],
  itinerary: [],
};

export function getEmptyTrip(): MyTripState {
  return { ...emptyTrip, attractions: [], flights: [], hotels: [], itinerary: [], rentals: [] };
}

export function readMyTrip(): MyTripState {
  if (typeof window === "undefined") return getEmptyTrip();

  try {
    const raw = window.localStorage.getItem(myTripStorageKey);
    return raw ? { ...getEmptyTrip(), ...(JSON.parse(raw) as Partial<MyTripState>) } : getEmptyTrip();
  } catch {
    return getEmptyTrip();
  }
}

export function writeMyTrip(trip: MyTripState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(myTripStorageKey, JSON.stringify(trip));
  window.dispatchEvent(new Event("my-trip-updated"));
}

export function saveMyTripSnapshot(trip: MyTripState) {
  writeMyTrip({ ...trip, savedAt: new Date().toISOString() });
}

export function addFlightToMyTrip(flight: FlightDeal) {
  const trip = readMyTrip();
  writeMyTrip({ ...trip, flights: upsertById(trip.flights, flight) });
}

export function addHotelToMyTrip(hotel: HotelDeal) {
  const trip = readMyTrip();
  writeMyTrip({ ...trip, hotels: upsertById(trip.hotels, hotel) });
}

export function addRentalToMyTrip(rental: ShortTermRental) {
  const trip = readMyTrip();
  writeMyTrip({ ...trip, rentals: upsertById(trip.rentals, rental) });
}

export function removeFromMyTrip(key: "flights" | "hotels" | "rentals" | "attractions" | "itinerary", id: string) {
  const trip = readMyTrip();
  const nextTrip: MyTripState =
    key === "flights"
      ? { ...trip, flights: trip.flights.filter((item) => item.id !== id) }
      : key === "hotels"
        ? { ...trip, hotels: trip.hotels.filter((item) => item.id !== id) }
        : key === "rentals"
          ? { ...trip, rentals: trip.rentals.filter((item) => item.id !== id) }
          : key === "attractions"
            ? { ...trip, attractions: trip.attractions.filter((item) => item.id !== id) }
            : { ...trip, itinerary: trip.itinerary.filter((item) => String(item.day) !== id) };
  writeMyTrip(nextTrip);
  return nextTrip;
}

function upsertById<T extends { id: string }>(items: T[], item: T) {
  return [item, ...items.filter((existing) => existing.id !== item.id)];
}
