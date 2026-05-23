import { Brain, Calculator, PlaneTakeoff, ShieldCheck } from "lucide-react";
import type { TripDeal } from "@/types/travel-marketplace";

export function BudgetCalculator({ trip }: { trip?: TripDeal }) {
  const flight = trip ? Math.round(trip.flight.price * 2) : 438;
  const hotel = trip ? trip.hotel.pricePerNight * 4 : 528;
  const food = 260;
  const activities = 220;
  const total = flight + hotel + food + activities;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-sky-50 p-3 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
          <Calculator className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-sky-600 dark:text-sky-300">
            מחשבון תקציב
          </p>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            עלות טיול משוערת
          </h2>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {[
          ["טיסות", flight],
          ["מלון", hotel],
          ["אוכל", food],
          ["פעילויות", activities],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="font-bold text-slate-950 dark:text-white">${value}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
        <span className="font-bold text-slate-950 dark:text-white">סה״כ</span>
        <span className="text-2xl font-black text-slate-950 dark:text-white">
          ${total}
        </span>
      </div>
    </section>
  );
}

export function AiRecommendations() {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
          <Brain className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-violet-600 dark:text-violet-300">
            המלצות AI
          </p>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            עוזר חכם לטיול נגיש
          </h2>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {[
          ["העדיפו קצב רגוע", "פעילות אחת בבוקר, מנוחה בצהריים ויציאה קצרה בערב."],
          ["לינה ליד תחבורה נגישה", "חוסך מעברים ארוכים ומקל על מבוגרים וילדים."],
          ["בדקו נגישות מראש", "מעלית, שירותים נגישים וגישה ללא מדרגות לפני הזמנה."],
        ].map(([title, text]) => (
          <div key={title} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10">
            <p className="font-bold text-slate-950 dark:text-white">{title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        [PlaneTakeoff, "42", "הצעות טיול"],
        [ShieldCheck, "נגיש", "בדיקת סיכונים"],
        [Brain, "AI", "תכנון אישי למשפחה"],
      ].map(([Icon, value, label]) => (
        <div
          key={label as string}
          className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900"
        >
          <Icon className="h-6 w-6 text-sky-500" />
          <p className="mt-4 text-3xl font-black text-slate-950 dark:text-white">
            {value as string}
          </p>
          <p className="mt-1 text-sm text-slate-500">{label as string}</p>
        </div>
      ))}
    </div>
  );
}

export function LoadingSkeletons() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-96 animate-pulse rounded-[2rem] bg-slate-200 dark:bg-white/10"
        />
      ))}
    </div>
  );
}
