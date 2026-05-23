"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Accessibility,
  Bike,
  Clock3,
  Compass,
  Fuel,
  Heart,
  Loader2,
  MapPin,
  Mountain,
  Plane,
  Route,
  Sparkles,
  Utensils,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { ItineraryResponse, TravelFormData } from "@/lib/itinerary-types";
import {
  activityIntensityOptions,
  budgetRangeOptions,
  dayPreferenceOptions,
  dietaryOptions,
  interestOptions,
  kosherLevelOptions,
  mobilityOptions,
  paceOptions,
  ridingExperienceOptions,
  ridingStyleOptions,
  routeDifficultyOptions,
  routePriorityOptions,
  shabbatOptions,
  transportationOptions,
  travelModeOptions,
  travelStyleOptions,
  travelerOptions,
  walkingDifficultyOptions,
  cyclingTypeOptions,
} from "@/lib/travel-options";

const inputClass =
  "mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100";

const resultStorageKey = "ai-travel-planner:last-itinerary";

function formToPayload(form: HTMLFormElement): TravelFormData {
  const data = new FormData(form);

  return {
    destination: String(data.get("destination") ?? ""),
    days: Number(data.get("days") ?? 4),
    travelers: String(data.get("travelers") ?? "couple") as TravelFormData["travelers"],
    travelMode: String(data.get("travelMode") ?? "regular") as TravelFormData["travelMode"],
    ridingExperience: String(
      data.get("ridingExperience") ?? "intermediate",
    ) as TravelFormData["ridingExperience"],
    preferredDailyRidingDistance: Number(data.get("preferredDailyRidingDistance") ?? 80),
    routeDifficulty: String(
      data.get("routeDifficulty") ?? "moderate",
    ) as TravelFormData["routeDifficulty"],
    routePriority: String(data.get("routePriority") ?? "scenic") as TravelFormData["routePriority"],
    ridingStyle: String(data.get("ridingStyle") ?? "relaxed") as TravelFormData["ridingStyle"],
    needRentalOptions: data.get("needRentalOptions") === "on",
    needGearRecommendations: data.get("needGearRecommendations") === "on",
    offRoadPreference: data.get("offRoadPreference") === "on",
    groupRidingSupport: data.get("groupRidingSupport") === "on",
    cyclingType: String(data.get("cyclingType") ?? "city") as TravelFormData["cyclingType"],
    ages: String(data.get("ages") ?? ""),
    familyStatus: String(data.get("familyStatus") ?? ""),
    kidsAges: String(data.get("kidsAges") ?? ""),
    dietaryPreference: String(
      data.get("dietaryPreference") ?? "none",
    ) as TravelFormData["dietaryPreference"],
    kosherLevel: String(data.get("kosherLevel") ?? "not_needed") as TravelFormData["kosherLevel"],
    keepShabbat: String(data.get("keepShabbat") ?? "no") as TravelFormData["keepShabbat"],
    travelStyle: String(data.get("travelStyle") ?? "classic") as TravelFormData["travelStyle"],
    budgetRange: String(data.get("budgetRange") ?? "moderate") as TravelFormData["budgetRange"],
    mobilityLevel: String(data.get("mobilityLevel") ?? "full") as TravelFormData["mobilityLevel"],
    maxWalkingTimePerDay: Number(data.get("maxWalkingTimePerDay") ?? 90),
    needElevatorAccess: data.get("needElevatorAccess") === "on",
    needWheelchairAccessibleTransportation:
      data.get("needWheelchairAccessibleTransportation") === "on",
    avoidStairs: data.get("avoidStairs") === "on",
    needFrequentRestBreaks: data.get("needFrequentRestBreaks") === "on",
    accessibleBathroomRequired: data.get("accessibleBathroomRequired") === "on",
    walkingDifficulty: String(
      data.get("walkingDifficulty") ?? "none",
    ) as TravelFormData["walkingDifficulty"],
    preferredActivityIntensity: String(
      data.get("preferredActivityIntensity") ?? "moderate",
    ) as TravelFormData["preferredActivityIntensity"],
    preferredTransportation: String(
      data.get("preferredTransportation") ?? "public_transport",
    ) as TravelFormData["preferredTransportation"],
    pace: String(data.get("pace") ?? "balanced") as TravelFormData["pace"],
    dayPreference: String(data.get("dayPreference") ?? "balanced") as TravelFormData["dayPreference"],
    accessibilityNeeds: String(data.get("accessibilityNeeds") ?? ""),
    interests: data.getAll("interests").map(String) as TravelFormData["interests"],
  };
}

export default function QuestionnairePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formToPayload(event.currentTarget)),
      });

      const data = (await response.json()) as ItineraryResponse | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data && data.error ? data.error : "לא הצלחנו ליצור מסלול כרגע.",
        );
      }

      if (!("itinerary" in data)) {
        throw new Error(data.error ?? "לא הצלחנו ליצור מסלול כרגע.");
      }

      sessionStorage.setItem(resultStorageKey, JSON.stringify(data));
      router.push("/results");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "לא הצלחנו ליצור מסלול כרגע.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main>
        <section className="border-b border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#134e4a_52%,#f8fafc_52%,#f8fafc_100%)]">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 text-white md:grid-cols-[0.9fr_1.1fr] md:py-14">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                פרופיל נסיעה חכם
              </div>
              <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
                מסלול שמבין מי נוסע, לא רק לאן
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-8 text-emerald-50">
                כשרות, שבת, ילדים, ירח דבש, תרמילאות או יוקרה - השאלון בונה
                פרופיל מלא כדי ליצור תוכנית יומית ריאלית ומותאמת.
              </p>
            </div>

            <div className="rounded-lg border border-white/20 bg-white p-5 text-slate-950 shadow-xl md:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {[ 
                  [Utensils, "כשרות ותזונה"],
                  [Heart, "ירח דבש ומשפחות"],
                  [Plane, "תחבורה ומעברים"],
                  [Accessibility, "ניידות ונגישות"],
                  [Bike, "אופנועים ואופניים"],
                ].map(([Icon, label]) => (
                  <div
                    key={label as string}
                    className="flex items-center gap-3 rounded-md bg-slate-50 p-4"
                  >
                    <Icon className="h-5 w-5 text-emerald-700" />
                    <span className="font-semibold">{label as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-10">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-8"
          >
            <div className="mb-8 flex items-start gap-3">
              <span className="rounded-md bg-emerald-100 p-3 text-emerald-800">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">בסיס הטיול</h2>
                <p className="mt-1 text-slate-600">
                  פרטים שעוזרים לבנות זרימה יומית, אזורי לינה ומעברים.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <label className="block font-semibold text-slate-800 md:col-span-2">
                יעד
                <input
                  className={inputClass}
                  name="destination"
                  type="text"
                  placeholder="למשל: תאילנד, רומא, ניו יורק"
                  required
                  disabled={isLoading}
                />
              </label>
              <label className="block font-semibold text-slate-800">
                מספר ימים
                <input
                  className={inputClass}
                  name="days"
                  type="number"
                  min="1"
                  max="21"
                  defaultValue="7"
                  required
                  disabled={isLoading}
                />
              </label>
              <label className="block font-semibold text-slate-800">
                הרכב מטיילים
                <select className={inputClass} name="travelers" defaultValue="couple" disabled={isLoading}>
                  {travelerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block font-semibold text-slate-800">
                גילאים
                <input className={inputClass} name="ages" type="text" placeholder="למשל: 34, 32" disabled={isLoading} />
              </label>
              <label className="block font-semibold text-slate-800">
                גילאי ילדים
                <input className={inputClass} name="kidsAges" type="text" placeholder="למשל: 4, 8, 12" disabled={isLoading} />
              </label>
              <label className="block font-semibold text-slate-800">
                סטטוס משפחתי
                <input className={inputClass} name="familyStatus" type="text" placeholder="למשל: ירח דבש / משפחה עם ילדים" disabled={isLoading} />
              </label>
              <label className="block font-semibold text-slate-800">
                סגנון טיול
                <select className={inputClass} name="travelStyle" defaultValue="classic" disabled={isLoading}>
                  {travelStyleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block font-semibold text-slate-800">
                טווח תקציב
                <select className={inputClass} name="budgetRange" defaultValue="moderate" disabled={isLoading}>
                  {budgetRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <section className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="mb-5 flex items-center gap-3">
                <span className="rounded-md bg-orange-100 p-2 text-orange-800">
                  <Bike className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-950">אופנועים, אופניים ו-E-bike</h2>
                  <p className="mt-1 text-slate-600">
                    מתאים לרכיבות נופיות, טיולי כביש, MTB, רכיבה משפחתית ועצירות טעינה/דלק.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <label className="block font-semibold text-slate-800">
                  מצב טיול
                  <select className={inputClass} name="travelMode" defaultValue="regular" disabled={isLoading}>
                    {travelModeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block font-semibold text-slate-800">
                  ניסיון רכיבה
                  <select className={inputClass} name="ridingExperience" defaultValue="intermediate" disabled={isLoading}>
                    {ridingExperienceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block font-semibold text-slate-800">
                  מרחק רכיבה יומי מועדף
                  <input
                    className={inputClass}
                    name="preferredDailyRidingDistance"
                    type="number"
                    min="5"
                    max="500"
                    defaultValue="80"
                    disabled={isLoading}
                  />
                </label>
                <label className="block font-semibold text-slate-800">
                  רמת קושי
                  <select className={inputClass} name="routeDifficulty" defaultValue="moderate" disabled={isLoading}>
                    {routeDifficultyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block font-semibold text-slate-800">
                  נופי או מהיר
                  <select className={inputClass} name="routePriority" defaultValue="scenic" disabled={isLoading}>
                    {routePriorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block font-semibold text-slate-800">
                  סגנון רכיבה
                  <select className={inputClass} name="ridingStyle" defaultValue="relaxed" disabled={isLoading}>
                    {ridingStyleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block font-semibold text-slate-800">
                  סוג רכיבת אופניים
                  <select className={inputClass} name="cyclingType" defaultValue="city" disabled={isLoading}>
                    {cyclingTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {[
                  ["needRentalOptions", "צריך אפשרויות השכרה"],
                  ["needGearRecommendations", "צריך המלצות ציוד"],
                  ["offRoadPreference", "רוצה אפשרות שטח / off-road"],
                  ["groupRidingSupport", "צריך תמיכה ברכיבה קבוצתית"],
                ].map(([name, label]) => (
                  <label key={name} className="flex items-center gap-3 rounded-md bg-white px-4 py-3 font-semibold text-slate-800">
                    <input
                      name={name}
                      type="checkbox"
                      className="h-5 w-5 accent-orange-600"
                      disabled={isLoading}
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {[
                  [Route, "מסלולים נופיים"],
                  [Fuel, "דלק / טעינה / מים"],
                  [Mountain, "עליות ושטח"],
                ].map(([Icon, label]) => (
                  <div key={label as string} className="flex items-center gap-3 rounded-md bg-white p-4 text-slate-800">
                    <Icon className="h-5 w-5 text-orange-700" />
                    <span className="font-bold">{label as string}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded-md bg-sky-100 p-2 text-sky-800">
                    <Compass className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-bold text-slate-950">קצב, תחבורה ונגישות</h2>
                </div>
                <div className="grid gap-5">
                  <label className="block font-semibold text-slate-800">
                    קצב הטיול
                    <select className={inputClass} name="pace" defaultValue="balanced" disabled={isLoading}>
                      {paceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block font-semibold text-slate-800">
                    בוקר או לילה
                    <select className={inputClass} name="dayPreference" defaultValue="balanced" disabled={isLoading}>
                      {dayPreferenceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block font-semibold text-slate-800">
                    תחבורה מועדפת
                    <select className={inputClass} name="preferredTransportation" defaultValue="public_transport" disabled={isLoading}>
                      {transportationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block font-semibold text-slate-800">
                    רמת ניידות
                    <select className={inputClass} name="mobilityLevel" defaultValue="full" disabled={isLoading}>
                      {mobilityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block font-semibold text-slate-800">
                    זמן הליכה מקסימלי ביום
                    <input
                      className={inputClass}
                      name="maxWalkingTimePerDay"
                      type="number"
                      min="0"
                      max="240"
                      defaultValue="90"
                      disabled={isLoading}
                    />
                  </label>
                  <label className="block font-semibold text-slate-800">
                    רמת קושי בהליכה
                    <select className={inputClass} name="walkingDifficulty" defaultValue="none" disabled={isLoading}>
                      {walkingDifficultyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block font-semibold text-slate-800">
                    עוצמת פעילות מועדפת
                    <select className={inputClass} name="preferredActivityIntensity" defaultValue="moderate" disabled={isLoading}>
                      {activityIntensityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block font-semibold text-slate-800">
                    צרכי נגישות
                    <textarea
                      className={`${inputClass} min-h-28 resize-y`}
                      name="accessibilityNeeds"
                      placeholder="למשל: להימנע ממדרגות, עגלה, זמני מנוחה"
                      disabled={isLoading}
                    />
                  </label>
                  <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    {[
                      ["needElevatorAccess", "צריך גישה למעלית"],
                      [
                        "needWheelchairAccessibleTransportation",
                        "צריך תחבורה נגישה לכיסא גלגלים",
                      ],
                      ["avoidStairs", "להימנע ממדרגות"],
                      ["needFrequentRestBreaks", "צריך עצירות מנוחה תכופות"],
                      ["accessibleBathroomRequired", "צריך שירותים נגישים"],
                    ].map(([name, label]) => (
                      <label key={name} className="flex items-center gap-3 text-base font-semibold text-slate-800">
                        <input
                          name={name}
                          type="checkbox"
                          className="h-5 w-5 accent-emerald-600"
                          disabled={isLoading}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded-md bg-amber-100 p-2 text-amber-800">
                    <Clock3 className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-bold text-slate-950">כשרות, שבת ואוכל</h2>
                </div>
                <div className="grid gap-5">
                  <label className="block font-semibold text-slate-800">
                    העדפות תזונה
                    <select className={inputClass} name="dietaryPreference" defaultValue="none" disabled={isLoading}>
                      {dietaryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block font-semibold text-slate-800">
                    רמת כשרות
                    <select className={inputClass} name="kosherLevel" defaultValue="not_needed" disabled={isLoading}>
                      {kosherLevelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block font-semibold text-slate-800">
                    שומרים שבת
                    <select className={inputClass} name="keepShabbat" defaultValue="no" disabled={isLoading}>
                      {shabbatOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>
            </div>

            <fieldset className="mt-10" disabled={isLoading}>
              <legend className="text-xl font-bold text-slate-950">תחומי עניין מפורטים</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {interestOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-slate-200 px-4 py-3 text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <input
                      name="interests"
                      type="checkbox"
                      value={option.value}
                      className="h-4 w-4 accent-emerald-600"
                      defaultChecked={["beaches", "local_markets", "photography_spots"].includes(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            {error ? (
              <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                {error}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                בגרסת פיתוח ללא מפתח OpenAI, המערכת תחזיר מסלול דמה עשיר.
              </p>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-7 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                {isLoading ? "יוצרים מסלול אישי..." : "צרו מסלול חכם"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
