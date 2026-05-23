"use client";

import { useMemo, useState } from "react";
import { SearchForm } from "@/components/search-form";
import { FlightCard, HotelCard, TripDealCard } from "@/components/deal-cards";
import type { FlightDeal, HotelDeal, TripDeal } from "@/types/travel-marketplace";
import { LoadingSkeletons } from "@/components/travel-dashboard-widgets";
import { toast } from "sonner";

export function SearchResultsView({
  flights,
  hotels,
  deals,
  warning,
  warnings,
}: {
  flights: FlightDeal[];
  hotels: HotelDeal[];
  deals: TripDeal[];
  warning?: string;
  warnings?: {
    flights?: string;
    hotels?: string;
  };
}) {
  const [maxPrice, setMaxPrice] = useState(2500);
  const [minHotelPrice, setMinHotelPrice] = useState(50);
  const [maxHotelPrice, setMaxHotelPrice] = useState(350);
  const [minRating, setMinRating] = useState(4);
  const [nonstopOnly, setNonstopOnly] = useState(false);
  const [minStars, setMinStars] = useState(3);
  const [selectedAmenity, setSelectedAmenity] = useState("all");
  const [accessibilityOnly, setAccessibilityOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"cheapest" | "best-value" | "rating">(
    "cheapest",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [optimizedDeals, setOptimizedDeals] = useState<TripDeal[] | null>(null);

  const availableAmenities = useMemo(
    () => Array.from(new Set(hotels.flatMap((hotel) => hotel.amenities))).sort(),
    [hotels],
  );

  const filteredDeals = useMemo(
    () => {
      const nextDeals = (optimizedDeals ?? deals)
        .filter((deal) => deal.estimatedTotal <= maxPrice)
        .filter((deal) => deal.hotel.pricePerNight >= minHotelPrice)
        .filter((deal) => deal.hotel.pricePerNight <= maxHotelPrice)
        .filter((deal) => deal.hotel.rating >= minRating)
        .filter((deal) => deal.hotel.stars >= minStars)
        .filter((deal) => (nonstopOnly ? deal.flight.nonstop : true))
        .filter((deal) =>
          accessibilityOnly
            ? deal.tags.some((tag) =>
                ["Accessible pace", "step-free-access", "short-walking-distances"].includes(tag),
              )
            : true,
        )
        .filter((deal) =>
          selectedAmenity === "all"
            ? true
            : deal.hotel.amenities.includes(selectedAmenity),
        );

      if (sortBy === "rating") {
        return nextDeals.sort((a, b) => b.hotel.rating - a.hotel.rating);
      }

      if (sortBy === "best-value") {
        return nextDeals.sort(
          (a, b) =>
            b.hotel.rating / b.estimatedTotal - a.hotel.rating / a.estimatedTotal,
        );
      }

      return nextDeals.sort((a, b) => a.estimatedTotal - b.estimatedTotal);
    },
    [
      deals,
      maxHotelPrice,
      maxPrice,
      minHotelPrice,
      minRating,
      minStars,
      nonstopOnly,
      selectedAmenity,
      sortBy,
      optimizedDeals,
      accessibilityOnly,
    ],
  );

  async function handleOptimizeTrip() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: maxPrice,
          deals,
        }),
      });

      if (!response.ok) {
        throw new Error("Optimization failed");
      }

      const data = (await response.json()) as { optimized: TripDeal[]; strategy: string };
      setOptimizedDeals(data.optimized);
      toast.success(data.strategy);
    } catch {
      toast.error("Could not optimize trips right now.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredHotels = useMemo(
    () =>
      hotels
        .filter((hotel) => hotel.pricePerNight <= maxHotelPrice)
        .filter((hotel) => hotel.pricePerNight >= minHotelPrice)
        .filter((hotel) => hotel.rating >= minRating)
        .filter((hotel) => hotel.stars >= minStars)
        .filter((hotel) =>
          selectedAmenity === "all" ? true : hotel.amenities.includes(selectedAmenity),
        )
        .filter((hotel) =>
          accessibilityOnly
            ? hotel.amenities.some((amenity) =>
                ["Elevator", "Accessible rooms", "Central location", "Metro nearby"].includes(
                  amenity,
                ),
              )
            : true,
        )
        .sort((a, b) => {
          if (sortBy === "rating") {
            return b.rating - a.rating;
          }

          if (sortBy === "best-value") {
            return b.rating / b.pricePerNight - a.rating / a.pricePerNight;
          }

          return a.pricePerNight - b.pricePerNight;
        }),
    [
      hotels,
      maxHotelPrice,
      minHotelPrice,
      minRating,
      minStars,
      selectedAmenity,
      sortBy,
      accessibilityOnly,
    ],
  );

  return (
    <main>
      <div className="sticky top-[73px] z-20 border-b border-slate-200 bg-slate-50/90 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl">
          <SearchForm compact />
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">
            סינון
          </h2>
          <div className="mt-5 grid gap-5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              מיון תוצאות
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950"
                onChange={(event) =>
                  setSortBy(event.target.value as "cheapest" | "best-value" | "rating")
                }
                value={sortBy}
              >
                <option value="cheapest">הזול ביותר</option>
                <option value="best-value">המשתלם ביותר</option>
                <option value="rating">הדירוג הגבוה ביותר</option>
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              מחיר מקסימלי לטיול: ${maxPrice}
              <input
                className="mt-3 w-full accent-sky-500"
                max="3000"
                min="500"
                onChange={(event) => {
                  setIsLoading(true);
                  setMaxPrice(Number(event.target.value));
                  window.setTimeout(() => setIsLoading(false), 250);
                }}
                type="range"
                value={maxPrice}
              />
            </label>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              מחיר מינימלי למלון ללילה: ${minHotelPrice}
              <input
                className="mt-3 w-full accent-sky-500"
                max="500"
                min="0"
                onChange={(event) => {
                  setIsLoading(true);
                  setMinHotelPrice(Number(event.target.value));
                  window.setTimeout(() => setIsLoading(false), 250);
                }}
                type="range"
                value={minHotelPrice}
              />
            </label>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              מחיר מקסימלי למלון ללילה: ${maxHotelPrice}
              <input
                className="mt-3 w-full accent-sky-500"
                max="600"
                min="50"
                onChange={(event) => {
                  setIsLoading(true);
                  setMaxHotelPrice(Number(event.target.value));
                  window.setTimeout(() => setIsLoading(false), 250);
                }}
                type="range"
                value={maxHotelPrice}
              />
            </label>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              דירוג מינימלי
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950"
                onChange={(event) => setMinRating(Number(event.target.value))}
                value={minRating}
              >
                <option value={4}>4.0+</option>
                <option value={4.5}>4.5+</option>
                <option value={4.8}>4.8+</option>
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              כוכבי מלון
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950"
                onChange={(event) => setMinStars(Number(event.target.value))}
                value={minStars}
              >
                <option value={3}>3+ stars</option>
                <option value={4}>4+ stars</option>
                <option value={5}>5 stars</option>
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              מתקנים
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950"
                onChange={(event) => setSelectedAmenity(event.target.value)}
                value={selectedAmenity}
              >
                <option value="all">כל המתקנים</option>
                {availableAmenities.map((amenity) => (
                  <option key={amenity} value={amenity}>
                    {amenity}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
              <input
                checked={nonstopOnly}
                onChange={(event) => setNonstopOnly(event.target.checked)}
                type="checkbox"
              />
              טיסות ישירות בלבד
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100">
              <input
                checked={accessibilityOnly}
                onChange={(event) => setAccessibilityOnly(event.target.checked)}
                type="checkbox"
              />
              הצג רק התאמות נגישות
            </label>
          </div>
        </aside>

        <div className="grid gap-8">
          <section>
            <p className="text-sm font-bold text-sky-600 dark:text-sky-300">
              מותאם למשפחות, מבוגרים ונגישות
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
              תוצאות חיפוש
            </h1>
            <button
              type="button"
              onClick={handleOptimizeTrip}
              className="mt-4 rounded-full bg-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-600"
            >
              שפרו לי את המסלול
            </button>
            {warning ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
                {warning}
              </div>
            ) : null}
            {warnings?.flights ? (
              <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-900 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-100">
                Flights: {warnings.flights}
              </div>
            ) : null}
            {warnings?.hotels ? (
              <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-100">
                Hotels: {warnings.hotels}
              </div>
            ) : null}
            {isLoading ? (
              <div className="mt-5">
                <LoadingSkeletons />
              </div>
            ) : (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {filteredDeals.length > 0 ? (
                  filteredDeals.map((deal, index) => (
                    <TripDealCard
                      key={deal.id}
                      trip={deal}
                      bestValue={index === 0}
                    />
                  ))
                ) : (
                  <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-white/10 dark:bg-slate-900">
                    לא נמצאו מסלולים שמתאימים לסינון הנוכחי.
                  </div>
                )}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">
              טיסות
            </h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {flights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">
              מלונות
            </h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {filteredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
