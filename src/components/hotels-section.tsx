"use client";

import { useEffect, useMemo, useState } from "react";
import { BedDouble, Hotel, SlidersHorizontal } from "lucide-react";
import { HotelCard } from "@/components/deal-cards";
import { searchHotels } from "@/services/api/hotels";
import type { HotelDeal } from "@/types/travel-marketplace";

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

const selectClass = inputClass;

type SortOption = "cheapest" | "rating" | "stars";

function isAccessibleHotel(hotel: HotelDeal): boolean {
  const haystack = [...(hotel.suitability ?? []), ...(hotel.amenities ?? [])]
    .join(" ")
    .toLowerCase();
  return /accessible|wheelchair|step-free|elevator|נגיש|מעלית|כיסא גלגלים/.test(
    haystack,
  );
}

export function HotelsSection({
  destination: initialDestination,
  checkInDate: checkInProp,
  checkOutDate: checkOutProp,
  selectedHotel,
  onSelectHotel,
}: {
  destination: string;
  checkInDate?: string;
  checkOutDate?: string;
  selectedHotel: HotelDeal | null;
  onSelectHotel: (hotel: HotelDeal) => void;
}) {
  const [destination, setDestination] = useState(initialDestination || "");
  const [checkInDate, setCheckInDate] = useState(checkInProp || "");
  const [checkOutDate, setCheckOutDate] = useState(checkOutProp || "");
  const [adults, setAdults] = useState(2);
  const [searchedDestination, setSearchedDestination] = useState(
    initialDestination || "",
  );
  const [searchedCheckIn, setSearchedCheckIn] = useState("");
  const [searchedCheckOut, setSearchedCheckOut] = useState("");
  const [searchedAdults, setSearchedAdults] = useState(2);
  const [searchNonce, setSearchNonce] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hotels, setHotels] = useState<HotelDeal[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [maxPrice, setMaxPrice] = useState(600);
  const [minRating, setMinRating] = useState(0);
  const [minStars, setMinStars] = useState(0);
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [area, setArea] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("cheapest");

  // Prefill the search inputs from the planner (destination + dates). Updates
  // the visible fields only; the user still presses "search" to run a query.
  useEffect(() => {
    if (initialDestination) setDestination(initialDestination);
    if (checkInProp) setCheckInDate(checkInProp);
    if (checkOutProp) setCheckOutDate(checkOutProp);
  }, [initialDestination, checkInProp, checkOutProp]);

  useEffect(() => {
    if (!searchedDestination.trim()) {
      setHotels([]);
      setHasSearched(false);
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setStatusMessage("");
    setErrorMessage("");

    searchHotels({
      destination: searchedDestination,
      checkInDate: searchedCheckIn || undefined,
      checkOutDate: searchedCheckOut || undefined,
      adults: searchedAdults,
    })
      .then((result) => {
        if (!isActive) return;
        setHotels(result.hotels);
        setStatusMessage(result.warning ?? "");
        setErrorMessage(result.error ?? "");
        setHasSearched(true);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isActive) return;
        setHotels([]);
        setStatusMessage("");
        setErrorMessage("שגיאה בחיפוש מלונות. נסו שוב בעוד רגע.");
        setHasSearched(true);
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [searchedDestination, searchedCheckIn, searchedCheckOut, searchedAdults, searchNonce]);

  const visibleHotels = useMemo(() => {
    const areaText = area.trim().toLowerCase();
    return hotels
      .filter((hotel) => {
        const price = hotel.pricePerNight;
        if (price !== null && price > maxPrice) return false;
        if (hotel.rating < minRating) return false;
        if (hotel.stars < minStars) return false;
        if (accessibleOnly && !isAccessibleHotel(hotel)) return false;
        if (areaText && !(hotel.location || "").toLowerCase().includes(areaText)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "stars") return b.stars - a.stars;
        const pa = a.pricePerNight ?? Number.MAX_SAFE_INTEGER;
        const pb = b.pricePerNight ?? Number.MAX_SAFE_INTEGER;
        return pa - pb;
      });
  }, [hotels, maxPrice, minRating, minStars, accessibleOnly, area, sortBy]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setHotels([]);
    setStatusMessage("");
    setErrorMessage("");
    setSearchedDestination(destination.trim());
    setSearchedCheckIn(checkInDate);
    setSearchedCheckOut(checkOutDate);
    setSearchedAdults(adults);
    setSearchNonce((value) => value + 1);
  }

  return (
    <section className="mt-8 rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-5 shadow-sm md:p-6">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-black text-amber-700 shadow-sm">
            <Hotel className="h-4 w-4" />
            חיפוש מלונות אמיתי
          </p>
          <h3 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
            בחרו מלון נגיש שמתאים למסלול
          </h3>
          <p className="mt-2 leading-7 text-slate-600">
            חיפוש מלונות עובד דרך שכבת API מאובטחת מול Amadeus. כל עוד מפתחות
            Amadeus לא הוגדרו, מלונות אמיתיים אינם זמינים ויוצג מצב ״לא זמין״ —
            בלי מחירים מדומים.
          </p>
        </div>

        {selectedHotel ? (
          <div className="rounded-2xl border border-emerald-200 bg-white p-4 text-sm leading-6 text-emerald-950 shadow-sm">
            <p className="font-black">המלון שנבחר למסלול</p>
            <p className="mt-1">
              {selectedHotel.name} · {selectedHotel.location} ·{" "}
              {selectedHotel.pricePerNight !== null
                ? `$${selectedHotel.pricePerNight}/לילה (הערכה)`
                : "מחיר לא זמין"}
            </p>
          </div>
        ) : null}
      </div>

      <form
        onSubmit={handleSearch}
        className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_0.7fr_auto]"
      >
        <label className="font-bold text-slate-800">
          יעד
          <input
            className={inputClass}
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="לאן נוסעים?"
          />
        </label>
        <label className="font-bold text-slate-800">
          צ׳ק-אין
          <input
            className={inputClass}
            value={checkInDate}
            onChange={(event) => setCheckInDate(event.target.value)}
            type="date"
          />
        </label>
        <label className="font-bold text-slate-800">
          צ׳ק-אאוט
          <input
            className={inputClass}
            value={checkOutDate}
            onChange={(event) => setCheckOutDate(event.target.value)}
            type="date"
          />
        </label>
        <label className="font-bold text-slate-800">
          אורחים
          <input
            className={inputClass}
            min="1"
            max="9"
            value={adults}
            onChange={(event) => setAdults(Number(event.target.value))}
            type="number"
          />
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-amber-700 disabled:bg-slate-400"
        >
          <Hotel className="h-5 w-5" />
          {isLoading ? "מחפש..." : "חפש מלונות"}
        </button>
      </form>

      {isLoading ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center font-bold text-amber-900">
          מחפש מלונות...
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-center font-bold text-red-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-3 flex items-center gap-2 font-black text-slate-950">
          <SlidersHorizontal className="h-5 w-5 text-amber-700" />
          סינון ומיון
        </p>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <label className="text-sm font-bold text-slate-700">
            מיון
            <select
              className={selectClass}
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
            >
              <option value="cheapest">הכי זול</option>
              <option value="rating">דירוג גבוה</option>
              <option value="stars">כוכבים</option>
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">
            מחיר מקסימלי ללילה (${maxPrice})
            <input
              className="mt-4 w-full accent-amber-600"
              type="range"
              min={50}
              max={1000}
              step={25}
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
            />
          </label>
          <label className="text-sm font-bold text-slate-700">
            דירוג מינימלי
            <select
              className={selectClass}
              value={minRating}
              onChange={(event) => setMinRating(Number(event.target.value))}
            >
              <option value={0}>הכל</option>
              <option value={3}>3+</option>
              <option value={4}>4+</option>
              <option value={4.5}>4.5+</option>
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">
            כוכבים מינימליים
            <select
              className={selectClass}
              value={minStars}
              onChange={(event) => setMinStars(Number(event.target.value))}
            >
              <option value={0}>הכל</option>
              <option value={3}>3+</option>
              <option value={4}>4+</option>
              <option value={5}>5</option>
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">
            אזור
            <input
              className={inputClass}
              value={area}
              onChange={(event) => setArea(event.target.value)}
              placeholder="מרכז / חוף / שכונה"
            />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800">
            <input
              type="checkbox"
              checked={accessibleOnly}
              onChange={(event) => setAccessibleOnly(event.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-amber-700"
            />
            נגיש בלבד
          </label>
        </div>
      </div>

      {!isLoading && hasSearched && visibleHotels.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center font-bold text-slate-600">
          {statusMessage || errorMessage || "מלונות אמיתיים לא זמינים כרגע"}
        </div>
      ) : !isLoading && visibleHotels.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              isSelected={selectedHotel?.id === hotel.id}
              onSelect={onSelectHotel}
            />
          ))}
        </div>
      ) : !isLoading && !hasSearched ? (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center font-bold text-slate-500">
          <BedDouble className="h-5 w-5" />
          הזינו יעד ולחצו ״חפש מלונות״ כדי לראות מלונות אמיתיים.
        </div>
      ) : null}
    </section>
  );
}
