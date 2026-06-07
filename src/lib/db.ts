import type { AuthUser } from "@/lib/auth";
import type { SavedItinerary } from "@/lib/saved-itineraries";
import { getSavedItineraries, removeSavedItinerary, saveItineraries } from "@/lib/saved-itineraries";

export async function getUserItineraries(_user: AuthUser) {
  void _user;
  return getSavedItineraries();
}

export async function saveUserItinerary(_user: AuthUser, item: SavedItinerary) {
  void _user;
  const next = [item, ...getSavedItineraries()];
  saveItineraries(next);
  return next;
}

export async function deleteUserItinerary(_user: AuthUser, id: string) {
  void _user;
  return removeSavedItinerary(id);
}
