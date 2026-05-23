"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  Heart,
  Mountain,
  ShoppingBag,
  Sun,
  Users,
} from "lucide-react";
import { travelTypes } from "@/lib/destinations-data";

const icons = [Heart, Users, Sun, ShoppingBag, Mountain, BadgeDollarSign];

export function TravelTypeSection() {
  return (
    <section className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-bold text-emerald-300">בחרו לפי תחושה, לא רק לפי יעד</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            איזה טיול מתאים לך?
          </h2>
          <p className="mt-3 leading-8 text-slate-300">
            דרך מהירה להבין איזה סוג חופשה מתאים למטיילים, לתקציב ולקצב שאתם
            רוצים.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {travelTypes.map((type, index) => {
            const Icon = icons[index] ?? Sun;

            return (
              <motion.article
                key={type.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
              >
                <Icon className="h-7 w-7 text-emerald-300" />
                <h3 className="mt-4 text-xl font-bold">{type.title}</h3>
                <p className="mt-2 leading-7 text-slate-300">{type.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {type.destinations.map((destination) => (
                    <span
                      key={destination}
                      className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-emerald-100"
                    >
                      {destination}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/questionnaire?style=${encodeURIComponent(type.title)}`}
                  className="mt-5 inline-flex rounded-md bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
                >
                  התחל לפי הסגנון הזה
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
