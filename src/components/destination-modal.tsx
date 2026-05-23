"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CalendarDays, CloudSun, MapPin, Play, Utensils, X } from "lucide-react";
import type { Destination } from "@/lib/destinations-data";

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-bold text-slate-950">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export function DestinationModal({
  destination,
  onClose,
}: {
  destination: Destination | null;
  onClose: () => void;
}) {
  if (!destination) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-xl bg-slate-50 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-800 shadow-md transition hover:bg-white"
          aria-label="סגור"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative min-h-72">
          <Image
            src={destination.image}
            alt={destination.name}
            fill
            sizes="(max-width: 768px) 100vw, 960px"
            className="h-72 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          <div className="absolute bottom-0 right-0 p-6 text-white">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-bold backdrop-blur">
              <CalendarDays className="h-4 w-4" />
              מומלץ: {destination.recommendedDays}
            </p>
            <h2 className="text-4xl font-bold">{destination.name}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-100">
              {destination.description}
            </p>
          </div>
        </div>

        <div className="grid gap-6 p-5 md:p-7">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <CloudSun className="mb-2 h-5 w-5 text-emerald-700" />
              <p className="text-sm font-bold text-slate-950">מזג אוויר כללי</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{destination.weather}</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <CalendarDays className="mb-2 h-5 w-5 text-emerald-700" />
              <p className="text-sm font-bold text-slate-950">עונה מומלצת</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {destination.recommendedSeason}
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <MapPin className="mb-2 h-5 w-5 text-emerald-700" />
              <p className="text-sm font-bold text-slate-950">תקציב משוער</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {destination.estimatedBudget}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {destination.gallery.map((src) => (
              <Image
                key={src}
                src={src}
                alt={`תמונה של ${destination.name}`}
                width={420}
                height={240}
                className="h-44 w-full rounded-lg object-cover shadow-sm"
              />
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
            {destination.videoUrl ? (
              <iframe
                className="aspect-video w-full"
                src={destination.videoUrl}
                title={`וידאו השראה ${destination.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex aspect-video items-center justify-center text-white">
                <Play className="ml-2 h-6 w-6" />
                וידאו השראה יתווסף בקרוב
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoList title="אטרקציות מומלצות" items={destination.attractions} />
            <InfoList title="מסעדות מומלצות" items={destination.restaurants} />
            <InfoList title="אזורי לינה מומלצים" items={destination.stayAreas} />
            <InfoList title="טיפים חשובים" items={destination.tips} />
          </div>

          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <h3 className="flex items-center gap-2 font-bold text-emerald-950">
              <Utensils className="h-5 w-5" />
              מתאים במיוחד
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {destination.suitableFor.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white px-3 py-1 text-sm font-bold text-emerald-900"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
