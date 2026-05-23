import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SearchForm } from "@/components/search-form";
import { seoDestinations, type SeoDestinationSlug } from "@/data/seo-destinations";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return Object.keys(seoDestinations).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = seoDestinations[slug as SeoDestinationSlug];

  if (!destination) return {};

  return {
    title: `${destination.name} | טיולים וחלומות`,
    description: destination.aiSummary,
    openGraph: {
      title: `${destination.name} טיולים נגישים`,
      description: destination.aiSummary,
    },
  };
}

export default async function DestinationLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = seoDestinations[slug as SeoDestinationSlug];

  if (!destination) notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main>
        <section className="mx-auto max-w-7xl px-5 py-14">
          <p className="text-sm font-bold text-sky-600 dark:text-sky-300">
            מדריך יעד נגיש
          </p>
          <h1 className="mt-2 text-5xl font-black">טיול נגיש ב{destination.name}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            {destination.aiSummary}
          </p>
          <div className="mt-8">
            <SearchForm />
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-14 md:grid-cols-2">
          {[
            ["חודשים מומלצים", destination.bestMonths],
            ["מחירים ממוצעים", [destination.averagePrices]],
            ["אזורי לינה מומלצים", destination.hotelZones],
            ["הערכת תקציב", destination.budgetEstimates],
            ["מסלול לדוגמה", destination.sampleItinerary],
          ].map(([title, items]) => (
            <article
              key={title as string}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900"
            >
              <h2 className="text-2xl font-black">{title as string}</h2>
              <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-300">
                {(items as string[]).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
