import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/app-header";
import {
  AiRecommendations,
  BudgetCalculator,
  DashboardStats,
} from "@/components/travel-dashboard-widgets";
import { AiChatAssistant } from "@/components/ai-chat-assistant";
import { getTripDeals } from "@/lib/amadeus";
import { Accessibility, ArrowLeft, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TripDealCard } from "@/components/deal-cards";
import { OnboardingPanel } from "@/components/onboarding-panel";
import { AccessibilityOnboardingGate } from "@/components/accessibility-onboarding";
import { getFeatureFlags } from "@/lib/feature-flags";
import { CustomItinerarySection } from "@/components/custom-itinerary-section";
import { HeroTripPlanner, SampleItinerariesSection } from "@/components/hero-trip-planner";
import { getUiTranslations } from "@/lib/ui-translations";
import { getLocale, getTranslations } from "next-intl/server";

export default async function Home() {
  const heroT = await getTranslations("hero");
  const locale = await getLocale();
  const copy = getUiTranslations(locale).home;
  const flags = getFeatureFlags();
  const deals = await getTripDeals({
    from: "Tel Aviv",
    destination: "Barcelona",
    departureDate: "2026-06-10",
    returnDate: "2026-06-15",
    travelers: 2,
    budget: 1600,
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main>
        <AccessibilityOnboardingGate />
        <section className="relative overflow-hidden bg-[#f8fbff] dark:bg-slate-950">
          <div className="absolute inset-0">
            <Image
              src="/accessible-family-hero-v2.png"
              alt="משפחה רב־דורית בטיול נגיש עם סבא בקלנועית ובן בכיסא גלגלים"
              fill
              priority
              sizes="100vw"
              className="object-cover object-left-bottom opacity-75 md:object-left md:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/88 via-white/78 to-white/36 md:bg-gradient-to-l md:from-white/90 md:via-white/64 md:to-white/20 dark:from-slate-950/88 dark:via-slate-950/72 dark:to-slate-950/35" />
          </div>

          <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-8 md:pb-14 md:pt-16">
            <div className="grid min-h-[760px] gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div className="max-w-2xl text-right">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-amber-600 shadow-sm dark:bg-white/10 dark:text-amber-200">
                <Sparkles className="h-4 w-4" />
                {heroT("badge")}
              </p>
              <h1 className="max-w-full text-4xl font-black leading-[1.05] text-[#15315d] sm:text-5xl lg:text-6xl dark:text-white">
                {heroT("title")}
              </h1>
              <p className="mt-4 max-w-xl text-2xl font-black leading-tight text-amber-600 dark:text-amber-300">
                {copy.heroSubtitle}
              </p>
              <p className="mt-4 max-w-xl text-base font-semibold leading-8 text-slate-700 sm:text-lg dark:text-slate-200">
                {copy.heroCopy}
              </p>
              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                {([
                  [ShieldCheck, copy.trust[0]],
                  [Accessibility, copy.trust[1]],
                  [HeartHandshake, copy.trust[2]],
                ] as Array<[LucideIcon, string]>).map(([Icon, label]) => (
                  <div
                    key={label as string}
                    className="min-h-20 rounded-2xl bg-white/88 p-3 text-sm font-black text-[#15315d] shadow-sm backdrop-blur dark:bg-white/10 dark:text-white"
                  >
                    <Icon className="mb-2 h-5 w-5 text-emerald-500" />
                    {label as string}
                  </div>
                ))}
              </div>
              <Link
                href="#ai-itinerary-builder"
                className="mt-7 inline-flex min-h-14 w-full max-w-full items-center justify-center gap-3 rounded-2xl bg-[#15315d] px-5 py-4 text-base font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-700 sm:w-auto sm:px-8 sm:text-lg"
              >
                {copy.cta}
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
              <HeroTripPlanner />
            </div>
          </div>
        </section>

        <SampleItinerariesSection />

        <section className="mx-auto max-w-7xl px-5 py-12">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-300">
              תכנון משפחתי באמת
            </p>
            <h2 className="mt-2 text-4xl font-black text-[#15315d] dark:text-white">
              אנחנו חושבים על כל אחד במשפחה
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
              מהקלנועית של סבא, דרך כיסא הגלגלים של הבן, ועד הילדים שרוצים
              חוויה נעימה ובטוחה — כל בחירה במסלול נבחנת לפי נוחות, נגישות
              וקצב שמתאים לכולם.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              [
                HeartHandshake,
                "טיולים שמתאימים באמת לכל המשפחה",
                "חופשות שמתחשבות בילדים, הורים, סבים וסבתות ובצרכים של כל אחד.",
              ],
              [
                Accessibility,
                "נגישות לפני הכל",
                "סינון לפי מעלית, שירותים נגישים, גישה ללא מדרגות ומרחקי הליכה קצרים.",
              ],
              [
                ShieldCheck,
                "תכנון רגוע ובטוח",
                "קצב איטי יותר, זמני מנוחה, תחבורה נגישה והפחתת מעברים מיותרים.",
              ],
              [
                Sparkles,
                "חופשה עם סבא, סבתא, הילדים והנכדים",
                "המלצות AI שמחברות בין נוחות, חוויה, תקציב וביטחון.",
              ],
            ].map(([Icon, title, text]) => (
              <div
                key={title as string}
                className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900"
              >
                <Icon className="h-6 w-6 text-emerald-500" />
                <h3 className="mt-4 text-xl font-black">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {text as string}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#fff7e8] py-12 dark:bg-slate-900/70">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="rounded-[2rem] border border-amber-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950">
              <ShieldCheck className="h-8 w-8 text-amber-500" />
              <h2 className="mt-4 text-4xl font-black text-[#15315d] dark:text-white">
                חופשה נגישה, רגועה ובטוחה
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                במקום לרוץ בין אטרקציות, המערכת בונה ימים מאוזנים עם מרחקי
                הליכה קצרים, זמני מנוחה, תחבורה נוחה ובדיקות נגישות חשובות
                לפני שמזמינים.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "מרחקי הליכה קצרים",
                "מעלית חובה",
                "חדר רחצה נגיש",
                "שירותים נגישים",
                "סיוע רפואי קרוב",
                "גישה ללא מדרגות",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-amber-100 bg-white px-5 py-4 text-lg font-black text-[#15315d] shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div id="ai-itinerary-builder">
          <CustomItinerarySection />
        </div>

        {flags.onboardingMode ? <OnboardingPanel /> : null}

        <section className="mx-auto max-w-7xl px-5 py-10">
          <DashboardStats />
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[1fr_420px]">
          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-sky-600 dark:text-sky-300">
                  השוואת מחירים נגישה
                </p>
                <h2 className="mt-1 text-3xl font-black">הצעות מומלצות עכשיו</h2>
              </div>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
              >
                לכל ההצעות
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
            {deals.length ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {deals.slice(0, 2).map((deal, index) => (
                  <TripDealCard key={deal.id} trip={deal} bestValue={index === 0} />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                {heroT("offersUnavailable")}
              </div>
            )}
          </div>

          <aside className="grid gap-5">
            <AiChatAssistant />
            <BudgetCalculator trip={deals[0]} />
            <AiRecommendations />
          </aside>
        </section>
      </main>
    </div>
  );
}

