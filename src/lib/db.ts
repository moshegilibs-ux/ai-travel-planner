import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import type { AuthUser } from "@/lib/auth";
import { getFirebaseDb } from "@/lib/firebase";
import type { SavedItinerary } from "@/lib/saved-itineraries";

const cloudDraftKey = "ai-travel-planner:cloud-ready-itineraries";

type UserItineraryMap = Record<string, SavedItinerary[]>;

function readCloudDraftStore(): UserItineraryMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const value = window.localStorage.getItem(cloudDraftKey);
    return value ? (JSON.parse(value) as UserItineraryMap) : {};
  } catch {
    return {};
  }
}

function writeCloudDraftStore(store: UserItineraryMap) {
  window.localStorage.setItem(cloudDraftKey, JSON.stringify(store));
}

function getUserItinerariesCollection(user: AuthUser) {
  const db = getFirebaseDb();

  if (!db || user.provider !== "firebase") {
    return null;
  }

  return collection(db, "users", user.id, "itineraries");
}

function getSafeDocumentId(id: string) {
  return encodeURIComponent(id);
}

export async function getUserItineraries(user: AuthUser) {
  const itinerariesCollection = getUserItinerariesCollection(user);

  if (itinerariesCollection) {
    const snapshot = await getDocs(
      query(itinerariesCollection, orderBy("createdAt", "desc")),
    );

    return snapshot.docs.map((document) => document.data() as SavedItinerary);
  }

  const store = readCloudDraftStore();
  return store[user.id] ?? [];
}

export async function saveUserItinerary(
  user: AuthUser,
  itinerary: SavedItinerary,
) {
  const itinerariesCollection = getUserItinerariesCollection(user);

  if (itinerariesCollection) {
    await setDoc(
      doc(itinerariesCollection, getSafeDocumentId(itinerary.id)),
      itinerary,
    );

    return getUserItineraries(user);
  }

  const store = readCloudDraftStore();
  const userItineraries = store[user.id] ?? [];

  if (userItineraries.some((item) => item.id === itinerary.id)) {
    return userItineraries;
  }

  const nextUserItineraries = [itinerary, ...userItineraries];
  writeCloudDraftStore({
    ...store,
    [user.id]: nextUserItineraries,
  });

  return nextUserItineraries;
}

export async function deleteUserItinerary(user: AuthUser, itineraryId: string) {
  const itinerariesCollection = getUserItinerariesCollection(user);

  if (itinerariesCollection) {
    await deleteDoc(doc(itinerariesCollection, getSafeDocumentId(itineraryId)));
    return getUserItineraries(user);
  }

  const store = readCloudDraftStore();
  const nextUserItineraries = (store[user.id] ?? []).filter(
    (itinerary) => itinerary.id !== itineraryId,
  );

  writeCloudDraftStore({
    ...store,
    [user.id]: nextUserItineraries,
  });

  return nextUserItineraries;
}
