"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Accessibility, Bell, Clock, Heart, Hotel, Plane, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { saveFavoriteTrip } from "@/lib/favorite-trips";
import type { FlightDeal, HotelDeal, TripDeal } from "@/types/travel-marketplace";

export function FlightCard({ flight }: { flight: FlightDeal }) {
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
        toast.info("Sign in and configure Postgres to persist favorite flights.");
        return;
      }

      toast.success("Flight saved to favorites.");
    } catch {
      toast.error("Could not save this flight.");
    }
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-sky-600 dark:text-sky-300">טיסה</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
            {flight.airline}
          </h3>
        </div>
        <div className="grid gap-2 text-left">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900 dark:bg-white/10 dark:text-white">
            ${Math.round(flight.price)}
          </span>
          <button
            type="button"
            onClick={handleFavoriteFlight}
            className="text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            שמירה
          </button>
        </div>
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
          <p className="mt-1 text-xs">{flight.nonstop ? "ישירה" : "עצירה אחת"}</p>
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
    </article>
  );
}

export function HotelCard({ hotel }: { hotel: HotelDeal }) {
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
        toast.info("Sign in and configure Postgres to persist favorite hotels.");
        return;
      }

      toast.success("Hotel saved to favorites.");
    } catch {
      toast.error("Could not save this hotel.");
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="relative h-44">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
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
          ${hotel.pricePerNight}
          <span className="text-sm font-medium text-slate-500"> / לילה</span>
        </p>
        <button
          type="button"
          onClick={handleFavoriteHotel}
          className="mt-4 inline-flex rounded-full border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
        >
          שמירת מלון
        </button>
      </div>
    </article>
  );
}

export function TripDealCard({ trip, bestValue = false }: { trip: TripDeal; bestValue?: boolean }) {
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
          totalPrice: trip.estimatedTotal,
          payload: trip,
        }),
      });

      if (response.ok) {
        toast.success("Trip saved to your account.");
        return;
      }

      toast.success(`Trip saved locally. ${localFavorites.length} saved trips.`);
    } catch {
      toast.success(`Trip saved locally. ${localFavorites.length} saved trips.`);
    }
  }

  async function handleTrackPrice() {
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
        toast.info("Sign in and configure Postgres to track prices persistently.");
        return;
      }

      toast.success("Price tracking enabled.");
    } catch {
      toast.error("Could not enable price tracking right now.");
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900"
    >
      <div className="relative h-56">
        <Image
          src={trip.image}
          alt={trip.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
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
            aria-label="Save favorite trip"
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
            <Plane className="h-4 w-4 text-sky-500" />
            {trip.flight.airline} · ${Math.round(trip.flight.price)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
            <Hotel className="h-4 w-4 text-sky-500" />
            {trip.hotel.name} · ${trip.hotel.pricePerNight}/לילה
          </span>
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
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-2xl font-black text-slate-950 dark:text-white">
            ${trip.estimatedTotal}
          </p>
          <div className="flex gap-2">
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
