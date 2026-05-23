"use client";

import { useState } from "react";
import {
  Accessibility,
  ArrowLeft,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Hotel,
  Loader2,
  MapPin,
  Plane,
  Search,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import {
  FlightResult,
  FlightSearchInput,
  HotelResult,
  HotelSearchInput,
  generateMockFlightResults,
  generateMockHotelResults,
} from "@/lib/mock-travel-results";

const fieldClass =
  "mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100";

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Plane;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-16 items-center justify-center gap-3 rounded-lg border px-5 py-4 text-base font-bold transition duration-300 ${
        active
          ? "border-slate-950 bg-slate-950 text-white shadow-lg"
          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function FlightResultCard({ result }: { result: FlightResult }) {
  return (
    <article className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="rounded-md bg-emerald-100 p-3 text-emerald-800 transition group-hover:bg-slate-950 group-hover:text-white">
            <Plane className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-slate-950">{result.airline}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {result.from} → {result.to}
            </p>
          </div>
        </div>
        <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-900">
          {result.price}
        </span>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <p>יציאה: {result.departDate}</p>
        <p>חזרה: {result.returnDate}</p>
        <p>משך טיסה: {result.duration}</p>
      </div>
      <button
        type="button"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
      >
        בחר טיסה
        <ArrowLeft className="h-4 w-4" />
      </button>
    </article>
  );
}

function HotelResultCard({ result }: { result: HotelResult }) {
  const accessibilityItems = [
    { label: "מעלית", available: result.hasElevator },
    { label: "גישה לכיסא גלגלים", available: result.hasWheelchairAccess },
    { label: "מקלחת נגישה", available: result.hasAccessibleShower },
  ];

  return (
    <article className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="rounded-md bg-emerald-100 p-3 text-emerald-800 transition group-hover:bg-slate-950 group-hover:text-white">
            <Hotel className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-slate-950">{result.name}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {result.destination}
            </p>
          </div>
        </div>
        <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-900">
          {result.totalPrice}
        </span>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <p>שהייה: {result.stayDates}</p>
        <p className="flex items-center gap-1">
          דירוג:
          {Array.from({ length: result.stars }).map((_, index) => (
            <Star key={index} className="h-4 w-4 fill-amber-500 text-amber-500" />
          ))}
        </p>
        <p>מחיר ללילה: {result.pricePerNight}</p>
      </div>
      <div className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm text-slate-700">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 font-bold text-emerald-900">
            <Accessibility className="h-4 w-4" />
            חדרים נגישים
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-900">
            {result.accessibleRoomsAvailable > 0
              ? `${result.accessibleRoomsAvailable} זמינים`
              : "אין זמינות"}
          </span>
        </div>
        <div className="mt-3 grid gap-2">
          {accessibilityItems.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 text-slate-700"
            >
              {item.available ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              ) : (
                <XCircle className="h-4 w-4 text-slate-400" />
              )}
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
      >
        {result.accessibleRoomsAvailable > 0 ? "הזמן חדר נגיש" : "בחר מלון"}
        <ArrowLeft className="h-4 w-4" />
      </button>
    </article>
  );
}

function FlightsForm({
  values,
  isLoading,
  onChange,
  onSearch,
}: {
  values: FlightSearchInput;
  isLoading: boolean;
  onChange: (values: FlightSearchInput) => void;
  onSearch: () => void;
}) {
  return (
    <form
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <label className="font-semibold text-slate-800">
        מאיפה
        <input
          className={fieldClass}
          disabled={isLoading}
          onChange={(event) => onChange({ ...values, from: event.target.value })}
          placeholder="תל אביב"
          type="text"
          value={values.from}
        />
      </label>
      <label className="font-semibold text-slate-800">
        לאן
        <input
          className={fieldClass}
          disabled={isLoading}
          onChange={(event) => onChange({ ...values, to: event.target.value })}
          placeholder="רומא"
          type="text"
          value={values.to}
        />
      </label>
      <label className="font-semibold text-slate-800">
        תאריך יציאה
        <input
          className={fieldClass}
          disabled={isLoading}
          onChange={(event) => onChange({ ...values, departDate: event.target.value })}
          type="date"
          value={values.departDate}
        />
      </label>
      <label className="font-semibold text-slate-800">
        תאריך חזרה
        <input
          className={fieldClass}
          disabled={isLoading}
          onChange={(event) => onChange({ ...values, returnDate: event.target.value })}
          type="date"
          value={values.returnDate}
        />
      </label>
      <label className="font-semibold text-slate-800">
        מספר נוסעים
        <input
          className={fieldClass}
          disabled={isLoading}
          min="1"
          onChange={(event) =>
            onChange({ ...values, passengers: Number(event.target.value) })
          }
          type="number"
          value={values.passengers}
        />
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          {isLoading ? "מחפש..." : "חפש טיסות"}
        </button>
      </div>
    </form>
  );
}

function HotelsForm({
  values,
  isLoading,
  onChange,
  onSearch,
}: {
  values: HotelSearchInput;
  isLoading: boolean;
  onChange: (values: HotelSearchInput) => void;
  onSearch: () => void;
}) {
  return (
    <form
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <label className="font-semibold text-slate-800">
        יעד
        <input
          className={fieldClass}
          disabled={isLoading}
          onChange={(event) =>
            onChange({ ...values, destination: event.target.value })
          }
          placeholder="ברצלונה"
          type="text"
          value={values.destination}
        />
      </label>
      <label className="font-semibold text-slate-800">
        תאריך צ׳ק אין
        <input
          className={fieldClass}
          disabled={isLoading}
          onChange={(event) => onChange({ ...values, checkIn: event.target.value })}
          type="date"
          value={values.checkIn}
        />
      </label>
      <label className="font-semibold text-slate-800">
        תאריך צ׳ק אאוט
        <input
          className={fieldClass}
          disabled={isLoading}
          onChange={(event) => onChange({ ...values, checkOut: event.target.value })}
          type="date"
          value={values.checkOut}
        />
      </label>
      <label className="font-semibold text-slate-800">
        מספר אורחים
        <input
          className={fieldClass}
          disabled={isLoading}
          min="1"
          onChange={(event) => onChange({ ...values, guests: Number(event.target.value) })}
          type="number"
          value={values.guests}
        />
      </label>
      <label className="font-semibold text-slate-800">
        מספר חדרים
        <input
          className={fieldClass}
          disabled={isLoading}
          min="1"
          onChange={(event) => onChange({ ...values, rooms: Number(event.target.value) })}
          type="number"
          value={values.rooms}
        />
      </label>
      <label className="flex min-h-12 items-center gap-3 self-end rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 font-semibold text-slate-800">
        <input
          checked={values.needsAccessibleRoom}
          className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          disabled={isLoading}
          onChange={(event) =>
            onChange({ ...values, needsAccessibleRoom: event.target.checked })
          }
          type="checkbox"
        />
        אני צריך חדר נגיש
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          {isLoading ? "מחפש..." : "חפש מלונות"}
        </button>
      </div>
    </form>
  );
}

export function HotelsFlightsSection() {
  const [activeTab, setActiveTab] = useState<"flights" | "hotels">("flights");
  const [flightSearch, setFlightSearch] = useState<FlightSearchInput>({
    from: "",
    to: "",
    departDate: "",
    returnDate: "",
    passengers: 2,
  });
  const [hotelSearch, setHotelSearch] = useState<HotelSearchInput>({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
    rooms: 1,
    needsAccessibleRoom: false,
  });
  const [flightResults, setFlightResults] = useState<FlightResult[]>([]);
  const [hotelResults, setHotelResults] = useState<HotelResult[]>([]);
  const [error, setError] = useState("");
  const [emptyMessage, setEmptyMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasFlightResults = flightResults.length > 0;
  const hasHotelResults = hotelResults.length > 0;

  function validateFlights() {
    if (
      !flightSearch.from.trim() ||
      !flightSearch.to.trim() ||
      !flightSearch.departDate ||
      !flightSearch.returnDate ||
      flightSearch.passengers < 1
    ) {
      return "יש למלא מוצא, יעד, תאריכי יציאה וחזרה ומספר נוסעים.";
    }

    return "";
  }

  function validateHotels() {
    if (
      !hotelSearch.destination.trim() ||
      !hotelSearch.checkIn ||
      !hotelSearch.checkOut ||
      hotelSearch.guests < 1 ||
      hotelSearch.rooms < 1
    ) {
      return "יש למלא יעד, תאריכי שהייה, מספר אורחים ומספר חדרים.";
    }

    return "";
  }

  function handleFlightSearch() {
    const validationError = validateFlights();
    setError(validationError);
    setEmptyMessage("");

    if (validationError) {
      setFlightResults([]);
      return;
    }

    setIsLoading(true);

    window.setTimeout(() => {
      const results = generateMockFlightResults(flightSearch);
      setFlightResults(results);
      setEmptyMessage(results.length ? "" : "לא נמצאו טיסות מתאימות לחיפוש הזה.");
      setIsLoading(false);
    }, 450);
  }

  function handleHotelSearch() {
    const validationError = validateHotels();
    setError(validationError);
    setEmptyMessage("");

    if (validationError) {
      setHotelResults([]);
      return;
    }

    setIsLoading(true);

    window.setTimeout(() => {
      const results = generateMockHotelResults(hotelSearch);
      setHotelResults(results);
      setEmptyMessage(results.length ? "" : "לא נמצאו מלונות מתאימים לחיפוש הזה.");
      setIsLoading(false);
    }, 450);
  }

  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-700">השלימו את הטיול</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
              מלונות וטיסות
            </h2>
            <p className="mt-3 max-w-2xl leading-8 text-slate-600">
              חיפוש דינמי עם תוצאות mock לפי היעד והתאריכים, מוכן להחלפה עתידית
              ל־API אמיתי.
            </p>
          </div>
          <div className="flex gap-2 text-sm font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-2">
              <CalendarDays className="h-4 w-4 text-emerald-700" />
              תאריכים גמישים
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-2">
              <MapPin className="h-4 w-4 text-emerald-700" />
              יעד מותאם
            </span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <TabButton
            active={activeTab === "flights"}
            icon={Plane}
            label="חיפוש טיסות"
            onClick={() => {
              setActiveTab("flights");
              setError("");
              setEmptyMessage("");
            }}
          />
          <TabButton
            active={activeTab === "hotels"}
            icon={BedDouble}
            label="חיפוש מלונות"
            onClick={() => {
              setActiveTab("hotels");
              setError("");
              setEmptyMessage("");
            }}
          />
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 md:p-6">
          {activeTab === "flights" ? (
            <FlightsForm
              values={flightSearch}
              isLoading={isLoading}
              onChange={setFlightSearch}
              onSearch={handleFlightSearch}
            />
          ) : (
            <HotelsForm
              values={hotelSearch}
              isLoading={isLoading}
              onChange={setHotelSearch}
              onSearch={handleHotelSearch}
            />
          )}
        </div>

        {error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
            {error}
          </div>
        ) : null}

        {emptyMessage ? (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
            {emptyMessage}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {activeTab === "flights" &&
            flightResults.map((result) => (
              <FlightResultCard key={result.id} result={result} />
            ))}

          {activeTab === "hotels" &&
            hotelResults.map((result) => (
              <HotelResultCard key={result.id} result={result} />
            ))}
        </div>

        {!error &&
        !emptyMessage &&
        !isLoading &&
        ((activeTab === "flights" && !hasFlightResults) ||
          (activeTab === "hotels" && !hasHotelResults)) ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">
            מלאו את השדות ולחצו על חיפוש כדי לראות תוצאות.
          </div>
        ) : null}

        <p className="mt-5 flex items-center gap-2 text-sm text-slate-500">
          <Users className="h-4 w-4" />
          כרגע התוצאות נוצרות דינמית כ־mock, עם נקודת החלפה ברורה ל־API אמיתי.
        </p>
      </div>
    </section>
  );
}
