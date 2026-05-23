import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/app-header";
import { SearchForm } from "@/components/search-form";
import {
  AiRecommendations,
  BudgetCalculator,
  DashboardStats,
} from "@/components/travel-dashboard-widgets";
import { AiChatAssistant } from "@/components/ai-chat-assistant";
import { getTripDeals } from "@/lib/amadeus";
import { Accessibility, ArrowLeft, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { TripDealCard } from "@/components/deal-cards";
import { OnboardingPanel } from "@/components/onboarding-panel";
import { getFeatureFlags } from "@/lib/feature-flags";
import { CustomItinerarySection } from "@/components/custom-itinerary-section";

export default async function Home() {
  const flags = getFeatureFlags();
  const deals = await getTripDeals({
    from: "Tel Aviv",
    destination: "Paris",
    departureDate: "2026-06-10",
    returnDate: "2026-06-15",
    travelers: 2,
    budget: 1600,
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main>
        <section className="relative overflow-hidden bg-[#f8fbff] dark:bg-slate-950">
          <div className="absolute inset-0">
            <Image
              src="/accessible-family-hero.png"
              alt="משפחה רב־דורית בטיול נגיש עם סבא בקלנועית ובן בכיסא גלגלים"
              fill
              priority
              sizes="100vw"
              className="object-contain object-left-bottom opacity-70 md:object-cover md:object-left md:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/98 via-white/92 to-white/35 md:bg-gradient-to-l md:from-white/95 md:via-white/70 md:to-white/10 dark:from-slate-950/95 dark:via-slate-950/75 dark:to-slate-950/30" />
          </div>

          <div className="relative mx-auto min-h-[760px] max-w-7xl px-5 pb-10 pt-10 md:min-h-[720px] md:pb-16 md:pt-20">
            <div className="mx-auto w-full max-w-[calc(100vw-2.5rem)] text-center md:ml-auto md:mr-0 md:max-w-2xl md:text-right">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-amber-600 shadow-sm dark:bg-white/10 dark:text-amber-200">
                <Sparkles className="h-4 w-4" />
                מטיילים יחד, בלי גבולות
              </p>
              <h1 className="max-w-full text-4xl font-black leading-tight tracking-tight text-[#15315d] sm:text-6xl md:text-8xl dark:text-white">
                <span className="block sm:inline">טיולים</span>{" "}
                <span className="block sm:inline">וחלומות</span>
              </h1>
              <p className="mt-4 text-xl font-black text-amber-600 sm:text-2xl dark:text-amber-300">
                מתכננים חופשה שמתאימה לכולם
              </p>
              <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-700 dark:text-slate-200">
                <span className="block">מערכת חכמה לתכנון טיולים למשפחות,</span>
                <span className="block">מבוגרים ואנשים עם מוגבלויות</span>
                <span className="block">עם דגש על נגישות, נוחות וביטחון.</span>
              </p>
              <Link
                href="#accessible-search"
                className="mt-7 inline-flex min-h-14 w-full max-w-full items-center justify-center gap-3 rounded-2xl bg-[#15315d] px-5 py-4 text-base font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-700 sm:w-auto sm:px-8 sm:text-lg"
              >
                תכננו לי טיול נגיש
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="relative mt-6 h-48 overflow-hidden rounded-[1.75rem] bg-white/70 shadow-xl md:hidden">
                <Image
                  src="/accessible-family-hero.png"
                  alt="משפחה רב־דורית בטיול נגיש עם סבא בקלנועית ובן בכיסא גלגלים"
                  fill
                  sizes="100vw"
                  className="object-contain object-center"
                />
              </div>
            </div>

            <div className="mx-auto mt-8 grid w-full max-w-[calc(100vw-2.5rem)] grid-cols-2 gap-2 rounded-[1.75rem] bg-white/85 p-3 shadow-xl backdrop-blur md:mx-0 md:max-w-3xl md:grid-cols-4 dark:bg-white/10">
              {[
                [Accessibility, "נגישות מלאה"],
                [ShieldCheck, "בטיחות ושקט נפשי"],
                [HeartHandshake, "מתאים לכל המשפחה"],
                [Sparkles, "תכנון חכם"],
              ].map(([Icon, label]) => (
                <div
                  key={label as string}
                  className="flex flex-col items-center justify-center rounded-2xl px-3 py-4 text-center text-sm font-black text-[#15315d] dark:text-white"
                >
                  <Icon className="mb-2 h-7 w-7 text-[#15315d] dark:text-amber-300" />
                  {label as string}
                </div>
              ))}
            </div>

            <div id="accessible-search" className="mt-8">
              <SearchForm />
            </div>
          </div>
        </section>

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

        <CustomItinerarySection />

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
            <div className="grid gap-5 lg:grid-cols-2">
              {deals.slice(0, 2).map((deal, index) => (
                <TripDealCard key={deal.id} trip={deal} bestValue={index === 0} />
              ))}
            </div>
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
