"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Accessibility,
  BedDouble,
  Bike,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Footprints,
  Fuel,
  Gauge,
  Hotel,
  Map,
  MapPin,
  Mountain,
  PauseCircle,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react";
import { ItineraryResponse, Recommendation, TimelineActivity } from "@/lib/itinerary-types";

const resultStorageKey = "ai-travel-planner:last-itinerary";

const periodLabels: Record<TimelineActivity["period"], string> = {
  morning: "בוקר",
  afternoon: "צהריים",
  evening: "ערב",
};

function Rating({ value }: { value: number }) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
      {safeValue.toFixed(1)}
    </span>
  );
}

function RecommendationCard({ item }: { item: Recommendation }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div
        className="h-28 bg-cover bg-center"
        style={{ backgroundImage: `url(${item.imageUrl ?? ""})` }}
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-slate-950">{item.name ?? "המלצה"}</h3>
          <Rating value={item.rating} />
        </div>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {item.area ?? "אזור מרכזי"}
        </p>
        <p className="mt-3 leading-7 text-slate-600">
          {item.reason ?? "המלצה כללית לבדיקה לפני הזמנה."}
        </p>
        <p className="mt-3 rounded-md bg-sky-50 px-3 py-2 text-sm font-semibold leading-6 text-sky-900">
          {item.isAccessible ? "נגישות: " : "דורש בדיקה: "}
          {item.accessibilityNotes ?? "יש לאמת נגישות מול המקום."}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
            {item.approximatePrice ?? "מחיר לא ידוע"}
          </span>
          <a
            href={item.mapUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            מפה
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

function ActivityCard({ activity }: { activity: TimelineActivity }) {
  return (
    <article className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row">
        <div
          className="h-40 rounded-md bg-cover bg-center md:h-auto md:w-44"
          style={{ backgroundImage: `url(${activity.imageUrl ?? ""})` }}
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">
              {periodLabels[activity.period] ?? "פעילות"}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500">
              <Clock3 className="h-4 w-4" />
              {activity.startTime ?? "--:--"}-{activity.endTime ?? "--:--"}
            </span>
            <Rating value={activity.rating} />
          </div>
          <h3 className="mt-3 text-xl font-bold text-slate-950">
            {activity.place ?? "תחנה במסלול"}
          </h3>
          <p className="mt-1 font-semibold text-slate-700">
            {activity.activity ?? "פעילות מומלצת"}
          </p>
          <p className="mt-3 leading-7 text-slate-600">
            {activity.description ?? "פרטים נוספים יוצגו לאחר יצירת מסלול חדש."}
          </p>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <span className="rounded-md bg-orange-50 px-3 py-2 font-semibold text-orange-900">
              רכיבה: {activity.ridingDistance ?? "לא רלוונטי"}
            </span>
            <span className="rounded-md bg-orange-50 px-3 py-2 font-semibold text-orange-900">
              זמן רכיבה: {activity.ridingDuration ?? "לא רלוונטי"}
            </span>
            <span className="rounded-md bg-slate-50 px-3 py-2">
              נסיעה: {activity.travelTime ?? "לא צוין"}
            </span>
            <span className="rounded-md bg-sky-50 px-3 py-2 font-semibold text-sky-900">
              הליכה: {activity.walkingDistance ?? "לא צוין"}
            </span>
            <span className="rounded-md bg-slate-50 px-3 py-2">
              תחבורה: {activity.transportation ?? "לא צוין"}
            </span>
            <span className="rounded-md bg-slate-50 px-3 py-2">
              עלות: {activity.approximateCost ?? "לא צוין"}
            </span>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <span className="inline-flex items-center gap-2 rounded-md bg-orange-50 px-3 py-2 font-semibold text-orange-950">
              <Gauge className="h-4 w-4" />
              {activity.routeDifficulty ?? "לא צוין"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md bg-orange-50 px-3 py-2 font-semibold text-orange-950">
              <Mountain className="h-4 w-4" />
              {activity.elevationNote ?? "לא צוין"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md bg-orange-50 px-3 py-2 font-semibold text-orange-950">
              <Fuel className="h-4 w-4" />
              {activity.fuelOrChargingStop ?? "לא נדרש"}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(activity.accessibilityTags ?? []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-3 py-1 text-sm font-bold text-sky-900"
              >
                <Accessibility className="h-4 w-4" />
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-800">
            הערת נגישות: {activity.accessibilityNotes ?? "יש לאמת נגישות מול המקום."}
          </p>
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-900">
            עצירת מנוחה: {activity.restStopSuggestion ?? "הוסיפו מנוחה לפי צורך."}
          </p>
          <p className="mt-4 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium leading-6 text-sky-900">
            למה זה מתאים: {activity.matchReason ?? "מותאם לפי הפרופיל שנבחר."}
          </p>
          <a
            href={activity.mapUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900"
          >
            פתיחה במפה
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function ResultsView() {
  const [result, setResult] = useState<ItineraryResponse | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const storedResult = sessionStorage.getItem(resultStorageKey);

      if (storedResult) {
        try {
          setResult(JSON.parse(storedResult) as ItineraryResponse);
        } catch {
          sessionStorage.removeItem(resultStorageKey);
          setResult(null);
        }
      }

      setHasLoaded(true);
    });
  }, []);

  if (!hasLoaded) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="font-semibold text-slate-700">טוענים את המסלול...</p>
        </div>
      </main>
    );
  }

  if (!result?.itinerary) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">אין מסלול להצגה</h1>
          <p className="mt-3 leading-7 text-slate-600">
            מלאו את השאלון כדי ליצור מסלול חדש ומותאם אישית.
          </p>
          <Link
            href="/questionnaire"
            className="mt-6 inline-flex rounded-md bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            מעבר לשאלון
          </Link>
        </div>
      </main>
    );
  }

  const { itinerary, source } = result;
  const days = itinerary.days ?? [];
  const hotelRecommendations = itinerary.hotelRecommendations ?? [];
  const kosherAndChabad = [
    ...(itinerary.kosherRestaurants ?? []),
    ...(itinerary.chabadHouses ?? []),
  ];

  return (
    <main className={isLargeText ? "text-lg" : undefined}>
      <section
        className="relative min-h-[420px] bg-cover bg-center"
        style={{ backgroundImage: `url(${itinerary.heroImageUrl ?? ""})` }}
      >
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="relative mx-auto flex min-h-[420px] max-w-6xl flex-col justify-end px-5 py-10 text-white">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-md bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur">
            <Sparkles className="h-4 w-4" />
            {source === "openai" ? "מסלול שנוצר ב-AI" : "מסלול פיתוח ממנוע דמה"}
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            {itinerary.destination ?? "המסלול שלכם"}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-100">
            {itinerary.summary ?? "מסלול מותאם אישית יוצג כאן לאחר יצירה."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {(itinerary.tags ?? []).map((tag) => (
              <span key={tag} className="rounded-md bg-white/15 px-3 py-2 text-sm font-bold backdrop-blur">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="rounded-md bg-emerald-100 p-3 text-emerald-800">
                <Route className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">תובנות מסלול</h2>
                <p className="mt-2 leading-7 text-slate-600">
                  {itinerary.profileSummary ?? "תובנות המסלול יוצגו לאחר יצירה חדשה."}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(itinerary.routeNotes ?? []).map((note) => (
                <p key={note} className="rounded-md bg-slate-50 px-4 py-3 leading-7 text-slate-700">
                  {note}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-sky-200 bg-sky-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="rounded-md bg-white p-3 text-sky-800">
                <Accessibility className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">סיכום נגישות וניידות</h2>
                <p className="mt-2 leading-8 text-slate-700">
                  {itinerary.mobilitySummary ?? "לא הוגדר סיכום נגישות במסלול הזה."}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(itinerary.accessibilityHighlights ?? []).map((highlight) => (
                <p
                  key={highlight}
                  className="flex items-start gap-2 rounded-md bg-white px-4 py-3 font-medium leading-7 text-slate-700"
                >
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-sky-700" />
                  {highlight}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="rounded-md bg-white p-3 text-orange-800">
                <Bike className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">סיכום רכיבה ומסלול</h2>
                <p className="mt-2 leading-8 text-slate-700">
                  {itinerary.travelModeSummary ?? "לא הוגדר מצב רכיבה במסלול הזה."}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(itinerary.ridingHighlights ?? []).map((highlight) => (
                <p
                  key={highlight}
                  className="flex items-start gap-2 rounded-md bg-white px-4 py-3 font-medium leading-7 text-slate-700"
                >
                  <Route className="mt-1 h-5 w-5 shrink-0 text-orange-700" />
                  {highlight}
                </p>
              ))}
            </div>
          </div>

          {days.map((day) => (
            <article key={day.day} className="rounded-lg border border-slate-200 bg-slate-100/60 p-3 shadow-sm">
              <div className="rounded-md bg-white p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-emerald-700">
                      יום {day.day ?? ""} · {day.area ?? "אזור מומלץ"}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950">
                      {day.title ?? "יום במסלול"}
                    </h2>
                    <p className="mt-2 leading-7 text-slate-600">
                      {day.flowNote ?? "פרטי היום יוצגו לאחר יצירת מסלול חדש."}
                    </p>
                  </div>
                  <span className="w-fit rounded-md bg-slate-900 px-4 py-3 text-sm font-bold text-white">
                    {day.estimatedDailyCost ?? "עלות לא ידועה"}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <span className="inline-flex items-center gap-2 rounded-md bg-orange-50 px-3 py-2 font-bold text-orange-900">
                    <Bike className="h-5 w-5" />
                    {day.totalRidingDistance ?? "לא רלוונטי"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-2 font-bold text-sky-900">
                    <Footprints className="h-5 w-5" />
                    {day.totalWalkingDistance ?? "לא צוין"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 font-bold text-emerald-900">
                    <Accessibility className="h-5 w-5" />
                    נגישות מתוכננת
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 font-bold text-amber-900">
                    <PauseCircle className="h-5 w-5" />
                    מנוחות מובנות
                  </span>
                </div>
              </div>

              <div className="relative mt-4 space-y-4 before:absolute before:bottom-3 before:right-5 before:top-3 before:w-px before:bg-slate-300">
                {(day.activities ?? []).map((activity) => (
                  <div key={`${day.day}-${activity.period}-${activity.place}`} className="relative pr-12">
                    <span className="absolute right-2 top-5 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <ActivityCard activity={activity} />
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 md:col-span-2">
                  <h3 className="flex items-center gap-2 font-bold text-orange-950">
                    <Bike className="h-5 w-5" />
                    רכיבה, דרך וקושי
                  </h3>
                  <p className="mt-2 leading-7 text-orange-950">
                    {day.ridingSummary ?? "לא הוגדר סיכום רכיבה ליום הזה."}
                  </p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {(day.scenicHighlights ?? []).map((highlight) => (
                      <span key={highlight} className="rounded-md bg-white px-3 py-2 font-semibold text-orange-950">
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    {(day.riderTips ?? []).map((tip) => (
                      <span key={tip} className="rounded-md bg-orange-100 px-3 py-2 text-sm font-bold text-orange-950">
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 md:col-span-2">
                  <h3 className="flex items-center gap-2 font-bold text-sky-950">
                    <Accessibility className="h-5 w-5" />
                    נגישות ליום הזה
                  </h3>
                  <p className="mt-2 leading-7 text-sky-900">
                    {day.accessibilitySummary ?? "לא הוגדר סיכום נגישות ליום הזה."}
                  </p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {(day.restBreaks ?? []).map((restBreak) => (
                      <span key={restBreak} className="rounded-md bg-white px-3 py-2 font-semibold text-sky-900">
                        {restBreak}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <h3 className="flex items-center gap-2 font-bold text-slate-950">
                    <Utensils className="h-5 w-5 text-emerald-700" />
                    מסעדות ליום הזה
                  </h3>
                  <div className="mt-3 grid gap-3">
                    {(day.restaurants ?? []).map((restaurant) => (
                      <div key={restaurant.name} className="rounded-md bg-slate-50 p-3">
                        <div className="flex justify-between gap-3">
                          <span className="font-bold">{restaurant.name}</span>
                          <Rating value={restaurant.rating} />
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{restaurant.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h3 className="font-bold text-amber-950">תקציב והתאמה</h3>
                  <p className="mt-2 leading-7 text-amber-900">
                    {day.budgetTip ?? "טיפ תקציב יוצג לאחר יצירת מסלול חדש."}
                  </p>
                  <p className="mt-3 rounded-md bg-white/70 px-3 py-2 text-sm font-medium leading-6 text-amber-950">
                    {day.travelerFit ?? "התאמת היום לפרופיל תופיע במסלול חדש."}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
          <button
            type="button"
            onClick={() => setIsLargeText((current) => !current)}
            className="w-full rounded-md border border-slate-300 bg-white px-5 py-3 text-base font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            {isLargeText ? "הקטנת טקסט" : "הגדלת טקסט"}
          </button>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
              <Map className="h-5 w-5 text-emerald-700" />
              תקציב משוער
            </h2>
            <p className="mt-3 text-2xl font-bold text-slate-950">
              {itinerary.estimatedTotalCost ?? "לא ידוע"}
            </p>
          </div>

          <div className="rounded-lg border border-orange-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-950">
              <Bike className="h-5 w-5 text-orange-700" />
              ציוד ובטיחות
            </h2>
            <div className="space-y-3">
              {(itinerary.equipmentRecommendations ?? []).map((item) => (
                <p key={item} className="rounded-md bg-orange-50 px-3 py-2 text-sm font-semibold leading-6 text-orange-950">
                  {item}
                </p>
              ))}
              {(itinerary.safetyNotes ?? []).map((note) => (
                <p key={note} className="rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-800">
                  {note}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-950">
              <Hotel className="h-5 w-5 text-emerald-700" />
              מלונות
            </h2>
            <div className="space-y-4">
              {hotelRecommendations.map((hotel) => (
                <RecommendationCard key={hotel.name} item={hotel} />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-950">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              כשרות וחב״ד
            </h2>
            <div className="space-y-4">
              {kosherAndChabad.map((item) => (
                <RecommendationCard key={`${item.name}-${item.area}`} item={item} />
              ))}
            </div>
          </div>

          <Link
            href="/questionnaire"
            className="flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
          >
            <BedDouble className="h-5 w-5" />
            התאמת מסלול מחדש
          </Link>
        </aside>
      </section>
    </main>
  );
}
