import type { AuthUser } from "@/lib/auth";
import type { MyTripState } from "@/lib/my-trip";

export type UserSavedTrip = {
  id: string;
  title: string;
  destination: string;
  trip: MyTripState;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

const storageKey = "trippilot:user-trips";
const guestOwnerId = "guest";

type TripStore = Record<string, UserSavedTrip[]>;

export function getTripOwnerId(user: AuthUser | null) {
  return user?.id ?? guestOwnerId;
}

export function isGuestOwner(ownerId: string) {
  return ownerId === guestOwnerId;
}

export function createSavedUserTrip({
  destination,
  ownerId,
  title,
  trip,
}: {
  destination: string;
  ownerId: string;
  title: string;
  trip: MyTripState;
}): UserSavedTrip {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title,
    destination,
    trip,
    ownerId,
    createdAt: now,
    updatedAt: now,
  };
}

export function getUserTrips(ownerId: string) {
  return readStore()[ownerId] ?? [];
}

export function saveUserTrip(trip: UserSavedTrip) {
  const store = readStore();
  const trips = store[trip.ownerId] ?? [];
  const nextTrip = { ...trip, updatedAt: new Date().toISOString() };
  const nextTrips = [nextTrip, ...trips.filter((item) => item.id !== trip.id)];

  writeStore({ ...store, [trip.ownerId]: nextTrips });
  return nextTrips;
}

export function deleteUserTrip(ownerId: string, tripId: string) {
  const store = readStore();
  const nextTrips = (store[ownerId] ?? []).filter((trip) => trip.id !== tripId);
  writeStore({ ...store, [ownerId]: nextTrips });
  return nextTrips;
}

export function duplicateUserTrip(ownerId: string, tripId: string) {
  const trips = getUserTrips(ownerId);
  const source = trips.find((trip) => trip.id === tripId);

  if (!source) return trips;

  const copy = createSavedUserTrip({
    destination: source.destination,
    ownerId,
    title: `${source.title} Copy`,
    trip: source.trip,
  });

  return saveUserTrip(copy);
}

export function updateUserTrip(ownerId: string, tripId: string, updates: Partial<UserSavedTrip>) {
  const store = readStore();
  const trips = store[ownerId] ?? [];
  const nextTrips = trips.map((trip) =>
    trip.id === tripId ? { ...trip, ...updates, updatedAt: new Date().toISOString() } : trip,
  );

  writeStore({ ...store, [ownerId]: nextTrips });
  return nextTrips;
}

export function encodeSharedTrip(trip: UserSavedTrip) {
  return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(trip)))));
}

export function decodeSharedTrip(value: string | null) {
  if (!value) return null;

  try {
    return JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(value))))) as UserSavedTrip;
  } catch {
    return null;
  }
}

function readStore(): TripStore {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as TripStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: TripStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(store));
}
