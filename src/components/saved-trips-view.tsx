"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { getFavoriteTrips, removeFavoriteTrip } from "@/lib/favorite-trips";
import type { TripDeal } from "@/types/travel-marketplace";

export function SavedTripsView() {
  const [trips, setTrips] = useState<TripDeal[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      const localTrips = getFavoriteTrips();
      setTrips(localTrips);

      try {
        const response = await fetch("/api/saved-trips");

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          trips?: Array<{ payload: TripDeal }>;
        };

        if (data.trips?.length) {
          setTrips(data.trips.map((trip) => trip.payload));
        }
      } catch {
        setTrips(localTrips);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8">
        <p className="text-sm font-bold text-sky-600 dark:text-sky-300">
          Favorite trips
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">
          Saved trips
        </h1>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-white/10 dark:bg-slate-900">
          <h2 className="text-2xl font-black">No saved trips yet</h2>
          <p className="mt-3 text-slate-500">
            Save a trip from the search results and it will appear here.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
          >
            Browse deals
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {trips.map((trip) => (
            <article
              key={trip.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                    {trip.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {trip.destination} · {trip.flight.airline} · {trip.hotel.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTrips(removeFavoriteTrip(trip.id))}
                  className="rounded-full border border-red-200 p-3 text-red-600 transition hover:bg-red-50"
                  aria-label="Remove saved trip"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-2xl font-black">${trip.estimatedTotal}</span>
                <Link
                  href={`/trip/${trip.id}`}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
                >
                  Open trip
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
