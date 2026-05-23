import Image from "next/image";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BudgetCalculator, AiRecommendations } from "@/components/travel-dashboard-widgets";
import { getTripById } from "@/lib/amadeus";
import { Clock, Hotel, Plane, Star } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const trip = await getTripById(id);

  return {
    title: `${trip.title} | טיולים וחלומות`,
    description: trip.aiSummary,
    openGraph: {
      title: trip.title,
      description: trip.aiSummary,
      images: [trip.image],
    },
  };
}

export default async function TripDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await getTripById(id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-5 py-8">
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm dark:bg-slate-900">
          <div className="relative h-80">
            <Image
              src={trip.image}
              alt={trip.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
            <div className="absolute bottom-0 right-0 p-6 text-white">
              <p className="text-sm font-bold text-sky-200">פרטי טיול נגיש</p>
              <h1 className="mt-2 text-4xl font-black md:text-5xl">{trip.title}</h1>
              <p className="mt-3 max-w-2xl leading-8 text-slate-100">
                {trip.aiSummary}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-5">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <h2 className="text-2xl font-black">פרטי טיסה</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <span className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10">
                  <Plane className="mb-2 h-5 w-5 text-sky-500" />
                  <strong>{trip.flight.airline}</strong>
                  <p className="mt-1 text-sm text-slate-500">
                    {trip.flight.from} אל {trip.flight.destination}
                  </p>
                </span>
                <span className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10">
                  <Clock className="mb-2 h-5 w-5 text-sky-500" />
                  <strong>{trip.flight.duration}</strong>
                  <p className="mt-1 text-sm text-slate-500">
                    {trip.flight.departureTime} - {trip.flight.arrivalTime}
                  </p>
                </span>
                <span className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10">
                  <strong className="text-2xl">${Math.round(trip.flight.price)}</strong>
                  <p className="mt-1 text-sm text-slate-500">
                    {trip.flight.nonstop ? "ישירה" : "עצירה אחת"}
                  </p>
                </span>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <h2 className="text-2xl font-black">מלון ולינה</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
                <Hotel className="h-8 w-8 text-sky-500" />
                <div>
                  <h3 className="text-xl font-bold">{trip.hotel.name}</h3>
                  <p className="mt-1 text-slate-500">{trip.hotel.location}</p>
                  <p className="mt-2 inline-flex items-center gap-1 font-bold text-amber-600">
                    <Star className="h-4 w-4 fill-amber-500" />
                    {trip.hotel.rating} · {trip.hotel.stars} כוכבים
                  </p>
                </div>
                <p className="text-2xl font-black">${trip.hotel.pricePerNight}/לילה</p>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <h2 className="text-2xl font-black">מסלול AI רגוע</h2>
              <div className="mt-5 grid gap-3">
                {["הגעה נינוחה ובדיקת אזור המלון", "אטרקציה מרכזית נגישה ואוכל מקומי", "יום גמיש לשופינג או מוזיאון עם מנוחה"].map(
                  (item, index) => (
                    <div key={item} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10">
                      <p className="font-bold">יום {index + 1}</p>
                      <p className="mt-1 text-sm text-slate-500">{item}</p>
                    </div>
                  ),
                )}
              </div>
            </article>
          </div>

          <aside className="grid h-fit gap-5">
            <BudgetCalculator trip={trip} />
            <AiRecommendations />
            <Link
              href="/saved"
              className="rounded-2xl bg-slate-950 px-5 py-4 text-center font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
            >
              למסלולים השמורים
            </Link>
          </aside>
        </section>
      </main>
    </div>
  );
}
