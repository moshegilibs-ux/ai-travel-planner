"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { inspirationImages } from "@/lib/destinations-data";

export function InspirationGallery() {
  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-7">
          <p className="text-sm font-bold text-emerald-700">רגעים שפותחים תיאבון</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">גלריית השראה</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {inspirationImages.slice(0, 8).map((item, index) => (
            <motion.figure
              key={`${item.src}-${item.title}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="group relative h-56 overflow-hidden rounded-lg shadow-sm"
            >
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-4 text-sm font-bold text-white">
                {item.title}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
