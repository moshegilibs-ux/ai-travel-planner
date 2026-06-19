"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Accessibility,
  Bell,
  Building2,
  Car,
  Clock,
  Heart,
  Hotel,
  Plane,
  Sparkles,
  Star,
  Users,
  Utensils,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { saveFavoriteTrip } from "@/lib/favorite-trips";
import {
  addFlightToMyTrip,
  addHotelToMyTrip,
  addRentalToMyTrip,
} from "@/lib/my-trip";
import type {
  FlightDeal,
  HotelDeal,
  ShortTermRental,
  TripDeal,
} from "@/types/travel-marketplace";

const cardClass =
  "rounded-3xl border bg-white shadow-sm transition dark:bg-slate-900";

export function formatOfferPrice(value: number | null, currency: string, locale = "he") {
  // Never render a non-finite value (null / NaN / Infinity) as a price.
  if (value === null || !Number.isFinite(value)) return "";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    // Guard against an invalid/empty currency code throwing in Intl.
    return `${Math.round(value)} ${currency || ""}`.trim();
  }
}

function formatLastChecked(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function useCardText() {
  const t = useTranslations("cards");
  const locale = useLocale();

  return {
    t,
    locale,
    price: (value: number | null, currency: string) =>
      value === null || !Number.isFinite(value)
        ? t("notAvailable")
        : formatOfferPrice(value, currency, locale),
    availability: (status: FlightDeal["availabilityStatus"]) => {
      if (status === "available") return t("available");
      if (status === "unavailable") return t("unavailable");
      return t("verify");
    },
  };
}

export function FlightCard({
  flight,
  isSelected = false,
  onSelect,
}: {
  flight: FlightDeal;
  isSelected?: boolean;
  onSelect?: (flight: FlightDeal) => void;
}) {
  const { t, locale, price, availability } = useCardText();
  const toastT = useTranslations("toasts");

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
        toast.info(toastT("cloudLogin"));
        return;
      }

      toast.success(toastT("flightSaved"));
    } catch {
      toast.error(toastT("flightSaveError"));
    }
  }

  function handleSelectFlight() {
    onSelect?.(flight);
    addFlightToMyTrip(flight);
    toast.success(
      flight.bookingLink
        ? toastT("flightSelectedBooking")
        : toastT("flightSelectedNoBooking"),
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
          <p className="text-sm font-bold text-sky-600 dark:text-sky-300">{t("flight")}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
            {flight.airline}
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900 dark:bg-white/10 dark:text-white">
          {price(flight.price, flight.currency)}
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
          <p className="mt-1 text-xs">{flight.nonstop ? t("direct") : t("stops")}</p>
        </div>
        <div className="text-end">
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
        <p>{t("source")}: {flight.provider}</p>
        <p>{t("availability")}: {availability(flight.availabilityStatus)}</p>
        <p>{t("lastChecked")}: {formatLastChecked(flight.lastChecked, locale)}</p>
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
          {isSelected ? t("flightSelected") : t("selectFlight")}
        </button>
        {flight.bookingLink ? (
          <a
            href={flight.bookingLink}
            rel="noreferrer"
            target="_blank"
            className="rounded-2xl border border-sky-200 px-4 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-50 dark:border-sky-400/30 dark:text-sky-200 dark:hover:bg-sky-400/10"
          >
            {t("continueBooking")}
          </a>
        ) : (
          <span className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 dark:bg-amber-400/10 dark:text-amber-100">
            {t("noBookingLink")}
          </span>
        )}
        <button
          type="button"
          onClick={handleFavoriteFlight}
          className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
        >
          {t("save")}
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
  const { t, locale, price, availability } = useCardText();
  const toastT = useTranslations("toasts");

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
        toast.info(toastT("cloudLogin"));
        return;
      }

      toast.success(toastT("hotelSaved"));
    } catch {
      toast.error(toastT("hotelSaveError"));
    }
  }

  function handleSelectHotel() {
    onSelect?.(hotel);
    addHotelToMyTrip(hotel);
    toast.success(
      hotel.bookingLink
        ? toastT("hotelSelectedBooking")
        : toastT("hotelSelectedNoBooking"),
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
          {t("imageUnavailable")}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-950 dark:text-white">{hotel.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{hotel.location}</p>
            <p className="mt-1 text-sm font-bold text-sky-700 dark:text-sky-300">
              {hotel.distanceFromCenter ?? "1.2 km from center"}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
            <Star className="h-4 w-4 fill-amber-500" />
            {hotel.rating}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[...hotel.amenities, ...(hotel.suitability ?? [])].map((amenity, index) => (
            <span
              key={`${amenity}-${index}`}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-200"
            >
              {amenity}
            </span>
          ))}
        </div>

        <p className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
          {price(hotel.pricePerNight, hotel.currency)}
          <span className="text-sm font-medium text-slate-500"> / {t("perNight")}</span>
        </p>

        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-white/10 dark:text-slate-300">
          <p>{hotel.priceLabel}</p>
          <p>{t("source")}: {hotel.provider}</p>
          <p>{t("availability")}: {availability(hotel.availabilityStatus)}</p>
          <p>{t("lastChecked")}: {formatLastChecked(hotel.lastChecked, locale)}</p>
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
            {isSelected ? t("hotelAdded") : t("addToTrip")}
          </button>
          {hotel.bookingLink ? (
            <a
              href={hotel.bookingLink}
              rel="noreferrer"
              target="_blank"
              className="rounded-2xl border border-sky-200 px-4 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-50 dark:border-sky-400/30 dark:text-sky-200 dark:hover:bg-sky-400/10"
            >
              {t("continueBooking")}
            </a>
          ) : (
            <span className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 dark:bg-amber-400/10 dark:text-amber-100">
              {t("noBookingLink")}
            </span>
          )}
          <button
            type="button"
            onClick={handleFavoriteHotel}
            className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ShortTermRentalCard({
  rental,
  isSelected = false,
  onSelect,
}: {
  rental: ShortTermRental;
  isSelected?: boolean;
  onSelect?: (rental: ShortTermRental) => void;
}) {
  const { t, locale } = useCardText();
  const rentalsT = useTranslations("rentals");

  function handleSelectRental() {
    onSelect?.(rental);
    addRentalToMyTrip(rental);
    toast.success(rentalsT("addedToast", { name: rental.name }));
  }

  const features = [
    {
      label: rentalsT("roomsCount", { count: rental.rooms }),
      icon: Building2,
      enabled: true,
    },
    {
      label: rentalsT("guestsCount", { count: rental.guests }),
      icon: Users,
      enabled: true,
    },
    { label: rentalsT("kitchen"), icon: Utensils, enabled: rental.hasKitchen },
    { label: rentalsT("parking"), icon: Car, enabled: rental.hasParking },
    {
      label: rentalsT("accessible"),
      icon: Accessibility,
      enabled: rental.isAccessible,
    },
  ].filter((feature) => feature.enabled);

  return (
    <article
      data-selected-rental={isSelected ? "true" : "false"}
      className={`${cardClass} overflow-hidden ${
        isSelected
          ? "border-teal-500 ring-4 ring-teal-500/15 dark:border-teal-300"
          : "border-slate-200 dark:border-white/10"
      }`}
    >
      <div className="relative h-44">
        <Image
          src={rental.image}
          alt={rental.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <span className="absolute start-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-slate-900 shadow-sm">
          {rentalsT(rental.type)}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-950 dark:text-white">{rental.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{rental.location}</p>
            <p className="mt-1 text-sm font-bold text-teal-700 dark:text-teal-300">
              {rental.distanceFromCenter}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
            <Star className="h-4 w-4 fill-amber-500" />
            {rental.rating}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <span
                key={feature.label}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200"
              >
                <Icon className="h-4 w-4 text-teal-500" />
                {feature.label}
              </span>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {rental.hasElevator ? <Badge>{rentalsT("elevator")}</Badge> : null}
          {rental.kidsFriendly ? <Badge>{rentalsT("kidsFriendly")}</Badge> : null}
          {rental.amenities.slice(0, 3).map((amenity) => (
            <Badge key={amenity}>{amenity}</Badge>
          ))}
        </div>

        <p className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
          {formatOfferPrice(rental.pricePerNight, rental.currency, locale)}
          <span className="text-sm font-medium text-slate-500"> / {t("perNight")}</span>
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSelectRental}
            data-testid={`select-rental-${rental.id}`}
            className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
              isSelected
                ? "bg-teal-600 text-white"
                : "bg-slate-950 text-white hover:bg-teal-600 dark:bg-teal-500 dark:text-slate-950"
            }`}
          >
            {isSelected ? rentalsT("selected") : rentalsT("addToTrip")}
          </button>
          {rental.bookingLink ? (
            <a
              href={rental.bookingLink}
              rel="noreferrer"
              target="_blank"
              className="rounded-2xl border border-teal-200 px-4 py-3 text-sm font-bold text-teal-700 transition hover:bg-teal-50 dark:border-teal-400/30 dark:text-teal-200 dark:hover:bg-teal-400/10"
            >
              {rentalsT("continueBooking")}
            </a>
          ) : (
            <span className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 dark:bg-amber-400/10 dark:text-amber-100">
              {rentalsT("noBookingLink")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-teal-400/10 dark:text-teal-100">
      {children}
    </span>
  );
}

export function TripDealCard({
  trip,
  bestValue = false,
}: {
  trip: TripDeal;
  bestValue?: boolean;
}) {
  const { t, locale, price } = useCardText();
  const toastT = useTranslations("toasts");

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
        toast.success(toastT("tripSavedCloud"));
        return;
      }

      toast.success(toastT("tripSavedLocal", { count: localFavorites.length }));
    } catch {
      toast.success(toastT("tripSavedLocal", { count: localFavorites.length }));
    }
  }

  async function handleTrackPrice() {
    if (trip.flight.price === null) {
      toast.info(toastT("noFlightPrice"));
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
        toast.info(toastT("cloudLogin"));
        return;
      }

      toast.success(toastT("priceTrackingEnabled"));
    } catch {
      toast.error(toastT("priceTrackingError"));
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
            {t("imageUnavailable")}
          </div>
        )}
        {bestValue ? (
          <span className="absolute start-4 top-4 inline-flex items-center gap-2 rounded-full bg-sky-500 px-3 py-2 text-sm font-bold text-white shadow-lg">
            <Sparkles className="h-4 w-4" />
            {t("bestValue")}
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
            aria-label={t("save")}
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
            <Plane className="h-4 w-4 text-sky-500" />
            {trip.flight.airline} · {price(trip.flight.price, trip.flight.currency)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
            <Hotel className="h-4 w-4 text-sky-500" />
            {trip.hotel.name} · {price(trip.hotel.pricePerNight, trip.hotel.currency)}/{t("perNight")}
          </span>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">
          <p className="font-bold text-slate-950 dark:text-white">{t("budgetBreakdown")}</p>
          <div className="mt-2 grid gap-1">
            <p>{t("flight")}: {formatOfferPrice(trip.budgetBreakdown.flight, trip.currency, locale)} · {t("estimateOnly")}</p>
            <p>{t("hotel")}: {formatOfferPrice(trip.budgetBreakdown.hotel, trip.currency, locale)} · {t("estimateOnly")}</p>
            <p>{t("food")}: {formatOfferPrice(trip.budgetBreakdown.food, trip.currency, locale)} · {t("estimateOnly")}</p>
            <p>{t("activities")}: {formatOfferPrice(trip.budgetBreakdown.activities, trip.currency, locale)} · {t("estimateOnly")}</p>
            <p>{t("fees")}: {formatOfferPrice(trip.budgetBreakdown.fees + trip.budgetBreakdown.safetyMargin, trip.currency, locale)} · {t("estimateOnly")}</p>
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
            {price(trip.estimatedTotal, trip.currency)}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleTrackPrice}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <Bell className="h-4 w-4" />
              {t("trackPrice")}
            </button>
            <Link
              href={`/trip/${trip.id}`}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
            >
              {t("viewTrip")}
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
