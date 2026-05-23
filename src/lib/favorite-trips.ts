import type { TripDeal } from "@/types/travel-marketplace";

const storageKey = "ai-travel-planner:favorite-trips";

export function getFavoriteTrips() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as TripDeal[]) : [];
  } catch {
    return [];
  }
}

export function saveFavoriteTrip(trip: TripDeal) {
  const favorites = getFavoriteTrips();

  if (favorites.some((favorite) => favorite.id === trip.id)) {
    return favorites;
  }

  const nextFavorites = [trip, ...favorites];
  window.localStorage.setItem(storageKey, JSON.stringify(nextFavorites));
  return nextFavorites;
}

export function removeFavoriteTrip(id: string) {
  const nextFavorites = getFavoriteTrips().filter((trip) => trip.id !== id);
  window.localStorage.setItem(storageKey, JSON.stringify(nextFavorites));
  return nextFavorites;
}
