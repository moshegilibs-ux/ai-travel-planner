"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Download, Hotel, MapPinned, Plane, Save, Sparkles, Trash2, Utensils } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { addLocaleToPath, AppLocale, isLocale } from "@/lib/i18n";
import {
  getEmptyTrip,
  MyTripState,
  readMyTrip,
  removeFromMyTrip,
  saveMyTripSnapshot,
} from "@/lib/my-trip";
import { getCurrentUser, subscribeAuthState } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import {
  createSavedUserTrip,
  getTripOwnerId,
  isGuestOwner,
  saveUserTrip,
} from "@/lib/user-trips";
import { formatOfferPrice } from "@/components/deal-cards";

type TripSectionKey = "flights" | "hotels" | "rentals" | "attractions" | "itinerary";

export function MyTripView() {
  const t = useTranslations("myTrip");
  const localeValue = useLocale();
  const locale: AppLocale = isLocale(localeValue) ? localeValue : "he";
  const [trip, setTrip] = useState<MyTripState>(getEmptyTrip());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());

  useEffect(() => {
    function syncTrip() {
      setTrip(readMyTrip());
    }

    syncTrip();
    window.addEventListener("storage", syncTrip);
    window.addEventListener("my-trip-updated", syncTrip);

    return () => {
      window.removeEventListener("storage", syncTrip);
      window.removeEventListener("my-trip-updated", syncTrip);
    };
  }, []);

  useEffect(() => subscribeAuthState(setCurrentUser), []);

  const total = useMemo(() => estimateTotal(trip), [trip]);
  const hasItems =
    trip.flights.length ||
    trip.hotels.length ||
    trip.rentals.length ||
    trip.attractions.length ||
    trip.itinerary.length;

  function handleRemove(section: TripSectionKey, id: string) {
    const nextTrip = removeFromMyTrip(section, id);
    setTrip(nextTrip);
    toast.success(t("removed"));
  }

  function handleSave() {
    saveMyTripSnapshot(trip);
    const ownerId = getTripOwnerId(currentUser);
    saveUserTrip(
      createSavedUserTrip({
        destination: getTripDestination(trip),
        ownerId,
        title: getTripTitle(trip, t("untitledTrip")),
        trip,
      }),
    );
    setTrip(readMyTrip());
    toast.success(isGuestOwner(ownerId) ? t("guestSaved") : t("saved"));
  }

  function handleDownloadPdf() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const lines = buildPdfLines(trip, t, locale);
    let y = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(t("title"), 14, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    lines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 18;
      }

      doc.text(String(line), 14, y);
      y += 7;
    });

    doc.save("my-trip.pdf");
    toast.success(t("pdfReady"));
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 pb-28 md:pb-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black text-teal-600 dark:text-teal-300">
              {t("eyebrow")}
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
              {t("description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
            >
              <Save className="h-4 w-4" />
              {t("saveTrip")}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              {t("downloadPdf")}
            </button>
          </div>
        </div>
      </section>

      {!currentUser ? (
        <section className="rounded-[2rem] border border-sky-200 bg-sky-50 p-5 text-sky-950 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-100">
          <h2 className="text-lg font-black">{t("guestPromptTitle")}</h2>
          <p className="mt-2 text-sm leading-6">{t("guestPromptCopy")}</p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryTile label={t("estimatedTotal")} value={formatOfferPrice(total, "USD", locale)} />
        <SummaryTile label={t("items")} value={String(countItems(trip))} />
        <SummaryTile
          label={t("lastSaved")}
          value={trip.savedAt ? new Intl.DateTimeFormat(locale).format(new Date(trip.savedAt)) : t("notSaved")}
        />
      </section>

      {!hasItems ? (
        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-900">
          <Sparkles className="mx-auto h-8 w-8 text-sky-500" />
          <h2 className="mt-3 text-xl font-black text-slate-950 dark:text-white">
            {t("emptyTitle")}
          </h2>
          <p className="mt-2 text-slate-500">{t("emptyDescription")}</p>
          <Link
            href={`${addLocaleToPath("/search", locale)}?destination=Barcelona`}
            className="mt-5 inline-flex rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
          >
            {t("startSearch")}
          </Link>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <TripSection title={t("flights")} icon={Plane}>
          {trip.flights.map((flight) => (
            <TripItem
              key={flight.id}
              title={flight.airline}
              meta={`${flight.from} → ${flight.destination} · ${flight.departureTime}`}
              price={formatOfferPrice(flight.price, flight.currency, locale)}
              onRemove={() => handleRemove("flights", flight.id)}
            />
          ))}
          {!trip.flights.length ? <EmptyLine text={t("emptyFlights")} /> : null}
        </TripSection>

        <TripSection title={t("hotels")} icon={Hotel}>
          {trip.hotels.map((hotel) => (
            <TripItem
              key={hotel.id}
              title={hotel.name}
              meta={`${hotel.location} · ${hotel.rating}`}
              price={formatOfferPrice(hotel.pricePerNight, hotel.currency, locale)}
              onRemove={() => handleRemove("hotels", hotel.id)}
            />
          ))}
          {!trip.hotels.length ? <EmptyLine text={t("emptyHotels")} /> : null}
        </TripSection>

        <TripSection title={t("rentals")} icon={MapPinned}>
          {trip.rentals.map((rental) => (
            <TripItem
              key={rental.id}
              title={rental.name}
              meta={`${rental.location} · ${rental.rooms} ${t("rooms")} · ${rental.guests} ${t("guests")}`}
              price={formatOfferPrice(rental.pricePerNight, rental.currency, locale)}
              onRemove={() => handleRemove("rentals", rental.id)}
            />
          ))}
          {!trip.rentals.length ? <EmptyLine text={t("emptyRentals")} /> : null}
        </TripSection>

        <TripSection title={t("attractions")} icon={Utensils}>
          {trip.attractions.map((attraction) => (
            <TripItem
              key={attraction.id}
              title={attraction.name}
              meta={attraction.description ?? t("attraction")}
              price={attraction.price ? formatOfferPrice(attraction.price, "USD", locale) : ""}
              onRemove={() => handleRemove("attractions", attraction.id)}
            />
          ))}
          {!trip.attractions.length ? <EmptyLine text={t("emptyAttractions")} /> : null}
        </TripSection>
      </div>

      <TripSection title={t("dailyItinerary")} icon={Sparkles}>
        {trip.itinerary.map((day) => (
          <TripItem
            key={day.day}
            title={day.title}
            meta={`${day.morning} · ${day.afternoon} · ${day.evening}`}
            price=""
            onRemove={() => handleRemove("itinerary", String(day.day))}
          />
        ))}
        {!trip.itinerary.length ? <EmptyLine text={t("emptyItinerary")} /> : null}
      </TripSection>
    </main>
  );
}

function getTripDestination(trip: MyTripState) {
  return (
    trip.flights[0]?.destination ||
    trip.hotels[0]?.location ||
    trip.rentals[0]?.city ||
    trip.itinerary[0]?.title ||
    "Trip"
  );
}

function getTripTitle(trip: MyTripState, fallback: string) {
  const destination = getTripDestination(trip);
  return destination === "Trip" ? fallback : `${fallback} · ${destination}`;
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function TripSection({
  children,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  icon: typeof Plane;
  title: string;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
        <Icon className="h-5 w-5 text-sky-500" />
        {title}
      </h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function TripItem({
  meta,
  onRemove,
  price,
  title,
}: {
  meta: string;
  onRemove: () => void;
  price: string;
  title: string;
}) {
  const t = useTranslations("myTrip");

  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/10 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h3 className="font-black text-slate-950 dark:text-white">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{meta}</p>
        {price ? <p className="mt-2 text-sm font-black text-teal-700 dark:text-teal-300">{price}</p> : null}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-rose-200 px-3 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-200 dark:hover:bg-rose-400/10"
      >
        <Trash2 className="h-4 w-4" />
        {t("remove")}
      </button>
    </article>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500 dark:bg-white/10">{text}</p>;
}

function estimateTotal(trip: MyTripState) {
  const flights = trip.flights.reduce((sum, flight) => sum + (flight.price ?? 0), 0);
  const hotels = trip.hotels.reduce((sum, hotel) => sum + (hotel.pricePerNight ?? 0), 0);
  const rentals = trip.rentals.reduce((sum, rental) => sum + rental.pricePerNight, 0);
  const attractions = trip.attractions.reduce((sum, attraction) => sum + (attraction.price ?? 0), 0);

  return flights + hotels + rentals + attractions;
}

function countItems(trip: MyTripState) {
  return (
    trip.flights.length +
    trip.hotels.length +
    trip.rentals.length +
    trip.attractions.length +
    trip.itinerary.length
  );
}

function buildPdfLines(
  trip: MyTripState,
  t: (key: string) => string,
  locale: string,
) {
  return [
    `${t("estimatedTotal")}: ${formatOfferPrice(estimateTotal(trip), "USD", locale)}`,
    "",
    `${t("flights")}: ${trip.flights.map((flight) => flight.airline).join(", ") || "-"}`,
    `${t("hotels")}: ${trip.hotels.map((hotel) => hotel.name).join(", ") || "-"}`,
    `${t("rentals")}: ${trip.rentals.map((rental) => rental.name).join(", ") || "-"}`,
    `${t("attractions")}: ${trip.attractions.map((item) => item.name).join(", ") || "-"}`,
    `${t("dailyItinerary")}: ${trip.itinerary.map((day) => day.title).join(", ") || "-"}`,
  ];
}
