"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Coins, Users } from "lucide-react";
import { DestinationModal } from "@/components/destination-modal";
import { destinations } from "@/lib/destinations-data";
import type { Destination } from "@/lib/destinations-data";
import { useState } from "react";

export function DestinationsSection() {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  return (
    <section className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-bold text-emerald-700">יעדים חכמים להתחלה מהירה</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
            לאן כדאי לנסוע?
          </h2>
          <p className="mt-3 leading-8 text-slate-600">
            יעדים פופולריים עם עונות מומלצות, תקציב, התאמה לסגנון הטיול ומידע
            מפורט שיעזור לבחור את הכיוון הנכון.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination, index) => (
            <motion.article
              key={destination.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: index * 0.03 }}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <button
                type="button"
                onClick={() => setSelectedDestination(destination)}
                className="block w-full text-right"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  <h3 className="absolute bottom-4 right-4 text-2xl font-bold text-white">
                    {destination.name}
                  </h3>
                </div>
              </button>

              <div className="p-4">
                <p className="line-clamp-3 min-h-20 leading-7 text-slate-600">
                  {destination.description}
                </p>
                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-emerald-700" />
                    {destination.recommendedSeason}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Coins className="h-4 w-4 text-emerald-700" />
                    {destination.estimatedBudget}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-700" />
                    {destination.suitableFor.join(" / ")}
                  </span>
                </div>

                <div className="mt-5 grid gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDestination(destination)}
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    מידע מפורט
                  </button>
                  <Link
                    href={`/questionnaire?destination=${encodeURIComponent(destination.name)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    בנה לי מסלול
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedDestination ? (
          <DestinationModal
            destination={selectedDestination}
            onClose={() => setSelectedDestination(null)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
