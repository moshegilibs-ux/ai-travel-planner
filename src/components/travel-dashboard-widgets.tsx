import { Brain, Calculator, PlaneTakeoff, ShieldCheck } from "lucide-react";
import type { TripDeal } from "@/types/travel-marketplace";

export function BudgetCalculator({ trip }: { trip?: TripDeal }) {
  const breakdown = trip?.budgetBreakdown;
  const currency = breakdown?.currency ?? "USD";
  const rows = breakdown
    ? [
        ["טיסות", breakdown.flight, breakdown.labels.flight],
        ["מלון", breakdown.hotel, breakdown.labels.hotel],
        ["אוכל", breakdown.food, breakdown.labels.food],
        ["פעילויות", breakdown.activities, breakdown.labels.activities],
        ["עמלות", breakdown.fees, breakdown.labels.fees],
        ["מרווח ביטחון", breakdown.safetyMargin, breakdown.labels.safetyMargin],
      ]
    : [];

  function formatPrice(value: number) {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  }

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
        {rows.length ? (
          rows.map(([label, value, labelText]) => (
            <div key={label} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-500">{label}</span>
              <span className="text-left font-bold text-slate-950 dark:text-white">
                {formatPrice(Number(value))}
                <span className="block text-xs font-medium text-slate-400">
                  {labelText}
                </span>
              </span>
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/10">
            לא זמין כרגע. יש לבצע חיפוש עם ספקי API פעילים.
          </p>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
        <span className="font-bold text-slate-950 dark:text-white">סה"כ</span>
        <span className="text-2xl font-black text-slate-950 dark:text-white">
          {breakdown ? formatPrice(breakdown.total) : "לא זמין"}
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
        [PlaneTakeoff, "API", "הצעות בזמן אמת כשספקים זמינים"],
        [ShieldCheck, "נגיש", "בדיקת סיכוני נגישות"],
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
