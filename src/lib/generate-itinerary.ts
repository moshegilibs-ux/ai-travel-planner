import { getPlaceImages } from "@/services/api/images";
import { getMapUrl } from "@/services/api/maps";
import type { FlightDeal } from "@/services/api/flights";

export type TripType =
  | "רומנטי"
  | "משפחתי"
  | "בטן גב"
  | "שופינג"
  | "טבע והרפתקאות"
  | "תקציב נמוך";

export type CustomItineraryInput = {
  destination: string;
  days: number;
  budget: string;
  tripType: TripType;
  preferences?: TravelerPreferences;
  selectedFlight?: FlightDeal | null;
};

export type TravelerPreferences = {
  environment: "טבע" | "עיר" | "משולב";
  pace: "רגוע" | "מאוזן" | "עמוס";
  budgetStyle: "חסכוני" | "מאוזן" | "יוקרתי";
  interests: Array<"אוכל" | "תרבות" | "חיי לילה" | "טבע" | "ילדים">;
};

export type RecommendationCategory =
  | "אטרקציה"
  | "מסעדה"
  | "נוף"
  | "אוכל"
  | "תרבות"
  | "טבע";

export type ItineraryPlace = {
  id: string;
  name: string;
  category: RecommendationCategory;
  timeSlot: "בוקר" | "צהריים" | "ערב";
  suggestedTime: string;
  shortDescription: string;
  detailedDescription: string;
  whyRecommended: string;
  recommendedVisitTime: string;
  openingHours: string;
  estimatedPrice: string;
  rating: number;
  reviewSummary: string;
  travelerFit: string[];
  image: string;
  gallery: string[];
  mapUrl: string;
  address?: string;
  placeId?: string;
};

export type CustomItineraryDay = {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  attractions: string[];
  restaurant: string;
  dailyTip: string;
  places: ItineraryPlace[];
  flightNotes?: string[];
};

const tripTypePlans: Record<
  TripType,
  {
    mornings: string[];
    afternoons: string[];
    evenings: string[];
    attractions: string[];
    restaurants: string[];
    tips: string[];
  }
> = {
  רומנטי: {
    mornings: ["טיול רגוע באזור היפה ביותר בעיר", "קפה בוקר עם נוף ונקודת צילום זוגית"],
    afternoons: ["מוזיאון או שכונה ציורית בקצב נינוח", "שייט קצר או תצפית מרכזית"],
    evenings: ["ארוחת ערב רומנטית ושיטוט ערב", "בר יין או טיילת מוארת לסיום היום"],
    attractions: ["תצפית שקיעה", "רחוב היסטורי", "גן עירוני"],
    restaurants: ["מסעדת שף מקומית", "ביסטרו אינטימי", "מסעדה עם נוף"],
    tips: ["השאירו שעה פנויה להפתעות בדרך", "הזמינו מסעדה טובה מראש"],
  },
  משפחתי: {
    mornings: ["אטרקציה מרכזית שמתאימה לילדים", "פארק עירוני או מוזיאון אינטראקטיבי"],
    afternoons: ["הפסקת צהריים נוחה ליד אזור הלינה", "פעילות קצרה בלי נסיעות ארוכות"],
    evenings: ["ארוחה משפחתית וקינוח באזור נגיש", "טיילת או מופע ערב קליל"],
    attractions: ["פארק שעשועים קטן", "מוזיאון ילדים", "שוק צבעוני"],
    restaurants: ["מסעדה משפחתית", "פיצרייה טובה", "מתחם אוכל נוח"],
    tips: ["תכננו הפסקה אמיתית באמצע היום", "בחרו מלון קרוב לתחבורה ציבורית"],
  },
  "בטן גב": {
    mornings: ["בוקר רגוע בחוף או בבריכת המלון", "ארוחת בוקר מאוחרת מול הים"],
    afternoons: ["ספא, חוף נוסף או פעילות מים קצרה", "זמן מנוחה בלי לו״ז צפוף"],
    evenings: ["מסעדת חוף ושקיעה", "טיילת, גלידה וקוקטייל קליל"],
    attractions: ["חוף מרכזי", "מועדון חוף", "ספא מומלץ"],
    restaurants: ["מסעדת דגים", "בר חוף", "מסעדה ים תיכונית"],
    tips: ["אל תעמיסו מעבר אחד ביום", "בדקו מראש מזג אוויר ורוחות בחופים"],
  },
  שופינג: {
    mornings: ["רחוב קניות מרכזי לפני העומס", "קניון מוביל עם מותגים בינלאומיים"],
    afternoons: ["שוק מקומי, חנויות בוטיק וקפה", "אזור אאוטלט או מתחם עיצוב"],
    evenings: ["מסעדה ליד אזור הבילוי", "שיטוט ערב בחנויות פתוחות"],
    attractions: ["קניון מרכזי", "שוק מקומי", "רחוב בוטיקים"],
    restaurants: ["מסעדה בתוך מתחם קניות", "בית קפה מקומי", "דוכן אוכל רחוב איכותי"],
    tips: ["בדקו שעות פתיחה ומדיניות החזרי מס", "השאירו מקום במזוודה"],
  },
  "טבע והרפתקאות": {
    mornings: ["יציאה מוקדמת למסלול טבע או תצפית", "הליכה נופית באזור ירוק"],
    afternoons: ["אטרקציית אדרנלין או מפל/אגם", "ארוחת צהריים מקומית ליד הטבע"],
    evenings: ["חזרה רגועה, מקלחת וארוחה טובה", "תצפית שקיעה או מדורה מאורגנת"],
    attractions: ["מסלול הליכה", "תצפית פנורמית", "פעילות אקסטרים"],
    restaurants: ["מסעדה כפרית", "דוכן מקומי", "מסעדה ליד שמורת טבע"],
    tips: ["בדקו מזג אוויר לפני יציאה", "קחו מים, נעליים נוחות וסוללה מלאה"],
  },
  "תקציב נמוך": {
    mornings: ["סיור רגלי עצמאי באזורים מרכזיים", "שוק מקומי וארוחת בוקר זולה"],
    afternoons: ["אטרקציה חינמית או מוזיאון מוזל", "פארק עירוני ושכונה מעניינת"],
    evenings: ["אוכל רחוב ואזור בילוי חינמי", "תצפית ערב בלי עלות כניסה"],
    attractions: ["סיור חינמי", "שוק אוכל", "פארק מרכזי"],
    restaurants: ["אוכל רחוב מומלץ", "מסעדה מקומית פשוטה", "מאפייה שכונתית"],
    tips: ["קנו כרטיס תחבורה יומי", "שלבו אטרקציות חינמיות עם אחת בתשלום"],
  },
};

function pick(items: string[], index: number) {
  return items[index % items.length];
}

const replacementLabels = {
  cheaper: "יותר זול",
  local: "פחות תיירותי",
  nature: "יותר טבע",
  kids: "יותר מתאים לילדים",
  food: "יותר אוכל מקומי",
} as const;

export type ReplacementPreference = keyof typeof replacementLabels;

function getPreferenceText(input: CustomItineraryInput) {
  const preferences = input.preferences;

  if (!preferences) {
    return "מסלול מאוזן עם שילוב נוח בין חוויה, תקציב ונגישות.";
  }

  return `העדפה ל${preferences.environment}, קצב ${preferences.pace}, סגנון ${preferences.budgetStyle}, ודגש על ${preferences.interests.join(", ") || "חוויה כללית"}.`;
}

function createPlace({
  input,
  day,
  index,
  timeSlot,
  baseName,
  category,
}: {
  input: CustomItineraryInput;
  day: number;
  index: number;
  timeSlot: ItineraryPlace["timeSlot"];
  baseName: string;
  category: RecommendationCategory;
}): ItineraryPlace {
  const imageIndex = day + index;
  const images = getPlaceImages(imageIndex);
  const placeName = `${baseName} · ${input.destination}`;
  const budgetNote =
    input.preferences?.budgetStyle === "חסכוני"
      ? "כניסה חינם עד עלות נמוכה"
      : input.preferences?.budgetStyle === "יוקרתי"
        ? "$35-$90 לאדם"
        : "$12-$45 לאדם";

  return {
    id: `${day}-${index}-${baseName}`.replace(/\s+/g, "-"),
    name: placeName,
    category,
    timeSlot,
    suggestedTime:
      timeSlot === "בוקר" ? "09:30-11:30" : timeSlot === "צהריים" ? "13:00-15:00" : "18:00-20:00",
    shortDescription: `${baseName} שמתאים ל${input.tripType} בקצב ${input.preferences?.pace || "מאוזן"}.`,
    detailedDescription: `עצירה מומלצת ב${input.destination} עם זרימה נוחה במהלך היום. המקום מתאים למסלול שאינו מרגיש לחוץ, מאפשר זמן מנוחה, ומשתלב טוב עם תחבורה נגישה או נסיעה קצרה מהאזור המרכזי.`,
    whyRecommended: `${getPreferenceText(input)} המקום נבחר כי הוא מוסיף ערך למסלול בלי ליצור עומס מיותר או מעבר ארוך מדי.`,
    recommendedVisitTime:
      input.preferences?.pace === "עמוס" ? "60-75 דקות" : input.preferences?.pace === "רגוע" ? "90-120 דקות" : "75-90 דקות",
    openingHours: category === "מסעדה" || category === "אוכל" ? "12:00-23:00" : "09:00-18:00",
    estimatedPrice: budgetNote,
    rating: Number((4.3 + ((day + index) % 6) / 10).toFixed(1)),
    reviewSummary: "מבקרים מציינים שירות נעים, מיקום נוח וחוויה שמתאימה גם למשפחות.",
    travelerFit: [
      input.tripType,
      ...(input.preferences?.interests ?? []),
      "משפחות",
      "נגישות",
    ].slice(0, 6),
    image: images.image,
    gallery: images.gallery,
    mapUrl: getMapUrl(placeName),
  };
}

export function generateCustomItinerary(input: CustomItineraryInput): CustomItineraryDay[] {
  const safeDays = Math.min(Math.max(input.days, 1), 21);
  const plan = tripTypePlans[input.tripType];

  return Array.from({ length: safeDays }, (_, index) => {
    const day = index + 1;

    const morningPlace = createPlace({
      input,
      day,
      index,
      timeSlot: "בוקר",
      baseName: pick(plan.attractions, index),
      category: input.preferences?.environment === "טבע" ? "טבע" : "אטרקציה",
    });
    const afternoonPlace = createPlace({
      input,
      day,
      index: index + 1,
      timeSlot: "צהריים",
      baseName: pick(plan.attractions, index + 1),
      category: input.preferences?.interests.includes("תרבות") ? "תרבות" : "נוף",
    });
    const eveningPlace = createPlace({
      input,
      day,
      index: index + 2,
      timeSlot: "ערב",
      baseName: pick(plan.restaurants, index),
      category: "מסעדה",
    });
    const flightNotes =
      input.selectedFlight && (day === 1 || day === safeDays)
        ? [
            day === 1
              ? `טיסת הגעה: ${input.selectedFlight.airline} ${input.selectedFlight.flightNumber}, המראה ${input.selectedFlight.departureTime} מ${input.selectedFlight.originAirport} ונחיתה ${input.selectedFlight.arrivalTime} ב${input.selectedFlight.destinationAirport}.`
              : `טיסת חזור: מומלץ לתכנן את היום לפי יציאה לשדה סביב ${input.selectedFlight.returnDepartureTime} ונחיתה משוערת ${input.selectedFlight.returnArrivalTime}.`,
            day === 1
              ? "להגיע לשדה לפחות 3 שעות לפני ההמראה, במיוחד עם משפחה או ציוד נגישות."
              : "לשמור את היום האחרון רגוע, עם צ׳ק אאוט מסודר וזמן ביטחון להגעה לשדה.",
            "להוסיף תזכורת למסמכים, כבודה, תרופות, סוללות למכשירי ניידות ואישור סיוע בשדה במידת הצורך.",
          ]
        : undefined;

    return {
      day,
      title: `יום ${day} ב${input.destination} · ${input.tripType}`,
      morning: `${pick(plan.mornings, index)} ב${input.destination}.`,
      afternoon: `${pick(plan.afternoons, index)} בהתאם לתקציב ${input.budget}.`,
      evening: pick(plan.evenings, index),
      attractions: [
        `${pick(plan.attractions, index)} ב${input.destination}`,
        `${pick(plan.attractions, index + 1)} מומלץ`,
      ],
      restaurant: pick(plan.restaurants, index),
      dailyTip: pick(plan.tips, index),
      places: [morningPlace, afternoonPlace, eveningPlace],
      flightNotes,
    };
  });
}

export function createAlternativePlace(
  place: ItineraryPlace,
  input: CustomItineraryInput,
  preference: ReplacementPreference,
): ItineraryPlace {
  const suffix = replacementLabels[preference];
  const category: RecommendationCategory =
    preference === "nature"
      ? "טבע"
      : preference === "food"
        ? "אוכל"
        : preference === "kids"
          ? "אטרקציה"
          : place.category;

  return {
    ...createPlace({
      input,
      day: Number(place.id.split("-")[0]) || 1,
      index: place.name.length + suffix.length,
      timeSlot: place.timeSlot,
      baseName:
        preference === "local"
          ? "פינה מקומית פחות עמוסה"
          : preference === "cheaper"
            ? "חלופה חסכונית ונוחה"
            : preference === "kids"
              ? "פעילות ידידותית לילדים"
              : preference === "food"
                ? "חוויה של אוכל מקומי"
                : "נקודת טבע רגועה",
      category,
    }),
    id: `${place.id}-${preference}-${Date.now()}`,
    suggestedTime: place.suggestedTime,
    whyRecommended: `הוחלף לפי בקשת "${suffix}" תוך שמירה על סדר היום, זמן הביקור והמיקום הכללי במסלול.`,
  };
}
