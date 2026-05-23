"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  BadgeCheck,
  Clock3,
  Info,
  Luggage,
  Plane,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import {
  FlightDeal,
  FlightFilters,
  formatFlightDuration,
  getFlightAirlines,
  searchFlights,
  sortAndFilterFlights,
} from "@/services/api/flights";

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

const selectClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

export function FlightsSection({
  selectedFlight,
  onSelectFlight,
}: {
  selectedFlight: FlightDeal | null;
  onSelectFlight: (flight: FlightDeal) => void;
}) {
  const [origin, setOrigin] = useState("TLV");
  const [destination, setDestination] = useState("ATH");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [searchedOrigin, setSearchedOrigin] = useState("TLV");
  const [searchedDestination, setSearchedDestination] = useState("ATH");
  const [searchedDepartureDate, setSearchedDepartureDate] = useState("");
  const [searchedReturnDate, setSearchedReturnDate] = useState("");
  const [searchedAdults, setSearchedAdults] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [flights, setFlights] = useState<FlightDeal[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchNonce, setSearchNonce] = useState(0);
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FlightFilters>({
    sortBy: "cheapest",
    directOnly: false,
    airline: "all",
    maxStops: "any",
    timeOfDay: "all",
  });

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setStatusMessage("");
    setErrorMessage("");
    searchFlights({
      origin: searchedOrigin,
      destination: searchedDestination,
      departureDate: searchedDepartureDate || undefined,
      returnDate: searchedReturnDate || undefined,
      adults: searchedAdults,
    }).then((result) => {
      if (!isActive) return;
      setFlights(result.flights);
      setStatusMessage(result.warning ?? "");
      setErrorMessage(result.error ?? "");
      setHasSearched(true);
      setIsLoading(false);
    }).catch(() => {
      if (!isActive) return;
      setFlights([]);
      setStatusMessage("");
      setErrorMessage("שגיאה בחיפוש טיסות. נסו שוב בעוד רגע.");
      setHasSearched(true);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [
    searchedOrigin,
    searchedDestination,
    searchedDepartureDate,
    searchedReturnDate,
    searchedAdults,
    searchNonce,
  ]);

  const airlines = useMemo(() => getFlightAirlines(flights), [flights]);
  const visibleFlights = useMemo(
    () => sortAndFilterFlights(flights, filters),
    [flights, filters],
  );

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatusMessage("");
    setErrorMessage("");
    setFlights([]);
    setSearchedOrigin(origin.trim() || "TLV");
    setSearchedDestination(destination.trim() || "ATH");
    setSearchedDepartureDate(departureDate);
    setSearchedReturnDate(returnDate);
    setSearchedAdults(adults);
    setSearchNonce((value) => value + 1);
  }

  return (
    <section className="mt-8 rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5 shadow-sm md:p-6">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-black text-sky-700 shadow-sm">
            <Plane className="h-4 w-4" />
            מערכת טיסות חכמה
          </p>
          <h3 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
            בחרו טיסה שמתאימה למסלול
          </h3>
          <p className="mt-2 leading-7 text-slate-600">
            חיפוש טיסות עובד דרך שכבת API מאובטחת. אם Amadeus לא מוגדר או לא
            מחזיר תוצאות, מוצגות טיסות mock כדי שהמסלול ימשיך לעבוד.
          </p>
        </div>

        {selectedFlight ? (
          <div className="rounded-2xl border border-emerald-200 bg-white p-4 text-sm leading-6 text-emerald-950 shadow-sm">
            <p className="font-black">הטיסה שנבחרה למסלול</p>
            <p className="mt-1">
              {selectedFlight.airline} {selectedFlight.flightNumber} ·{" "}
              {selectedFlight.departureTime}-{selectedFlight.arrivalTime} · $
              {selectedFlight.estimatedPrice}
            </p>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSearch} className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_0.7fr_auto]">
        <label className="font-bold text-slate-800">
          שדה יציאה
          <input
            className={inputClass}
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            placeholder="TLV"
          />
        </label>
        <label className="font-bold text-slate-800">
          שדה יעד
          <input
            className={inputClass}
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="ATH"
          />
        </label>
        <label className="font-bold text-slate-800">
          תאריך יציאה
          <input
            className={inputClass}
            value={departureDate}
            onChange={(event) => setDepartureDate(event.target.value)}
            type="date"
          />
        </label>
        <label className="font-bold text-slate-800">
          תאריך חזרה
          <input
            className={inputClass}
            value={returnDate}
            onChange={(event) => setReturnDate(event.target.value)}
            type="date"
          />
        </label>
        <label className="font-bold text-slate-800">
          נוסעים
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
          className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-sky-700 disabled:bg-slate-400"
        >
          <Plane className="h-5 w-5" />
          {isLoading ? "מחפש..." : "חפש טיסות"}
        </button>
      </form>

      {isLoading ? (
        <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center font-bold text-sky-900">
          מחפש טיסות...
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-center font-bold text-red-800">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && statusMessage ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center font-bold text-amber-900">
          {statusMessage}
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-3 flex items-center gap-2 font-black text-slate-950">
          <SlidersHorizontal className="h-5 w-5 text-sky-700" />
          סינון ומיון
        </p>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <label className="text-sm font-bold text-slate-700">
            מיון
            <select
              className={selectClass}
              value={filters.sortBy}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  sortBy: event.target.value as FlightFilters["sortBy"],
                }))
              }
            >
              <option value="cheapest">הכי זול</option>
              <option value="fastest">הכי מהיר</option>
              <option value="departure">לפי שעת המראה</option>
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">
            חברת תעופה
            <select
              className={selectClass}
              value={filters.airline}
              onChange={(event) =>
                setFilters((current) => ({ ...current, airline: event.target.value }))
              }
            >
              <option value="all">כל החברות</option>
              {airlines.map((airline) => (
                <option key={airline} value={airline}>
                  {airline}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">
            עצירות
            <select
              className={selectClass}
              value={filters.maxStops}
              onChange={(event) =>
                setFilters((current) => ({ ...current, maxStops: event.target.value }))
              }
            >
              <option value="any">ללא הגבלה</option>
              <option value="0">ישירה בלבד</option>
              <option value="1">עד עצירה אחת</option>
              <option value="2">עד שתי עצירות</option>
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">
            שעות טיסה
            <select
              className={selectClass}
              value={filters.timeOfDay}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  timeOfDay: event.target.value as FlightFilters["timeOfDay"],
                }))
              }
            >
              <option value="all">כל היום</option>
              <option value="morning">בוקר</option>
              <option value="afternoon">צהריים</option>
              <option value="evening">ערב</option>
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 lg:col-span-2">
            <input
              type="checkbox"
              checked={filters.directOnly}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  directOnly: event.target.checked,
                  maxStops: event.target.checked ? "0" : current.maxStops,
                }))
              }
              className="h-5 w-5 rounded border-slate-300 text-sky-700"
            />
            טיסה ישירה בלבד
          </label>
        </div>
      </div>

      {!isLoading && hasSearched && visibleFlights.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center font-bold text-slate-600">
          {statusMessage || errorMessage || "לא נמצאו טיסות"}
        </div>
      ) : !isLoading && visibleFlights.length > 0 ? (
        <div className="mt-5 grid gap-4">
          {visibleFlights.map((flight, index) => (
            <motion.article
              key={flight.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
                selectedFlight?.id === flight.id
                  ? "border-emerald-300 ring-2 ring-emerald-100"
                  : "border-slate-200 hover:border-sky-200"
              }`}
            >
              <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow">
                    {flight.logoText}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-950">
                      {flight.airline}
                    </h4>
                    <p className="text-sm font-bold text-slate-500">
                      {flight.flightNumber}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div>
                    <p className="text-2xl font-black text-slate-950">
                      {flight.departureTime}
                    </p>
                    <p className="text-sm font-bold text-slate-500">
                      {flight.originAirport}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-700">
                      <Clock3 className="h-4 w-4" />
                      {formatFlightDuration(flight.durationMinutes)}
                    </p>
                    <div className="my-2 flex items-center gap-2 text-slate-300">
                      <span className="h-px flex-1 bg-slate-200" />
                      <Plane className="h-4 w-4 rotate-180 text-sky-600" />
                      <span className="h-px flex-1 bg-slate-200" />
                    </div>
                    <p className="text-xs font-black text-slate-500">
                      {flight.isDirect ? "ישירה" : `${flight.stops} עצירות`}
                    </p>
                  </div>
                  <div className="sm:text-left">
                    <p className="text-2xl font-black text-slate-950">
                      {flight.arrivalTime}
                    </p>
                    <p className="text-sm font-bold text-slate-500">
                      {flight.destinationAirport}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-sm font-bold text-slate-500">מחיר משוער</p>
                  <p className="text-3xl font-black text-slate-950">
                    ${flight.estimatedPrice}
                  </p>
                  <div className="mt-3 grid gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectFlight(flight)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
                    >
                      <BadgeCheck className="h-4 w-4" />
                      בחר טיסה
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedFlightId((current) =>
                          current === flight.id ? null : flight.id,
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-white"
                    >
                      <Info className="h-4 w-4" />
                      פרטים נוספים
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600 md:grid-cols-3">
                <p className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <Luggage className="h-4 w-4 text-sky-700" />
                  {flight.baggageIncluded}
                </p>
                <p className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  דירוג חברת תעופה {flight.airlineRating}
                </p>
                <p className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <ArrowLeftRight className="h-4 w-4 text-emerald-600" />
                  חזור: {flight.returnDepartureTime}-{flight.returnArrivalTime}
                </p>
              </div>

              {expandedFlightId === flight.id ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                  <p>
                    <strong>שדה יציאה:</strong> {flight.originAirport} ·{" "}
                    <strong>שדה יעד:</strong> {flight.destinationAirport}
                  </p>
                  <p>
                    <strong>עצירות:</strong>{" "}
                    {flight.isDirect ? "ללא עצירות" : `${flight.stops} עצירות`}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {flight.notes.map((note) => (
                      <li key={note}>• {note}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </motion.article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
