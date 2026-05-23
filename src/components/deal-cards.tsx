"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Accessibility, Bell, Clock, Heart, Hotel, Plane, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { saveFavoriteTrip } from "@/lib/favorite-trips";
import type { FlightDeal, HotelDeal, TripDeal } from "@/types/travel-marketplace";

export function formatOfferPrice(value: number | null, currency: string) {
  if (value === null) return "לא זמין כרגע";
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLastChecked(value: string) {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function availabilityText(status: FlightDeal["availabilityStatus"]) {
  if (status === "available") return "זמין";
  if (status === "unavailable") return "לא זמין כרגע";
  return "דורש אימות";
}

const cardClass =
  "rounded-3xl border bg-white shadow-sm transition dark:bg-slate-900";

export function FlightCard({
  flight,
  isSelected = false,
  onSelect,
}: {
  flight: FlightDeal;
  isSelected?: boolean;
  onSelect?: (flight: FlightDeal) => void;
}) {
  async function handleFavoriteFlight() {
    try {
      const response = await fetch("/api/favorites/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightId: flight.id,
          airline: flight.airline,
          origin: flight.from,
          destination: flight.destination,
          payload: flight,
        }),
      });

      if (!response.ok) {
        toast.info("כדי לשמור בענן יש להתחבר ולהגדיר PostgreSQL.");
        return;
      }

      toast.success("הטיסה נשמרה במועדפים.");
    } catch {
      toast.error("לא ניתן לשמור את הטיסה כרגע.");
    }
  }

  function handleSelectFlight() {
    onSelect?.(flight);
    toast.success(
      flight.bookingLink
        ? "הטיסה נבחרה. אפשר להמשיך להזמנה."
        : "הטיסה נבחרה כהצעה ללא קישור הזמנה.",
    );
  }

  return (
    <article
      data-selected-flight={isSelected ? "true" : "false"}
      className={`${cardClass} p-5 ${
        isSelected
          ? "border-sky-500 ring-4 ring-sky-500/15 dark:border-sky-300"
          : "border-slate-200 dark:border-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-sky-600 dark:text-sky-300">טיסה</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
            {flight.airline}
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900 dark:bg-white/10 dark:text-white">
          {formatOfferPrice(flight.price, flight.currency)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <p className="text-2xl font-bold text-slate-950 dark:text-white">
            {flight.departureTime}
          </p>
          <p className="text-sm text-slate-500">{flight.from}</p>
        </div>
        <div className="text-center text-slate-400">
          <Plane className="mx-auto h-5 w-5" />
          <p className="mt-1 text-xs">{flight.nonstop ? "ישירה" : "עם עצירות"}</p>
        </div>
        <div className="text-left">
          <p className="text-2xl font-bold text-slate-950 dark:text-white">
            {flight.arrivalTime}
          </p>
          <p className="text-sm text-slate-500">{flight.destination}</p>
        </div>
      </div>

      <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500">
        <Clock className="h-4 w-4" />
        {flight.duration}
      </p>

      <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-white/10 dark:text-slate-300">
        <p>{flight.priceLabel}</p>
        <p>מקור: {flight.provider}</p>
        <p>זמינות: {availabilityText(flight.availabilityStatus)}</p>
        <p>נבדק לאחרונה: {formatLastChecked(flight.lastChecked)}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSelectFlight}
          data-testid={`select-flight-${flight.id}`}
          className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
            isSelected
              ? "bg-sky-600 text-white"
              : "bg-slate-950 text-white hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
          }`}
        >
          {isSelected ? "טיסה נבחרה" : "בחר טיסה"}
        </button>
        {flight.bookingLink ? (
          <a
            href={flight.bookingLink}
            rel="noreferrer"
            target="_blank"
            className="rounded-2xl border border-sky-200 px-4 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-50 dark:border-sky-400/30 dark:text-sky-200 dark:hover:bg-sky-400/10"
          >
            המשך להזמנה
          </a>
        ) : (
          <span className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 dark:bg-amber-400/10 dark:text-amber-100">
            הצעה ללא קישור הזמנה
          </span>
        )}
        <button
          type="button"
          onClick={handleFavoriteFlight}
          className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
        >
          שמירה
        </button>
      </div>
    </article>
  );
}

export function HotelCard({
  hotel,
  isSelected = false,
  onSelect,
}: {
  hotel: HotelDeal;
  isSelected?: boolean;
  onSelect?: (hotel: HotelDeal) => void;
}) {
  async function handleFavoriteHotel() {
    try {
      const response = await fetch("/api/favorites/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: hotel.id,
          name: hotel.name,
          destination: hotel.location,
          payload: hotel,
        }),
      });

      if (!response.ok) {
        toast.info("כדי לשמור בענן יש להתחבר ולהגדיר PostgreSQL.");
        return;
      }

      toast.success("המלון נשמר במועדפים.");
    } catch {
      toast.error("לא ניתן לשמור את המלון כרגע.");
    }
  }

  function handleSelectHotel() {
    onSelect?.(hotel);
    toast.success(
      hotel.bookingLink
        ? "המלון נבחר. אפשר להמשיך להזמנה."
        : "המלון נבחר כהצעה ללא קישור הזמנה.",
    );
  }

  return (
    <article
      data-selected-hotel={isSelected ? "true" : "false"}
      className={`${cardClass} overflow-hidden ${
        isSelected
          ? "border-sky-500 ring-4 ring-sky-500/15 dark:border-sky-300"
          : "border-slate-200 dark:border-white/10"
      }`}
    >
      {hotel.image ? (
        <div className="relative h-44">
          <Image
            src={hotel.image}
            alt={hotel.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-44 items-center justify-center bg-slate-100 text-sm font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
          תמונה לא זמינה כרגע
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-950 dark:text-white">{hotel.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{hotel.location}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
            <Star className="h-4 w-4 fill-amber-500" />
            {hotel.rating}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {hotel.amenities.map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-200"
            >
              {amenity}
            </span>
          ))}
        </div>

        <p className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
          {formatOfferPrice(hotel.pricePerNight, hotel.currency)}
          <span className="text-sm font-medium text-slate-500"> / לילה</span>
        </p>

        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-white/10 dark:text-slate-300">
          <p>{hotel.priceLabel}</p>
          <p>מקור: {hotel.provider}</p>
          <p>זמינות: {availabilityText(hotel.availabilityStatus)}</p>
          <p>נבדק לאחרונה: {formatLastChecked(hotel.lastChecked)}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSelectHotel}
            data-testid={`select-hotel-${hotel.id}`}
            className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
              isSelected
                ? "bg-sky-600 text-white"
                : "bg-slate-950 text-white hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
            }`}
          >
            {isSelected ? "מלון נבחר" : "בחר מלון"}
          </button>
          {hotel.bookingLink ? (
            <a
              href={hotel.bookingLink}
              rel="noreferrer"
              target="_blank"
              className="rounded-2xl border border-sky-200 px-4 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-50 dark:border-sky-400/30 dark:text-sky-200 dark:hover:bg-sky-400/10"
            >
              המשך להזמנה
            </a>
          ) : (
            <span className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 dark:bg-amber-400/10 dark:text-amber-100">
              הצעה ללא קישור הזמנה
            </span>
          )}
          <button
            type="button"
            onClick={handleFavoriteHotel}
            className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
          >
            שמירה
          </button>
        </div>
      </div>
    </article>
  );
}

export function TripDealCard({
  trip,
  bestValue = false,
}: {
  trip: TripDeal;
  bestValue?: boolean;
}) {
  async function handleSaveTrip() {
    const localFavorites = saveFavoriteTrip(trip);

    try {
      const response = await fetch("/api/saved-trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalId: trip.id,
          title: trip.title,
          destination: trip.destination,
          totalPrice: trip.estimatedTotal ?? 0,
          payload: trip,
        }),
      });

      if (response.ok) {
        toast.success("הטיול נשמר בחשבון שלך.");
        return;
      }

      toast.success(`הטיול נשמר מקומית. ${localFavorites.length} מסלולים שמורים.`);
    } catch {
      toast.success(`הטיול נשמר מקומית. ${localFavorites.length} מסלולים שמורים.`);
    }
  }

  async function handleTrackPrice() {
    if (trip.flight.price === null) {
      toast.info("אין מחיר טיסה מאומת למעקב כרגע.");
      return;
    }

    try {
      const response = await fetch("/api/price-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightId: trip.flight.id,
          airline: trip.flight.airline,
          origin: trip.flight.from,
          destination: trip.flight.destination,
          targetPrice: Math.max(50, Math.round(trip.flight.price * 0.9)),
          lastSeenPrice: Math.round(trip.flight.price),
          payload: trip.flight,
        }),
      });

      if (!response.ok) {
        toast.info("כדי לעקוב בענן יש להתחבר ולהגדיר PostgreSQL.");
        return;
      }

      toast.success("מעקב מחיר הופעל.");
    } catch {
      toast.error("לא ניתן להפעיל מעקב מחיר כרגע.");
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${cardClass} overflow-hidden hover:shadow-xl dark:border-white/10`}
    >
      <div className="relative h-56">
        {trip.image ? (
          <Image
            src={trip.image}
            alt={trip.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-sm font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
            תמונה לא זמינה כרגע
          </div>
        )}
        {bestValue ? (
          <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-sky-500 px-3 py-2 text-sm font-bold text-white shadow-lg">
            <Sparkles className="h-4 w-4" />
            משתלם במיוחד
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">
              {trip.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{trip.aiSummary}</p>
          </div>
          <button
            type="button"
            onClick={handleSaveTrip}
            className="rounded-full border border-slate-200 p-3 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-white/10 dark:text-white"
            aria-label="שמירת טיול"
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
            <Plane className="h-4 w-4 text-sky-500" />
            {trip.flight.airline} · {formatOfferPrice(trip.flight.price, trip.flight.currency)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
            <Hotel className="h-4 w-4 text-sky-500" />
            {trip.hotel.name} · {formatOfferPrice(trip.hotel.pricePerNight, trip.hotel.currency)}/לילה
          </span>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">
          <p className="font-bold text-slate-950 dark:text-white">פירוט תקציב</p>
          <div className="mt-2 grid gap-1">
            <p>טיסה: {formatOfferPrice(trip.budgetBreakdown.flight, trip.currency)} · {trip.budgetBreakdown.labels.flight}</p>
            <p>מלון: {formatOfferPrice(trip.budgetBreakdown.hotel, trip.currency)} · {trip.budgetBreakdown.labels.hotel}</p>
            <p>אוכל: {formatOfferPrice(trip.budgetBreakdown.food, trip.currency)} · הערכה בלבד</p>
            <p>אטרקציות: {formatOfferPrice(trip.budgetBreakdown.activities, trip.currency)} · הערכה בלבד</p>
            <p>עמלות ומרווח ביטחון: {formatOfferPrice(trip.budgetBreakdown.fees + trip.budgetBreakdown.safetyMargin, trip.currency)} · הערכה בלבד</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {trip.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-100"
            >
              <Accessibility className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-2xl font-black text-slate-950 dark:text-white">
            {trip.estimatedTotal === null
              ? "לא זמין כרגע"
              : formatOfferPrice(trip.estimatedTotal, trip.currency)}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleTrackPrice}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <Bell className="h-4 w-4" />
              מעקב מחיר
            </button>
            <Link
              href={`/trip/${trip.id}`}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
            >
              צפייה בטיול
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
