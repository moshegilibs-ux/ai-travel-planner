"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Edit3, Share2, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { getCurrentUser, subscribeAuthState } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { addLocaleToPath, AppLocale, isLocale } from "@/lib/i18n";
import { writeMyTrip } from "@/lib/my-trip";
import {
  decodeSharedTrip,
  deleteUserTrip,
  duplicateUserTrip,
  encodeSharedTrip,
  getTripOwnerId,
  getUserTrips,
  isGuestOwner,
  saveUserTrip,
  UserSavedTrip,
} from "@/lib/user-trips";

export function MyTripsView() {
  const t = useTranslations("myTrips");
  const localeValue = useLocale();
  const locale: AppLocale = isLocale(localeValue) ? localeValue : "he";
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [trips, setTrips] = useState<UserSavedTrip[]>([]);

  useEffect(() => subscribeAuthState(setUser), []);

  useEffect(() => {
    const ownerId = getTripOwnerId(user);
    setTrips(getUserTrips(ownerId));
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedTrip = decodeSharedTrip(params.get("share"));

    if (!sharedTrip) return;

    const ownerId = getTripOwnerId(user);
    const importedTrip = {
      ...sharedTrip,
      id: crypto.randomUUID(),
      ownerId,
      title: `${sharedTrip.title} ${t("sharedCopySuffix")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTrips(saveUserTrip(importedTrip));
    toast.success(t("sharedImported"));
    window.history.replaceState(null, "", addLocaleToPath("/my-trips", locale));
  }, [locale, t, user]);

  const ownerId = getTripOwnerId(user);

  function handleEdit(trip: UserSavedTrip) {
    writeMyTrip(trip.trip);
    toast.success(t("loadedForEdit"));
  }

  function handleDuplicate(tripId: string) {
    setTrips(duplicateUserTrip(ownerId, tripId));
    toast.success(t("duplicated"));
  }

  async function handleShare(trip: UserSavedTrip) {
    const link = `${window.location.origin}${addLocaleToPath("/my-trips", locale)}?share=${encodeSharedTrip(trip)}`;

    try {
      await navigator.clipboard.writeText(link);
      toast.success(t("shareCopied"));
    } catch {
      window.prompt(t("sharePrompt"), link);
    }
  }

  function handleDelete(tripId: string) {
    setTrips(deleteUserTrip(ownerId, tripId));
    toast.success(t("deleted"));
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 pb-28 md:pb-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <p className="text-sm font-black text-sky-600 dark:text-sky-300">{t("eyebrow")}</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">{t("title")}</h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
          {user ? t("description") : t("guestDescription")}
        </p>
      </section>

      {!user ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
          <h2 className="text-lg font-black">{t("guestTitle")}</h2>
          <p className="mt-2 text-sm leading-6">{t("guestCopy")}</p>
        </section>
      ) : null}

      {trips.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {trips.map((trip) => (
            <article
              key={trip.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">{trip.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {trip.destination} · {new Intl.DateTimeFormat(locale).format(new Date(trip.updatedAt))}
                  </p>
                </div>
                {isGuestOwner(trip.ownerId) ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">
                    {t("guest")}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <Metric label={t("flights")} value={trip.trip.flights.length} />
                <Metric label={t("hotels")} value={trip.trip.hotels.length + trip.trip.rentals.length} />
                <Metric label={t("days")} value={trip.trip.itinerary.length} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={addLocaleToPath("/my-trip", locale)}
                  onClick={() => handleEdit(trip)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
                >
                  <Edit3 className="h-4 w-4" />
                  {t("edit")}
                </Link>
                <button
                  type="button"
                  onClick={() => handleDuplicate(trip.id)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <Copy className="h-4 w-4" />
                  {t("duplicate")}
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(trip)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 px-4 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-50 dark:border-sky-400/30 dark:text-sky-200 dark:hover:bg-sky-400/10"
                >
                  <Share2 className="h-4 w-4" />
                  {t("share")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(trip.id)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-200 dark:hover:bg-rose-400/10"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("delete")}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-900">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">{t("emptyTitle")}</h2>
          <p className="mt-3 text-slate-500">{t("emptyCopy")}</p>
          <Link
            href={addLocaleToPath("/my-trip", locale)}
            className="mt-5 inline-flex rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
          >
            {t("openCurrentTrip")}
          </Link>
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/10">
      <p className="text-lg font-black text-slate-950 dark:text-white">{value}</p>
      <p className="text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}
