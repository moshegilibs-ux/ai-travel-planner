"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import {
  Accessibility,
  CalendarDays,
  Clock,
  Download,
  ExternalLink,
  FolderOpen,
  Heart,
  Info,
  Loader2,
  MapPin,
  Plane,
  RefreshCw,
  Route,
  Save,
  Sparkles,
  Trash2,
  Utensils,
  Wallet,
} from "lucide-react";
import {
  CustomItineraryInput,
  CustomItineraryDay,
  ItineraryPlace,
  MultiDestinationTripPlan,
  ReplacementPreference,
  TravelerPreferences,
  TripType,
} from "@/lib/generate-itinerary";
import { FlightsSection } from "@/components/flights-section";
import { HotelsSection } from "@/components/hotels-section";
import type { HotelDeal } from "@/types/travel-marketplace";
import { AccessibilityConfidence } from "@/components/accessibility-confidence";
import {
  calculateAccessibilityScore,
  type ProfileType,
} from "@/lib/accessibility-score";
import {
  deriveScoreProfileTypes,
  loadAccessibilityProfile,
  type AccessibilityOnboardingProfile,
} from "@/lib/accessibility-profile";
import { generateItinerary } from "@/services/api/itinerary";
import { getPlaces, replacePlace } from "@/services/api/places";
import type { FlightDeal } from "@/services/api/flights";
import { getCurrentUser, subscribeAuthState } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { firebaseSetupMessage, isFirebaseConfigured } from "@/lib/firebase";
import {
  deleteUserItinerary,
  getUserItineraries,
  saveUserItinerary,
} from "@/lib/db";
import {
  SavedItinerary,
  createSavedItinerary,
  getSavedItineraries,
  removeSavedItinerary,
  saveItineraries,
} from "@/lib/saved-itineraries";
import { readMyTrip, writeMyTrip } from "@/lib/my-trip";
import { VoiceInputButton } from "@/components/voice-input-button";
import { getUiTranslations } from "@/lib/ui-translations";

const tripTypes: TripType[] = [
  "רומנטי",
  "משפחתי",
  "בטן גב",
  "שופינג",
  "טבע והרפתקאות",
  "תקציב נמוך",
];

const fieldClass =
  "mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100";

const preferenceButtonClass =
  "rounded-full border border-slate-200 px-3 py-2 text-sm font-bold transition hover:border-emerald-300 hover:bg-emerald-50";

const replacementOptions: Array<[ReplacementPreference, string]> = [
  ["cheaper", "יותר זול"],
  ["local", "פחות תיירותי"],
  ["nature", "יותר טבע"],
  ["kids", "יותר מתאים לילדים"],
  ["food", "יותר אוכל מקומי"],
];

type AccessibilitySelections = {
  wheelchairUser: boolean;
  limitedWalking: boolean;
  stepFreeHotels: boolean;
  accessibleTransport: boolean;
  relaxedPace: boolean;
};

/**
 * Synthesizes transportation tips, accessibility notes and rest-break guidance
 * from the traveler's accessibility selections so every day — for any
 * destination — shows usable, honest planning guidance. Accessibility is never
 * asserted as verified: each note set ends with the unverified caveat.
 */
function dayPlanningGuidance(a: AccessibilitySelections, isHebrew: boolean) {
  const transportation: string[] = [];
  const notes: string[] = [];
  const restBreaks: string[] = [];

  if (a.accessibleTransport || a.wheelchairUser) {
    transportation.push(
      isHebrew
        ? "העדיפו מונית נגישה או רכב פרטי דלת-לדלת לקטעים הארוכים."
        : "Prefer an accessible taxi or door-to-door private car for longer legs.",
    );
  } else {
    transportation.push(
      isHebrew
        ? "תחבורה ציבורית מקומית למרחקים קצרים, מונית לקטעים הארוכים."
        : "Local public transport for short hops, a taxi for longer legs.",
    );
  }
  if (a.limitedWalking) {
    transportation.push(
      isHebrew
        ? "תכננו ירידה/איסוף קרוב ככל האפשר לכל אטרקציה."
        : "Plan drop-off/pick-up as close to each attraction as possible.",
    );
  }

  if (a.wheelchairUser) {
    notes.push(
      isHebrew
        ? "בדקו כניסה ללא מדרגות, מעלית ושירותים נגישים בכל אתר."
        : "Check step-free entrance, elevator and accessible restrooms at each site.",
    );
  }
  if (a.stepFreeHotels) {
    notes.push(
      isHebrew
        ? "ודאו מלון עם כניסה ללא מדרגות ומעלית."
        : "Confirm a hotel with a step-free entrance and an elevator.",
    );
  }
  if (a.limitedWalking) {
    notes.push(
      isHebrew
        ? "שמרו על מרחקי הליכה קצרים והעדיפו אזורים מרוכזים."
        : "Keep walking distances short and favor compact areas.",
    );
  }
  notes.push(
    isHebrew
      ? "נגישות לא מאומתת — מומלץ לבדוק מול המקום."
      : "Accessibility not verified — we recommend checking with the venue.",
  );

  const higherSupport = a.relaxedPace || a.limitedWalking || a.wheelchairUser;
  if (higherSupport) {
    restBreaks.push(
      isHebrew
        ? "שלבו 2–3 הפסקות מנוחה ביום, כל 60–90 דקות, עם ישיבה מוצלת."
        : "Build in 2–3 rest breaks per day, every 60–90 minutes, with shaded seating.",
    );
    restBreaks.push(
      isHebrew
        ? "ודאו נקודת מנוחה ושירותים נגישים ליד כל אטרקציה מרכזית."
        : "Ensure a rest point and accessible restrooms near each main attraction.",
    );
  } else {
    restBreaks.push(
      isHebrew
        ? "הפסקת צהריים ארוכה ומנוחה קצרה אחר הצהריים."
        : "One longer lunch break and a short afternoon rest.",
    );
  }

  return { transportation, notes, restBreaks };
}

export function CustomItinerarySection() {
  const locale = useLocale();
  const ui = getUiTranslations(locale).results;
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState("");
  const [tripType, setTripType] = useState<TripType>("רומנטי");
  const [environment, setEnvironment] =
    useState<TravelerPreferences["environment"]>("משולב");
  const [pace, setPace] = useState<TravelerPreferences["pace"]>("רגוע");
  const [budgetStyle, setBudgetStyle] =
    useState<TravelerPreferences["budgetStyle"]>("מאוזן");
  const [interests, setInterests] = useState<TravelerPreferences["interests"]>([
    "תרבות",
    "אוכל",
  ]);
  const [accessibility, setAccessibility] = useState({
    wheelchairUser: false,
    limitedWalking: false,
    stepFreeHotels: false,
    accessibleTransport: false,
    relaxedPace: false,
  });
  const dayGuidance = dayPlanningGuidance(accessibility, locale !== "en");
  // Derive default trip dates so the flight/hotel search can be prefilled.
  // The planner captures a day count, not calendar dates, so we default the
  // departure ~5 weeks out and the return to departure + the trip length.
  const tripDepartureDate = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 35);
    return date.toISOString().slice(0, 10);
  })();
  const tripReturnDate = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 35 + Math.max(1, days));
    return date.toISOString().slice(0, 10);
  })();
  const [expandedPlaceId, setExpandedPlaceId] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightDeal | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelDeal | null>(null);
  // Saved onboarding profile, loaded after mount (localStorage) to keep the
  // accessibility confidence panel SSR-stable / hydration-safe.
  const [savedA11yProfile, setSavedA11yProfile] =
    useState<AccessibilityOnboardingProfile | null>(null);
  useEffect(() => {
    setSavedA11yProfile(loadAccessibilityProfile());
  }, []);
  // Accessibility confidence: derive the traveler's profile types (from the
  // saved onboarding profile + the planner's accessibility toggles) and score
  // against the available verified facts. With no provider connected yet the
  // facts are empty, so the panel honestly shows the unverified state.
  const accessibilityScoreTypes = (() => {
    const set = new Set<ProfileType>();
    if (savedA11yProfile) {
      for (const t of deriveScoreProfileTypes(savedA11yProfile)) set.add(t);
    }
    if (accessibility.wheelchairUser) set.add("wheelchair");
    if (accessibility.limitedWalking) set.add("walker");
    if (accessibility.relaxedPace) set.add("elderly");
    return Array.from(set);
  })();
  const accessibilityResult = accessibilityScoreTypes.length
    ? calculateAccessibilityScore({ types: accessibilityScoreTypes }, [])
    : null;
  const [selectedRouteOptionId, setSelectedRouteOptionId] = useState("classic");
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<CustomItineraryDay[]>([]);
  const [currentInput, setCurrentInput] = useState<CustomItineraryInput | null>(
    null,
  );
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() =>
    getCurrentUser(),
  );

  function toggleInterest(interest: TravelerPreferences["interests"][number]) {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  }

  useEffect(() => {
    return subscribeAuthState(setCurrentUser);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (currentUser) {
        getUserItineraries(currentUser).then(setSavedItineraries);
        return;
      }

      setSavedItineraries(getSavedItineraries());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [currentUser]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!destination.trim() || !budget.trim() || days < 1) {
      setError("יש למלא יעד, מספר ימים תקין ותקציב לפני יצירת מסלול.");
      setItinerary([]);
      return;
    }

    setError("");
    setSaveMessage("");
    setIsLoading(true);

    window.setTimeout(async () => {
      const hasAccessibilityNeeds = Object.values(accessibility).some(Boolean);
      const routeOptionId =
        hasAccessibilityNeeds && selectedRouteOptionId === "classic"
          ? "accessible-relaxed"
          : selectedRouteOptionId;
      setSelectedRouteOptionId(routeOptionId);
      const input = {
        destination: destination.trim(),
        days,
        budget: budget.trim(),
        tripType,
        locale,
        routeOptionId,
        selectedFlight,
        preferences: {
          environment,
          pace,
          budgetStyle,
          interests,
          accessibility,
        },
      };
      const result = await generateItinerary({
        ...input,
      });

      setCurrentInput(input);
      setItinerary(result.itinerary);
      if (result.warning) {
        setSaveMessage(result.warning);
      }
      setIsLoading(false);
    }, 550);
  }

  async function handleSelectRouteOption(routeOptionId: string) {
    setSelectedRouteOptionId(routeOptionId);

    if (!currentInput) return;

    const nextInput = {
      ...currentInput,
      routeOptionId,
      preferences: {
        environment: currentInput.preferences?.environment ?? environment,
        pace: currentInput.preferences?.pace ?? pace,
        budgetStyle: currentInput.preferences?.budgetStyle ?? budgetStyle,
        interests: currentInput.preferences?.interests ?? interests,
        accessibility,
      },
    };
    const result = await generateItinerary(nextInput);
    setCurrentInput(nextInput);
    setItinerary(result.itinerary);
  }

  async function handleSaveItinerary() {
    if (!currentInput || itinerary.length === 0) {
      return;
    }

    const savedItinerary = createSavedItinerary(currentInput, itinerary, selectedHotel);

    if (savedItineraries.some((item) => item.id === savedItinerary.id)) {
      setSaveMessage("המסלול הזה כבר נשמר.");
      return;
    }

    const nextSavedItineraries = currentUser
      ? await saveUserItinerary(currentUser, savedItinerary)
      : [savedItinerary, ...savedItineraries];

    if (!currentUser) {
      saveItineraries(nextSavedItineraries);
    }
    writeMyTrip({ ...readMyTrip(), itinerary });

    setSavedItineraries(nextSavedItineraries);
    setSaveMessage(
      currentUser && isFirebaseConfigured()
        ? "המסלול נשמר לחשבון שלך בענן."
        : currentUser
          ? `${firebaseSetupMessage}. המסלול נשמר מקומית לפי המשתמש.`
        : "המסלול נשמר בדפדפן המקומי.",
    );
  }

  function handleOpenSavedItinerary(savedItinerary: SavedItinerary) {
    setDestination(savedItinerary.destination);
    setDays(savedItinerary.days);
    setBudget(savedItinerary.budget);
    setTripType(savedItinerary.tripType);
    setEnvironment(savedItinerary.preferences?.environment ?? "משולב");
    setPace(savedItinerary.preferences?.pace ?? "רגוע");
    setBudgetStyle(savedItinerary.preferences?.budgetStyle ?? "מאוזן");
    setInterests(savedItinerary.preferences?.interests ?? ["תרבות", "אוכל"]);
    setSelectedFlight(savedItinerary.selectedFlight ?? null);
    setSelectedHotel(savedItinerary.selectedHotel ?? null);
    setCurrentInput({
      destination: savedItinerary.destination,
      days: savedItinerary.days,
      budget: savedItinerary.budget,
      tripType: savedItinerary.tripType,
      preferences: savedItinerary.preferences,
      selectedFlight: savedItinerary.selectedFlight,
    });
    setItinerary(savedItinerary.itinerary);
    setError("");
    setSaveMessage("המסלול השמור נפתח.");
  }

  async function handleDeleteSavedItinerary(id: string) {
    const nextSavedItineraries = currentUser
      ? await deleteUserItinerary(currentUser, id)
      : removeSavedItinerary(id);

    setSavedItineraries(nextSavedItineraries);
    setSaveMessage("המסלול נמחק מהרשימה.");
  }

  async function handleExportPdf() {
    if (!currentInput || itinerary.length === 0) {
      return;
    }

    const { exportItineraryPdf } = await import("@/lib/export-itinerary-pdf");
    exportItineraryPdf(currentInput, itinerary);
  }

  function handleReplacePlace(
    dayNumber: number,
    placeId: string,
    preference: ReplacementPreference,
  ) {
    if (!currentInput) return;

    const targetPlace = itinerary
      .find((day) => day.day === dayNumber)
      ?.places.find((place) => place.id === placeId);

    if (!targetPlace) return;

    setItinerary((current) =>
      current.map((day) =>
        day.day !== dayNumber
          ? day
          : {
              ...day,
              places: day.places.map((place) =>
                place.id === placeId
                  ? { ...place, whyRecommended: "מחפש חלופה מתאימה..." }
                  : place,
              ),
            },
      ),
    );

    void replacePlace({
      place: targetPlace,
      input: currentInput,
      preference,
    }).then((nextPlace) => {
      setItinerary((current) =>
        current.map((day) =>
          day.day !== dayNumber
            ? day
            : {
                ...day,
                places: day.places.map((place) =>
                  place.id === placeId ? nextPlace : place,
                ),
              },
        ),
      );
    });
    setSaveMessage("המקום הוחלף והמסלול עודכן בזמן אמת.");
  }

  function handleSavePlace(place: ItineraryPlace) {
    const raw = window.localStorage.getItem("saved-itinerary-places") || "[]";
    const savedPlaces = JSON.parse(raw) as ItineraryPlace[];
    const nextPlaces = savedPlaces.some((item) => item.id === place.id)
      ? savedPlaces
      : [place, ...savedPlaces].slice(0, 30);

    window.localStorage.setItem("saved-itinerary-places", JSON.stringify(nextPlaces));
    writeMyTrip({
      ...readMyTrip(),
      attractions: nextPlaces.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.shortDescription,
      })),
    });
    setSaveMessage(`המקום "${place.name}" נשמר לרשימת המקומות.`);
  }

  return (
    <section className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="mb-8 grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
              <Sparkles className="h-4 w-4" />
              מסלול מיידי לפי הבחירות שלך
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
              צור לי מסלול אישי
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              בחרו יעד, מספר ימים, תקציב וסוג טיול, וקבלו מסלול יומי מסודר
              עם בוקר, צהריים, ערב, אטרקציות, מסעדה וטיפ לכל יום.
            </p>
          </div>

          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm leading-7 text-emerald-950">
            המסלול כולל פירוט לפי שעות, תמונות, דירוגים, עלויות משוערות
            והחלפת המלצות בזמן אמת לפי הטעם שלכם.
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm md:p-6"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="font-semibold text-slate-800">
              יעד
              <span className="relative block">
                <input
                  className={`${fieldClass} pl-12`}
                  disabled={isLoading}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="למשל תאילנד"
                  type="text"
                  value={destination}
                />
                <VoiceInputButton onTranscript={setDestination} />
              </span>
            </label>

            <label className="font-semibold text-slate-800">
              מספר ימים
              <input
                className={fieldClass}
                disabled={isLoading}
                min="1"
                max="21"
                onChange={(event) => setDays(Number(event.target.value))}
                type="number"
                value={days}
              />
            </label>

            <label className="font-semibold text-slate-800">
              תקציב
              <span className="relative block">
                <input
                  className={`${fieldClass} pl-12`}
                  disabled={isLoading}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="למשל $150 ליום"
                  type="text"
                  value={budget}
                />
                <VoiceInputButton onTranscript={setBudget} />
              </span>
            </label>

            <label className="font-semibold text-slate-800">
              סוג טיול
              <select
                className={fieldClass}
                disabled={isLoading}
                onChange={(event) => setTripType(event.target.value as TripType)}
                value={tripType}
              >
                {tripTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-950">העדפות אישיות</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="font-semibold text-slate-800">
                טבע / עיר
                <select
                  className={fieldClass}
                  disabled={isLoading}
                  onChange={(event) =>
                    setEnvironment(event.target.value as TravelerPreferences["environment"])
                  }
                  value={environment}
                >
                  {["משולב", "טבע", "עיר"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="font-semibold text-slate-800">
                קצב
                <select
                  className={fieldClass}
                  disabled={isLoading}
                  onChange={(event) =>
                    setPace(event.target.value as TravelerPreferences["pace"])
                  }
                  value={pace}
                >
                  {["רגוע", "מאוזן", "עמוס"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="font-semibold text-slate-800">
                סגנון תקציב
                <select
                  className={fieldClass}
                  disabled={isLoading}
                  onChange={(event) =>
                    setBudgetStyle(
                      event.target.value as TravelerPreferences["budgetStyle"],
                    )
                  }
                  value={budgetStyle}
                >
                  {["חסכוני", "מאוזן", "יוקרתי"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["אוכל", "תרבות", "חיי לילה", "טבע", "ילדים"] as const).map(
                (interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`${preferenceButtonClass} ${
                      interests.includes(interest)
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : "bg-white text-slate-700"
                    }`}
                  >
                    {interest}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-sky-100 bg-white p-4">
            <h3 className="font-bold text-slate-950">{ui.accessibilityNeeds}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              {[
                ["wheelchairUser", ui.accessibilityOptions.wheelchairUser],
                ["limitedWalking", ui.accessibilityOptions.limitedWalking],
                ["stepFreeHotels", ui.accessibilityOptions.stepFreeHotels],
                ["accessibleTransport", ui.accessibilityOptions.accessibleTransport],
                ["relaxedPace", ui.accessibilityOptions.relaxedPace],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex min-h-12 items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
                >
                  <input
                    checked={accessibility[key as keyof typeof accessibility]}
                    disabled={isLoading}
                    onChange={(event) =>
                      setAccessibility((current) => ({
                        ...current,
                        [key]: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400 md:w-auto"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Route className="h-5 w-5" />
            )}
            {isLoading ? "יוצר מסלול..." : "צור מסלול"}
          </button>
        </form>

        <FlightsSection
          selectedFlight={selectedFlight}
          destination={destination}
          departureDate={tripDepartureDate}
          returnDate={tripReturnDate}
          onSelectFlight={async (flight) => {
            setSelectedFlight(flight);
            if (currentInput) {
              const nextInput = { ...currentInput, selectedFlight: flight };
              const result = await generateItinerary(nextInput);
              setCurrentInput(nextInput);
              setItinerary(result.itinerary);
            }
            setSaveMessage(
              `הטיסה ${flight.airline} ${flight.flightNumber} נוספה למסלול ועודכנו הערות היום הראשון והאחרון.`,
            );
          }}
        />

        <HotelsSection
          destination={destination}
          checkInDate={tripDepartureDate}
          checkOutDate={tripReturnDate}
          selectedHotel={selectedHotel}
          onSelectHotel={(hotel) => {
            setSelectedHotel(hotel);
            setSaveMessage(`המלון ${hotel.name} נוסף לסיכום הטיול.`);
          }}
        />

        {selectedFlight || selectedHotel ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-xl font-black text-slate-950">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              {ui.tripSummaryTitle}
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
                <p className="text-sm font-bold text-sky-700">
                  {ui.selectedFlightLabel}
                </p>
                {selectedFlight ? (
                  <p className="mt-1 leading-7 text-sky-950">
                    {selectedFlight.airline} {selectedFlight.flightNumber} ·{" "}
                    {selectedFlight.departureTime}-{selectedFlight.arrivalTime} · $
                    {selectedFlight.estimatedPrice}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-sky-900">{ui.noFlightSelected}</p>
                )}
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-700">
                  {ui.selectedHotelLabel}
                </p>
                {selectedHotel ? (
                  <p className="mt-1 leading-7 text-amber-950">
                    {selectedHotel.name} · {selectedHotel.location} ·{" "}
                    {selectedHotel.pricePerNight !== null
                      ? `$${selectedHotel.pricePerNight}/${ui.perNight}`
                      : ui.estimateOnly}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-amber-900">{ui.noHotelSelected}</p>
                )}
              </div>
            </div>
            <p className="mt-4 text-lg font-black text-slate-950">
              {ui.combinedEstimate}: ~$
              {(selectedFlight?.estimatedPrice ?? 0) +
                (selectedHotel?.pricePerNight ?? 0) * Math.max(1, days - 1)}
              <span className="ms-2 align-middle text-xs font-bold text-slate-500">
                {ui.estimateOnly}
              </span>
            </p>
          </div>
        ) : null}

        {accessibilityResult ? (
          <div className="mt-6">
            <AccessibilityConfidence result={accessibilityResult} locale={locale} />
          </div>
        ) : null}

        <div
          id="saved-itineraries"
          className="mt-6 scroll-mt-24 rounded-xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-950">
                המסלולים השמורים שלי
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {currentUser && isFirebaseConfigured()
                  ? `מחובר כ־${currentUser.name}. המסלולים נשמרים בענן.`
                  : currentUser
                    ? `${firebaseSetupMessage}. בינתיים המסלולים נשמרים מקומית לפי המשתמש.`
                    : "שמירה כאורח מתבצעת בדפדפן המקומי עד להתחברות."}
              </p>
            </div>
          </div>

          {savedItineraries.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-slate-600">
              עדיין לא שמרת מסלולים
            </p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {savedItineraries.map((savedItinerary) => (
                <article
                  key={savedItinerary.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h4 className="font-bold text-slate-950">
                        {savedItinerary.destination}
                      </h4>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {savedItinerary.days} ימים · {savedItinerary.budget} ·{" "}
                        {savedItinerary.tripType}
                      </p>
                      {savedItinerary.selectedFlight ? (
                        <p className="mt-1 text-sm font-bold text-sky-700">
                          טיסה: {savedItinerary.selectedFlight.airline}{" "}
                          {savedItinerary.selectedFlight.flightNumber}
                        </p>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                      שמור
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleOpenSavedItinerary(savedItinerary)}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      <FolderOpen className="h-4 w-4" />
                      פתח מסלול
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedItinerary(savedItinerary.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      מחק מסלול
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {itinerary.length > 0 ? (
          <div className="mt-8 grid gap-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-bold text-emerald-950">
                    המסלול שלך מוכן
                  </h3>
                  <p className="mt-1 text-sm text-emerald-900">
                    אפשר לשמור אותו בדפדפן או להוריד כקובץ PDF.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleSaveItinerary}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    <Save className="h-4 w-4" />
                    שמור מסלול
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <Download className="h-4 w-4" />
                    הורד כ־PDF
                  </button>
                </div>
              </div>
              {saveMessage ? (
                <p className="mt-3 rounded-md bg-white px-4 py-3 text-sm font-bold text-emerald-900">
                  {saveMessage}
                </p>
              ) : null}
            </div>

            {itinerary[0]?.tripPlan ? (
              <TripPlanOverview
                onSelectRoute={handleSelectRouteOption}
                plan={itinerary[0].tripPlan}
                selectedRouteId={selectedRouteOptionId}
              />
            ) : null}

            {itinerary.map((day, index) => (
              <motion.article
                key={day.day}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-emerald-700">יום {day.day}</p>
                    <h3 className="mt-1 text-xl font-bold text-slate-950">
                      {day.title}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                    <CalendarDays className="h-4 w-4 text-emerald-700" />
                    מסלול יומי
                  </span>
                </div>

                {day.destinationName ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <InfoTile label={ui.destination} value={day.destinationName} />
                    <InfoTile label={ui.region} value={day.region || "-"} />
                    <InfoTile
                      label={ui.night}
                      value={`${day.nightNumber || 1}/${day.nightsInDestination || 1}`}
                    />
                    <InfoTile
                      label={ui.hotelBudget}
                      value={`$${day.hotelBudgetPerNight || 0}/${ui.perNight} · ${ui.estimateOnly}`}
                    />
                  </div>
                ) : null}

                {day.areaRecommendations?.length ? (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="flex items-center gap-2 font-bold text-slate-950">
                      <MapPin className="h-4 w-4 text-emerald-700" />
                      {ui.recommendedAreas} {day.destinationName}
                    </h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {day.areaRecommendations.map((area) => (
                        <span
                          key={area}
                          className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-700"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {day.routeTransfer ? (
                  <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
                    <h4 className="flex items-center gap-2 font-bold text-amber-950">
                      <Route className="h-4 w-4 text-amber-700" />
                      {ui.interTransfer}
                    </h4>
                    <p className="mt-2 leading-7 text-amber-900">
                      {day.routeTransfer.from} to {day.routeTransfer.to} ·{" "}
                      {day.routeTransfer.mode} · {day.routeTransfer.duration} · $
                      {day.routeTransfer.estimatedCostPerPerson}/{ui.person} · {ui.estimateOnly}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      {day.routeTransfer.notes}
                    </p>
                  </div>
                ) : null}

                {day.flightNotes?.length ? (
                  <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4">
                    <h4 className="flex items-center gap-2 font-bold text-sky-950">
                      <Plane className="h-4 w-4 text-sky-700" />
                      תיאום טיסה וצ׳ק אין
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm leading-6 text-sky-900">
                      {day.flightNotes.map((note) => (
                        <li key={note}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <h4 className="font-bold text-slate-950">בוקר</h4>
                    <p className="mt-2 leading-7 text-slate-600">{day.morning}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <h4 className="font-bold text-slate-950">צהריים</h4>
                    <p className="mt-2 leading-7 text-slate-600">{day.afternoon}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <h4 className="font-bold text-slate-950">ערב</h4>
                    <p className="mt-2 leading-7 text-slate-600">{day.evening}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
                    <h4 className="flex items-center gap-2 font-bold text-sky-950">
                      <Route className="h-4 w-4 text-sky-700" />
                      {ui.transportationTips}
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm leading-6 text-sky-900">
                      {[...(day.transportNotes ?? []), ...dayGuidance.transportation].map(
                        (tip) => (
                          <li key={tip}>• {tip}</li>
                        ),
                      )}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <h4 className="flex items-center gap-2 font-bold text-emerald-950">
                      <Accessibility className="h-4 w-4 text-emerald-700" />
                      {ui.accessibilityNotes}
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm leading-6 text-emerald-900">
                      {[...(day.dailyAccessibilityNotes ?? []), ...dayGuidance.notes].map(
                        (note) => (
                          <li key={note}>• {note}</li>
                        ),
                      )}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                    <h4 className="flex items-center gap-2 font-bold text-amber-950">
                      <Clock className="h-4 w-4 text-amber-700" />
                      {ui.restBreaks}
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm leading-6 text-amber-900">
                      {dayGuidance.restBreaks.map((rest) => (
                        <li key={rest}>• {rest}</li>
                      ))}
                    </ul>
                  </div>
                  {typeof day.estimatedDailyCost === "number" &&
                  day.estimatedDailyCost > 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <h4 className="flex items-center gap-2 font-bold text-slate-950">
                        <Wallet className="h-4 w-4 text-slate-700" />
                        {ui.estimatedDailyCost}
                      </h4>
                      <p className="mt-2 text-2xl font-black text-slate-950">
                        ~${day.estimatedDailyCost}
                        <span className="ms-2 align-middle text-xs font-bold text-slate-500">
                          {ui.estimateOnly}
                        </span>
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                  {getPlaces(day.places).map((place) => (
                    <PlaceRecommendationCard
                      key={place.id}
                      place={place}
                      expanded={expandedPlaceId === place.id}
                      onToggleInfo={() =>
                        setExpandedPlaceId((current) =>
                          current === place.id ? null : place.id,
                        )
                      }
                      onReplace={(preference) =>
                        handleReplacePlace(day.day, place.id, preference)
                      }
                      onSave={() => handleSavePlace(place)}
                    />
                  ))}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="flex items-center gap-2 font-bold text-slate-950">
                      <MapPin className="h-4 w-4 text-emerald-700" />
                      אטרקציות
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                      {day.attractions.map((attraction) => (
                        <li key={attraction}>• {attraction}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="flex items-center gap-2 font-bold text-slate-950">
                      <Utensils className="h-4 w-4 text-emerald-700" />
                      מסעדה מומלצת
                    </h4>
                    <p className="mt-2 leading-7 text-slate-600">{day.restaurant}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                    <h4 className="font-bold text-emerald-950">טיפ יומי</h4>
                    <p className="mt-2 leading-7 text-emerald-900">{day.dailyTip}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function TripPlanOverview({
  onSelectRoute,
  plan,
  selectedRouteId,
}: {
  onSelectRoute: (routeOptionId: string) => void;
  plan: MultiDestinationTripPlan;
  selectedRouteId: string;
}) {
  const locale = useLocale();
  const ui = getUiTranslations(locale).results;

  return (
    <section className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-bold text-emerald-700">{ui.multiRoute}</p>
          <h3 className="mt-1 text-2xl font-black text-slate-950">{plan.countryOrRoute}</h3>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">{plan.routeLogic}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-left">
          <p className="text-xs font-bold text-emerald-700">{ui.totalBudget}</p>
          <p className="text-2xl font-black text-emerald-950">
            {formatTripMoney(plan.budget.total, plan.budget.currency)}
          </p>
          <p className="text-xs text-emerald-800">{plan.budget.travelers} {ui.travelers}</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-sky-700">{ui.chooseOption}</p>
            <h4 className="text-xl font-black text-slate-950">{ui.routeOptions}</h4>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            {ui.disclaimer}
          </p>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {plan.routeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectRoute(option.id)}
              className={`rounded-xl border p-4 text-left transition ${
                selectedRouteId === option.id
                  ? "border-emerald-400 bg-white shadow-sm"
                  : "border-slate-200 bg-white/70 hover:border-sky-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h5 className="text-lg font-black text-slate-950">{option.name}</h5>
                  <p className="text-sm font-bold text-slate-500">{option.durationLabel}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                  {formatTripMoney(option.budget.total, option.budget.currency)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{option.whyThisRouteFits}</p>
              {option.accessibilitySummary ? (
                <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-xs font-bold leading-5 text-emerald-900">
                  {option.accessibilitySummary}
                </p>
              ) : null}
              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                <RouteOptionLine
                  label={ui.split}
                  value={option.destinations
                    .map((destination) => `${destination.name} ${destination.nights} ${ui.nights}`)
                    .join(" · ")}
                />
                <RouteOptionLine
                  label={ui.flightEstimate}
                  value={formatTripMoney(option.budget.internationalFlights, option.budget.currency)}
                />
                <RouteOptionLine
                  label={ui.hotels}
                  value={formatTripMoney(option.budget.hotels, option.budget.currency)}
                />
                <RouteOptionLine
                  label={ui.internalTransport}
                  value={formatTripMoney(option.budget.domesticTransportation, option.budget.currency)}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {plan.destinations.map((destination) => (
          <article
            key={destination.name}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-black text-slate-950">{destination.name}</h4>
                <p className="text-sm font-bold text-slate-500">{destination.region}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-700">
                {destination.nights} {ui.nights}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{destination.whyHere}</p>
            <div className="mt-3 grid gap-2 text-sm">
              <InfoTile label={ui.hotelArea} value={destination.hotelArea} />
              <InfoTile
                label={ui.hotelEstimate}
                value={`${formatTripMoney(destination.hotelBudgetPerNight, plan.budget.currency)}/${ui.perNight} · ${formatTripMoney(destination.hotelBudgetTotal, plan.budget.currency)} ${ui.total}`}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {destination.areaRecommendations.map((area) => (
                <span key={area} className="rounded-full bg-white px-3 py-1 text-xs font-bold">
                  {area}
                </span>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-white p-3">
              <p className="text-xs font-bold text-slate-500">{ui.accessibilityNotes}</p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
                {destination.accessibilityNotes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <h4 className="flex items-center gap-2 font-black text-slate-950">
            <Plane className="h-4 w-4 text-sky-700" />
            {ui.transportBetween}
          </h4>
          <div className="mt-3 grid gap-3">
            {plan.transportation.map((leg) => (
              <div key={`${leg.from}-${leg.to}`} className="rounded-lg bg-slate-50 p-3">
                <p className="font-black text-slate-950">
                  {leg.from} {ui.to} {leg.to}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {leg.mode} · {leg.duration} ·{" "}
                  {formatTripMoney(leg.estimatedCostPerPerson, plan.budget.currency)}/{ui.person} ·{" "}
                  {formatTripMoney(leg.estimatedTotalCost, plan.budget.currency)} {ui.total}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{leg.notes}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <h4 className="font-black text-slate-950">{ui.budgetBreakdown}</h4>
          <div className="mt-3 grid gap-2 text-sm">
            <BudgetLine label={ui.internationalFlights} value={plan.budget.internationalFlights} currency={plan.budget.currency} />
            <BudgetLine label={ui.domesticTransport} value={plan.budget.domesticTransportation} currency={plan.budget.currency} />
            <BudgetLine label={ui.hotels} value={plan.budget.hotels} currency={plan.budget.currency} />
            <BudgetLine label={ui.food} value={plan.budget.food} currency={plan.budget.currency} />
            <BudgetLine label={ui.activities} value={plan.budget.activities} currency={plan.budget.currency} />
            <BudgetLine label={ui.localTransport} value={plan.budget.localTransport} currency={plan.budget.currency} />
            <BudgetLine label={ui.buffer} value={plan.budget.buffer} currency={plan.budget.currency} />
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function RouteOptionLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <span className="block font-bold text-slate-500">{label}</span>
      <span className="mt-1 block font-black text-slate-950">{value}</span>
    </div>
  );
}

function BudgetLine({
  currency,
  label,
  value,
}: {
  currency: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-black text-slate-950">{formatTripMoney(value, currency)}</span>
    </div>
  );
}

function formatTripMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function PlaceRecommendationCard({
  place,
  expanded,
  onToggleInfo,
  onReplace,
  onSave,
}: {
  place: ItineraryPlace;
  expanded: boolean;
  onToggleInfo: () => void;
  onReplace: (preference: ReplacementPreference) => void;
  onSave: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={place.image}
          alt={place.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="h-full w-full object-cover object-center"
        />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 shadow">
          {place.timeSlot} · {place.suggestedTime}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-emerald-700">{place.category}</p>
            <h4 className="mt-1 text-lg font-bold text-slate-950">{place.name}</h4>
          </div>
          <span className="rounded-full bg-amber-50 px-2 py-1 text-sm font-bold text-amber-700">
            ★ {place.rating}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {place.shortDescription}
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {place.gallery.map((image, index) => (
            <div key={image} className="relative h-16 overflow-hidden rounded-lg">
              <Image
                src={image}
                alt={`${place.name} תמונה ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2 text-sm text-slate-600">
          {place.address ? (
            <p>
              <strong>כתובת:</strong> {place.address}
            </p>
          ) : null}
          <p>
            <strong>שעות פעילות:</strong> {place.openingHours}
          </p>
          <p>
            <strong>זמן ביקור:</strong> {place.recommendedVisitTime}
          </p>
          <p>
            <strong>מחיר:</strong> {place.estimatedPrice}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {place.travelerFit.map((fit) => (
            <span
              key={fit}
              className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700"
            >
              {fit}
            </span>
          ))}
        </div>

        {expanded ? (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-7 text-slate-700">
            <p>{place.detailedDescription}</p>
            <p className="mt-2">
              <strong>למה מומלץ:</strong> {place.whyRecommended}
            </p>
            <p className="mt-2">
              <strong>ביקורות:</strong> {place.reviewSummary}
            </p>
            {place.placeId ? (
              <p className="mt-2 text-xs font-bold text-slate-500">
                Google place_id: {place.placeId}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={onToggleInfo}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Info className="h-4 w-4" />
            מידע נוסף
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
          >
            <Heart className="h-4 w-4" />
            שמור
          </button>
          <a
            href={place.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <ExternalLink className="h-4 w-4" />
            מפה
          </a>
        </div>

        <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-950">
            <RefreshCw className="h-4 w-4" />
            החלף מקום
          </p>
          <div className="flex flex-wrap gap-2">
            {replacementOptions.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onReplace(value)}
                className="rounded-full bg-white px-3 py-2 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
