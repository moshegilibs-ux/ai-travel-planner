"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

export function VideoInspiration() {
  return (
    <section className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-[0.85fr_1.15fr] md:items-center">
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm font-bold text-emerald-700">וידאו קצר לפני שבוחרים</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">השראה בוידאו</h2>
          <p className="mt-3 leading-8 text-slate-600">
            טעימה ויזואלית שממחישה את קצב הטיול, הנופים והאווירה. בהמשך אפשר
            להחליף את הווידאו לכל יעד לפי בחירת המשתמש.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-xl"
        >
          <div className="relative">
            <iframe
              className="aspect-video w-full"
              src="https://www.youtube.com/embed/1La4QzGeaaQ"
              title="השראה בוידאו לטיולים"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-bold text-white backdrop-blur">
              <Play className="h-4 w-4" />
              השראה כללית
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
