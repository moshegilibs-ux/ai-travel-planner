import { getPlaceImages } from "@/services/api/images";
import { getMapUrl } from "@/services/api/maps";
import type { FlightDeal } from "@/services/api/flights";

import { getUiTranslations } from "@/lib/ui-translations";

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
  locale?: string;
  routeOptionId?: string;
  preferences?: TravelerPreferences & { accessibility?: AccessibilityPreferences };
  selectedFlight?: FlightDeal | null;
};

export type TravelerPreferences = {
  environment: "טבע" | "עיר" | "משולב";
  pace: "רגוע" | "מאוזן" | "עמוס";
  budgetStyle: "חסכוני" | "מאוזן" | "יוקרתי";
  interests: Array<"אוכל" | "תרבות" | "חיי לילה" | "טבע" | "ילדים">;
};

export type AccessibilityPreferences = {
  wheelchairUser: boolean;
  limitedWalking: boolean;
  stepFreeHotels: boolean;
  accessibleTransport: boolean;
  relaxedPace: boolean;
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

export type DestinationSegment = {
  name: string;
  region: string;
  nights: number;
  dayStart: number;
  dayEnd: number;
  whyHere: string;
  hotelArea: string;
  hotelBudgetPerNight: number;
  hotelBudgetTotal: number;
  areaRecommendations: string[];
  accessibilityNotes: string[];
};

export type TransportationLeg = {
  from: string;
  to: string;
  mode: "flight" | "ferry" | "car" | "train";
  duration: string;
  estimatedCostPerPerson: number;
  estimatedTotalCost: number;
  notes: string;
};

export type TripBudgetEstimate = {
  currency: string;
  travelers: number;
  internationalFlights: number;
  domesticTransportation: number;
  hotels: number;
  food: number;
  activities: number;
  localTransport: number;
  buffer: number;
  total: number;
};

export type RouteOption = {
  id: string;
  name: string;
  durationLabel: string;
  whyThisRouteFits: string;
  accessibilitySummary?: string;
  destinations: DestinationSegment[];
  transportation: TransportationLeg[];
  budget: TripBudgetEstimate;
};

export type MultiDestinationTripPlan = {
  countryOrRoute: string;
  routeLogic: string;
  selectedRouteId: string;
  routeOptions: RouteOption[];
  destinations: DestinationSegment[];
  transportation: TransportationLeg[];
  budget: TripBudgetEstimate;
};

export type CustomItineraryDay = {
  day: number;
  title: string;
  destinationName?: string;
  region?: string;
  nightNumber?: number;
  nightsInDestination?: number;
  hotelArea?: string;
  hotelBudgetPerNight?: number;
  areaRecommendations?: string[];
  routeTransfer?: TransportationLeg;
  tripPlan?: MultiDestinationTripPlan;
  morning: string;
  afternoon: string;
  evening: string;
  attractions: string[];
  museums?: string[];
  transportNotes?: string[];
  dailyAccessibilityNotes?: string[];
  estimatedDailyCost?: number;
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

function parseTravelers(input: CustomItineraryInput) {
  return Math.max(input.selectedFlight ? 1 : 2, input.selectedFlight ? 1 : 2);
}

function parseBudgetAmount(value: string) {
  const numeric = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 2400;
}

function destinationKey(destination: string) {
  return destination.toLowerCase();
}

function isThailandDestination(destination: string) {
  return /thailand|תאילנד|בנגקוק|bangkok|phuket|פוקט|samui|סמוי|koh/i.test(destination);
}

function isBangkokName(value: string) {
  return /bangkok|בנגקוק/i.test(value);
}

function isPhuketName(value: string) {
  return /phuket|פוקט/i.test(value);
}

function isSamuiName(value: string) {
  return /samui|סמוי/i.test(value);
}

function allocateNights(totalDays: number, destinationCount: number) {
  const totalNights = Math.max(totalDays - 1, destinationCount);
  const base = Math.floor(totalNights / destinationCount);
  const extra = totalNights % destinationCount;

  return Array.from({ length: destinationCount }, (_, index) => base + (index < extra ? 1 : 0));
}

function hotelRateFor(input: CustomItineraryInput, destinationName: string) {
  const budgetStyle = input.preferences?.budgetStyle;
  const premium =
    destinationName.includes("Phuket") ||
    destinationName.includes("פוקט") ||
    destinationName.includes("Samui") ||
    destinationName.includes("סמוי");

  if (budgetStyle === "חסכוני") return premium ? 80 : 65;
  if (budgetStyle === "יוקרתי") return premium ? 260 : 210;
  return premium ? 145 : 120;
}

function buildDestinationSegments(input: CustomItineraryInput): DestinationSegment[] {
  const safeDays = Math.min(Math.max(input.days, 1), 21);
  const key = destinationKey(input.destination);
  const thailand = isThailandDestination(key);
  const baseSegments = thailand
    ? [
        classicSpec("Bangkok", 0, undefined, input.locale),
        classicSpec("Phuket", 0, undefined, input.locale),
        classicSpec("Koh Samui", 0, undefined, input.locale),
      ]
    : [
        {
          name: input.destination,
          region: input.locale === "en" ? "Primary city" : "עיר מרכזית",
          whyHere:
            input.locale === "en"
              ? "Main arrival base with the strongest mix of hotels, transport, restaurants, and first-time visitor highlights."
              : "בסיס הגעה מרכזי עם שילוב נוח של מלונות, תחבורה, מסעדות ונקודות עניין לטיול ראשון.",
          hotelArea: input.locale === "en" ? "Central area near transit" : "אזור מרכזי ליד תחבורה ציבורית",
          areaRecommendations:
            input.locale === "en"
              ? ["Historic center", "Museum district", "Main market", "Central park", "Restaurant quarter"]
              : ["המרכז ההיסטורי", "רובע המוזיאונים", "השוק המרכזי", "הפארק המרכזי", "רובע המסעדות"],
        },
      ];

  const nights = allocateNights(safeDays, baseSegments.length);
  let dayCursor = 1;

  return baseSegments.map((segment, index) => {
    const segmentDays = Math.max(1, nights[index] + (index === baseSegments.length - 1 ? 1 : 0));
    const dayStart = dayCursor;
    const dayEnd = Math.min(safeDays, dayCursor + segmentDays - 1);
    dayCursor = dayEnd + 1;
    const hotelBudgetPerNight = hotelRateFor(input, segment.name);

    return {
      ...segment,
      nights: nights[index],
      dayStart,
      dayEnd,
      hotelBudgetPerNight,
      hotelBudgetTotal: hotelBudgetPerNight * nights[index],
      accessibilityNotes: accessibilityNotesFor(segment.name, input),
    };
  });
}

function hasAccessibilityNeeds(input: CustomItineraryInput) {
  const access = input.preferences?.accessibility;
  return Boolean(
    access?.wheelchairUser ||
      access?.limitedWalking ||
      access?.stepFreeHotels ||
      access?.accessibleTransport ||
      access?.relaxedPace,
  );
}

function accessibilityNotesFor(destinationName: string, input: CustomItineraryInput) {
  const access = input.preferences?.accessibility;
  const isHebrew = input.locale !== "en";
  const notes = isHebrew
    ? [
        `בחרו מלון ללא מדרגות באזור ${destinationName}; ודאו מראש מעלית, רוחב כניסה לחדר ונגישות לחדר הרחצה.`,
        "בימי הגעה ומעבר בין יעדים השתמשו בהעברות פרטיות או במונית נגישה שהוזמנה מראש.",
      ]
    : [
        `Stay in step-free hotels in ${destinationName}; confirm elevator access and room entry width before booking.`,
        "Use private transfers or pre-booked accessible taxis on arrival and transfer days.",
      ];

  if (access?.wheelchairUser) {
    notes.push(
      isHebrew
        ? "העדיפו חדר נגיש לכיסא גלגלים, מקלחון ללא מדרגה, כניסה עם רמפה וסיוע בשדות התעופה."
        : "Prioritize wheelchair-accessible rooms, roll-in showers, ramped entrances, and airport assistance.",
    );
  }

  if (access?.limitedWalking || access?.relaxedPace) {
    notes.push(
      isHebrew
        ? "ריכזו את הפעילויות היומיות באותו אזור, שלבו הפסקות מנוחה ארוכות וצמצמו הליכה בין עצירות."
        : "Keep daily sightseeing clustered by area with long rest blocks and minimal walking between stops.",
    );
  }

  if (!hasAccessibilityNeeds(input)) {
    return [
      isHebrew
        ? "בחרו אזורי מלון מרכזיים כדי לקצר זמני נסיעה ולהימנע ממעברים ארוכים בשעות מאוחרות."
        : "Choose central hotel areas to reduce commute time and avoid late-night long transfers.",
    ];
  }

  return notes;
}

function buildTransportationLegs(
  segments: DestinationSegment[],
  travelers: number,
  locale = "he",
): TransportationLeg[] {
  const legs: TransportationLeg[] = [];
  const isHebrew = locale !== "en";

  for (let index = 0; index < segments.length - 1; index += 1) {
    const from = segments[index].name;
    const to = segments[index + 1].name;
    const isBangkokToPhuket = isBangkokName(from) && isPhuketName(to);
    const isPhuketToSamui = isPhuketName(from) && isSamuiName(to);
    const estimatedCostPerPerson = isBangkokToPhuket ? 55 : isPhuketToSamui ? 95 : 70;

    legs.push({
      from,
      to,
      mode: isPhuketToSamui ? "flight" : "flight",
      duration: isBangkokToPhuket
        ? isHebrew
          ? "טיסה של כשעה ו-25 דקות, בתוספת העברה לשדה ומהשדה"
          : "1h 25m flight plus airport transfer"
        : isPhuketToSamui
          ? isHebrew
            ? "טיסה של כ-55 דקות, בתוספת העברה לשדה ומהשדה"
            : "55m flight plus airport transfer"
          : isHebrew
            ? "מעבר אזורי של כשעה עד שעתיים"
            : "1-2h regional transfer",
      estimatedCostPerPerson,
      estimatedTotalCost: estimatedCostPerPerson * travelers,
      notes: isPhuketToSamui
        ? isHebrew
          ? "טיסה היא האפשרות הריאלית והנוחה ביותר למשפחה. מעבורות אפשריות, אבל איטיות יותר ופחות נוחות עם מזוודות או צרכי נגישות."
          : "Flying is the most realistic family option. Ferry routes are possible but slower and less comfortable with luggage."
        : isHebrew
          ? "טיסות פנים תכופות ולרוב משתלמות יותר מאיבוד יום שלם בנסיעה יבשתית ארוכה."
          : "Domestic flights are frequent and usually cheaper than losing a full day to overland travel.",
    });
  }

  return legs;
}

function buildSegmentsFromSpecs(
  input: CustomItineraryInput,
  specs: Array<{
    name: string;
    region: string;
    nights: number;
    whyHere: string;
    hotelArea: string;
    areaRecommendations: string[];
  }>,
) {
  let dayCursor = 1;

  return specs.map((spec) => {
    const dayStart = dayCursor;
    const dayEnd = dayStart + spec.nights;
    dayCursor = dayEnd + 1;
    const hotelBudgetPerNight = hotelRateFor(input, spec.name);

    return {
      ...spec,
      dayStart,
      dayEnd,
      hotelBudgetPerNight,
      hotelBudgetTotal: hotelBudgetPerNight * spec.nights,
      accessibilityNotes: accessibilityNotesFor(spec.name, input),
    };
  });
}

function buildRouteOption(
  input: CustomItineraryInput,
  option: {
    id: string;
    name: string;
    whyThisRouteFits: string;
    accessibilitySummary?: string;
    specs: Parameters<typeof buildSegmentsFromSpecs>[1];
  },
): RouteOption {
  const destinations = buildSegmentsFromSpecs(input, option.specs);
  const transportation = buildTransportationLegs(destinations, parseTravelers(input), input.locale);
  const totalNights = destinations.reduce((sum, destination) => sum + destination.nights, 0);
  const isHebrew = input.locale !== "en";

  return {
    id: option.id,
    name: option.name,
    durationLabel: isHebrew
      ? `${totalNights} לילות / ${totalNights + 1} ימים`
      : `${totalNights} nights / ${totalNights + 1} days`,
    whyThisRouteFits: option.whyThisRouteFits,
    accessibilitySummary: option.accessibilitySummary,
    destinations,
    transportation,
    budget: buildTripBudget(input, destinations, transportation),
  };
}

function buildThailandRouteOptions(input: CustomItineraryInput): RouteOption[] {
  const totalNights = Math.max(input.days, 6);
  const useFourteenNightExamples = totalNights >= 12;
  const accessibility = hasAccessibilityNeeds(input);
  const routesText = getUiTranslations(input.locale || "he").results.generatedRoutes;

  if (!useFourteenNightExamples) {
    return [
      buildRouteOption(input, {
        id: "classic",
        name: routesText["classic-short"].name,
        whyThisRouteFits: routesText["classic-short"].why,
        specs: [
          classicSpec("Bangkok", 2, undefined, input.locale),
          classicSpec("Phuket", Math.max(3, totalNights - 4), undefined, input.locale),
          classicSpec("Koh Samui", 2, undefined, input.locale),
        ],
      }),
    ];
  }

  return [
    buildRouteOption(input, {
      id: "classic",
      name: routesText.classic.name,
      whyThisRouteFits: routesText.classic.why,
      specs: [
        classicSpec("Bangkok", 3, undefined, input.locale),
        classicSpec("Phuket", 5, undefined, input.locale),
        classicSpec("Koh Samui", 5, undefined, input.locale),
        classicSpec(
          "Bangkok",
          1,
          input.locale === "en"
            ? "Final airport night near Sukhumvit or the airport rail link"
            : "לילה אחרון ליד סוקומוויט או קו הרכבת לשדה התעופה",
          input.locale,
        ),
      ],
    }),
    buildRouteOption(input, {
      id: "islands-focused",
      name: routesText["islands-focused"].name,
      whyThisRouteFits: routesText["islands-focused"].why,
      specs: [
        classicSpec("Phuket", 6, undefined, input.locale),
        classicSpec(
          "Phi Phi / Krabi",
          3,
          input.locale === "en"
            ? "Ao Nang or accessible Krabi mainland base"
            : "או נאנג או בסיס נגיש יותר ביבשת קראבי",
          input.locale,
        ),
        classicSpec("Koh Samui", 5, undefined, input.locale),
      ],
    }),
    buildRouteOption(input, {
      id: "accessible-relaxed",
      name: routesText["accessible-relaxed"].name,
      whyThisRouteFits: routesText["accessible-relaxed"].why,
      accessibilitySummary: accessibility
        ? routesText["accessible-relaxed"].accessibility
        : routesText["accessible-relaxed"].fallback,
      specs: [
        classicSpec("Bangkok", 3, undefined, input.locale),
        classicSpec("Phuket", 6, undefined, input.locale),
        classicSpec("Koh Samui", 5, undefined, input.locale),
      ],
    }),
  ];
}

function classicSpec(name: string, nights: number, hotelAreaOverride?: string, locale = "he") {
  const isHebrew = locale !== "en";
  const base: Record<string, Omit<DestinationSegment, "nights" | "dayStart" | "dayEnd" | "hotelBudgetPerNight" | "hotelBudgetTotal" | "accessibilityNotes">> = {
    Bangkok: {
      name: isHebrew ? "בנגקוק" : "Bangkok",
      region: isHebrew ? "מרכז תאילנד" : "Central Thailand",
      whyHere: isHebrew
        ? "שער הכניסה הבינלאומי הנוח ביותר, עם מקדשים, שווקים, אוכל, קניונים, בתי חולים ונחיתה רכה לפני המעברים לאיים."
        : "International arrival hub with temples, markets, food, malls, hospitals, and the easiest first landing in Thailand.",
      hotelArea: isHebrew ? "סוקומוויט, סיאם או ריברסייד ליד BTS/MRT" : "Sukhumvit, Siam, or Riverside near BTS/MRT",
      areaRecommendations: isHebrew
        ? ["סוקומוויט", "סיאם", "ריברסייד", "העיר העתיקה", "ארי"]
        : ["Sukhumvit", "Siam", "Riverside", "Old City", "Ari"],
    },
    Phuket: {
      name: isHebrew ? "פוקט" : "Phuket",
      region: isHebrew ? "דרום תאילנד - חוף אנדמן" : "Southern Thailand - Andaman Coast",
      whyHere: isHebrew
        ? "בסיס חוף חזק עם טיסות פנים ישירות, ריזורטים, שירותים רפואיים, טיולי יום לאיים ואזורים נוחים למשפחות."
        : "Strong beach base with direct domestic flights, resorts, medical services, island day trips, and family-friendly areas.",
      hotelArea: isHebrew ? "קאטה, קארון, קמאלה או באנג טאו" : "Kata, Karon, Kamala, or Bang Tao",
      areaRecommendations: isHebrew
        ? ["קאטה", "קארון", "העיר העתיקה של פוקט", "באנג טאו", "כף פרומטפ"]
        : ["Kata", "Karon", "Old Phuket Town", "Bang Tao", "Promthep Cape"],
    },
    "Koh Samui": {
      name: isHebrew ? "קו סמוי" : "Koh Samui",
      region: isHebrew ? "מפרץ תאילנד" : "Gulf of Thailand",
      whyHere: isHebrew
        ? "קצב אי רגוע יותר, עם נסיעות קצרות יחסית בין חופים, ריזורטים, מסעדות ונקודות שקיעה."
        : "Calmer island pace with short drives between beaches, resorts, restaurants, and sunset areas.",
      hotelArea: isHebrew ? "בופוט, צ'ואנג מון או צ'אוונג נוי" : "Bophut, Choeng Mon, or Chaweng Noi",
      areaRecommendations: isHebrew
        ? ["כפר הדייגים בבופוט", "צ'ואנג מון", "צ'אוונג נוי", "למאי", "בודהה הגדול"]
        : ["Bophut Fisherman's Village", "Choeng Mon", "Chaweng Noi", "Lamai", "Big Buddha"],
    },
    "Phi Phi / Krabi": {
      name: isHebrew ? "פי פי / קראבי" : "Phi Phi / Krabi",
      region: isHebrew ? "איי אנדמן וחופי קראבי" : "Andaman islands and Krabi coast",
      whyHere: isHebrew
        ? "מוסיף מצוקי גיר, נופי איים וימי שייט בין פוקט לבין מקטע האיים במפרץ."
        : "Adds limestone cliffs, island scenery, and boat days between Phuket and the Gulf island segment.",
      hotelArea: isHebrew ? "או נאנג או יבשת קראבי ללוגיסטיקה פשוטה יותר" : "Ao Nang or Krabi mainland for easier logistics",
      areaRecommendations: isHebrew
        ? ["או נאנג", "אזור התצפית בריילי", "עיר קראבי", "נופאראט תארה", "אזור המזח לאיים"]
        : ["Ao Nang", "Railay viewpoint area", "Krabi Town", "Nopparat Thara", "Island pier area"],
    },
  };

  return {
    ...base[name],
    nights,
    hotelArea: hotelAreaOverride || base[name].hotelArea,
  };
}

function buildTripBudget(
  input: CustomItineraryInput,
  segments: DestinationSegment[],
  transportation: TransportationLeg[],
): TripBudgetEstimate {
  const travelers = parseTravelers(input);
  const requestedBudget = parseBudgetAmount(input.budget);
  const internationalFlights =
    input.selectedFlight?.estimatedPrice
      ? input.selectedFlight.estimatedPrice * travelers
      : isThailandDestination(input.destination)
        ? 850 * travelers
        : Math.round(requestedBudget * 0.35);
  const hotels = segments.reduce((sum, segment) => sum + segment.hotelBudgetTotal, 0);
  const domesticTransportation = transportation.reduce((sum, leg) => sum + leg.estimatedTotalCost, 0);
  const food = Math.round(input.days * travelers * (input.preferences?.budgetStyle === "יוקרתי" ? 55 : input.preferences?.budgetStyle === "חסכוני" ? 24 : 36));
  const activities = Math.round(input.days * travelers * (input.preferences?.budgetStyle === "יוקרתי" ? 60 : input.preferences?.budgetStyle === "חסכוני" ? 22 : 38));
  const localTransport = Math.round(input.days * travelers * 18);
  const buffer = Math.round((internationalFlights + hotels + domesticTransportation + food + activities + localTransport) * 0.12);
  const total = internationalFlights + hotels + domesticTransportation + food + activities + localTransport + buffer;

  return {
    currency: "USD",
    travelers,
    internationalFlights,
    domesticTransportation,
    hotels,
    food,
    activities,
    localTransport,
    buffer,
    total,
  };
}

export function generateMultiDestinationItinerary(input: CustomItineraryInput): CustomItineraryDay[] {
  const plan = tripTypePlans[input.tripType];
  const tripPlan = buildTripPlan(input);
  const isHebrew = input.locale !== "en";
  const safeDays = Math.min(
    Math.max(...tripPlan.destinations.map((destination) => destination.dayEnd), input.days),
    22,
  );

  return Array.from({ length: safeDays }, (_, index) => {
    const day = index + 1;
    const segment =
      tripPlan.destinations.find((destination) => day >= destination.dayStart && day <= destination.dayEnd) ??
      tripPlan.destinations[tripPlan.destinations.length - 1];
    const transfer = tripPlan.transportation.find((leg) => {
      const nextSegment = tripPlan.destinations.find((destination) => destination.name === leg.to);
      return nextSegment?.dayStart === day;
    });
    const destinationInput: CustomItineraryInput = { ...input, destination: segment.name };
    const primaryArea = segment.areaRecommendations[index % segment.areaRecommendations.length];
    const secondaryArea = segment.areaRecommendations[(index + 1) % segment.areaRecommendations.length];
    const eveningArea = segment.areaRecommendations[(index + 2) % segment.areaRecommendations.length];
    const nightNumber = Math.min(Math.max(day - segment.dayStart + 1, 1), segment.nights);
    const routeDay = buildThailandRouteDayPlan({
      input,
      isHebrew,
      nightNumber,
      segment,
      transfer,
      tripPlan,
    });

    const morningPlace = createPlace({
      input: destinationInput,
      day,
      index,
      timeSlot: "בוקר" as ItineraryPlace["timeSlot"],
      baseName: primaryArea || pick(plan.attractions, index),
      category: (input.preferences?.environment === "טבע" ? "טבע" : "אטרקציה") as RecommendationCategory,
    });
    const afternoonPlace = createPlace({
      input: destinationInput,
      day,
      index: index + 1,
      timeSlot: "צהריים" as ItineraryPlace["timeSlot"],
      baseName: secondaryArea || pick(plan.attractions, index + 1),
      category: (input.preferences?.interests.includes("תרבות" as never) ? "תרבות" : "נוף") as RecommendationCategory,
    });
    const eveningPlace = createPlace({
      input: destinationInput,
      day,
      index: index + 2,
      timeSlot: "ערב" as ItineraryPlace["timeSlot"],
      baseName: eveningArea || pick(plan.restaurants, index),
      category: "מסעדה" as RecommendationCategory,
    });
    const flightNotes =
      input.selectedFlight && (day === 1 || day === safeDays)
        ? [
            day === 1
              ? isHebrew
                ? `טיסת הגעה: ${input.selectedFlight.airline} ${input.selectedFlight.flightNumber}, יציאה ${input.selectedFlight.departureTime} מ-${input.selectedFlight.originAirport}, נחיתה ${input.selectedFlight.arrivalTime} ב-${input.selectedFlight.destinationAirport}.`
                : `Arrival flight: ${input.selectedFlight.airline} ${input.selectedFlight.flightNumber}, depart ${input.selectedFlight.departureTime} from ${input.selectedFlight.originAirport}, arrive ${input.selectedFlight.arrivalTime} at ${input.selectedFlight.destinationAirport}.`
              : isHebrew
                ? `תכנון טיסת חזור: שמרו את היום קליל והשאירו מספיק זמן לשדה סביב ${input.selectedFlight.returnDepartureTime}.`
                : `Return flight planning: keep this day light and leave enough time for the airport around ${input.selectedFlight.returnDepartureTime}.`,
          ]
        : undefined;

    return {
      day,
      title: isHebrew
        ? `יום ${day}: ${segment.name} · ${input.tripType}`
        : `Day ${day}: ${segment.name} · ${input.tripType}`,
      destinationName: segment.name,
      region: segment.region,
      nightNumber,
      nightsInDestination: segment.nights,
      hotelArea: segment.hotelArea,
      hotelBudgetPerNight: segment.hotelBudgetPerNight,
      areaRecommendations: segment.areaRecommendations,
      routeTransfer: transfer,
      tripPlan,
      morning: routeDay?.morning ?? (transfer
        ? isHebrew
          ? `מעבר מ-${transfer.from} אל ${transfer.to}. שמרו על בוקר קל: העברה לשדה, טיסה, צ'ק-אין וזמן התאוששות.`
          : `Travel from ${transfer.from} to ${transfer.to}. Keep the morning light: airport transfer, flight, check-in, and recovery time.`
        : isHebrew
          ? `${pick(plan.mornings, index)} ב${segment.name}, עם דגש על אזור ${primaryArea}.`
          : `${pick(plan.mornings, index)} in ${segment.name}, focused around ${primaryArea}.`),
      afternoon: routeDay?.afternoon ?? (transfer
        ? isHebrew
          ? `הגעה אל ${segment.name}, צ'ק-אין באזור ${segment.hotelArea}, ובחירת פעילות רגועה אחת בקרבת מקום.`
          : `Arrive in ${segment.name}, check into ${segment.hotelArea}, and choose one nearby low-pressure activity.`
        : isHebrew
          ? `${pick(plan.afternoons, index)} ליד ${secondaryArea}. הקשר תקציבי: ${input.budget}.`
          : `${pick(plan.afternoons, index)} near ${secondaryArea}. Budget context: ${input.budget}.`),
      evening: routeDay?.evening ?? (isHebrew
        ? `${pick(plan.evenings, index)} באזור ${eveningArea}.`
        : `${pick(plan.evenings, index)} in ${eveningArea}.`),
      attractions: routeDay?.attractions ?? [
        isHebrew ? `${primaryArea} ב${segment.name}` : `${primaryArea} in ${segment.name}`,
        isHebrew ? `${secondaryArea} כאזור מומלץ` : `${secondaryArea} recommended area`,
      ],
      museums: routeDay?.museums,
      transportNotes: routeDay?.transportNotes,
      dailyAccessibilityNotes: routeDay?.accessibilityNotes,
      estimatedDailyCost: routeDay?.estimatedDailyCost,
      restaurant: pick(plan.restaurants, index),
      dailyTip: transfer
        ? isHebrew
          ? `${transfer.notes} עלות מעבר משוערת: $${transfer.estimatedCostPerPerson} לאדם.`
          : `${transfer.notes} Estimated transfer cost: $${transfer.estimatedCostPerPerson} per person.`
        : isHebrew
          ? `${pick(plan.tips, index)} כדאי ללון ליד ${segment.hotelArea} כדי לצמצם זמני מעבר יומיים.`
          : `${pick(plan.tips, index)} Stay near ${segment.hotelArea} to reduce daily transfer time.`,
      places: [morningPlace, afternoonPlace, eveningPlace],
      flightNotes,
    };
  });
}

function buildTripPlan(input: CustomItineraryInput): MultiDestinationTripPlan {
  const routesText = getUiTranslations(input.locale || "he").results.generatedRoutes;
  const routeOptions = isThailandDestination(input.destination)
    ? buildThailandRouteOptions(input)
    : [
        buildRouteOption(input, {
          id: "single-region",
          name: routesText["single-region"].name,
          whyThisRouteFits: routesText["single-region"].why,
          specs: buildDestinationSegments(input).map((destination) => ({
            name: destination.name,
            region: destination.region,
            nights: destination.nights,
            whyHere: destination.whyHere,
            hotelArea: destination.hotelArea,
            areaRecommendations: destination.areaRecommendations,
          })),
        }),
      ];
  const selected =
    routeOptions.find((option) => option.id === input.routeOptionId) ??
    routeOptions.find((option) => option.id === "accessible-relaxed" && hasAccessibilityNeeds(input)) ??
    routeOptions[0];

  return {
    countryOrRoute: isThailandDestination(input.destination)
      ? input.locale === "en"
        ? `Thailand: ${selected.destinations.map((destination) => destination.name).join(" -> ")}`
        : `תאילנד: ${selected.destinations.map((destination) => destination.name).join(" -> ")}`
      : input.destination,
    routeLogic: isThailandDestination(input.destination)
      ? selected.whyThisRouteFits
      : routesText["single-region"].why,
    selectedRouteId: selected.id,
    routeOptions,
    destinations: selected.destinations,
    transportation: selected.transportation,
    budget: selected.budget,
  };
}

function buildThailandRouteDayPlan({
  input,
  isHebrew,
  nightNumber,
  segment,
  transfer,
  tripPlan,
}: {
  input: CustomItineraryInput;
  isHebrew: boolean;
  nightNumber: number;
  segment: DestinationSegment;
  transfer?: TransportationLeg;
  tripPlan: MultiDestinationTripPlan;
}) {
  if (!isThailandDestination(input.destination)) return null;

  const routeId = tripPlan.selectedRouteId;
  const destination = canonicalDestination(segment.name);
  const routeTone =
    routeId === "accessible-relaxed"
      ? "accessible"
      : routeId === "islands-focused"
        ? "islands"
        : "classic";

  if (transfer) {
    return {
      morning: isHebrew
        ? `יום מעבר מ${transfer.from} אל ${transfer.to}: יציאה רגועה מהמלון, העברה מסודרת לשדה וטיסה פנימית עם זמן ביטחון.`
        : `Transfer day from ${transfer.from} to ${transfer.to}: easy hotel departure, planned airport transfer and domestic flight with buffer time.`,
      afternoon: isHebrew
        ? `הגעה ל${segment.name}, צ'ק-אין באזור ${segment.hotelArea}, מנוחה ופעילות קצרה ליד המלון בלבד.`
        : `Arrive in ${segment.name}, check into ${segment.hotelArea}, rest, and keep only one short nearby activity.`,
      evening: isHebrew
        ? `ארוחת ערב קרובה למלון וסידור יום המחר בלי נסיעות נוספות.`
        : `Dinner close to the hotel and a simple reset for the next day, with no extra transfers.`,
      attractions: isHebrew ? ["פעילות קצרה ליד המלון", "טיול ערב קצר באזור הלינה"] : ["Short nearby activity", "Easy evening walk near the hotel"],
      museums: isHebrew ? ["ללא מוזיאון ביום מעבר"] : ["No museum on transfer day"],
      transportNotes: [transfer.notes],
      accessibilityNotes: isHebrew
        ? ["לתאם מראש סיוע בשדה התעופה, רכב מתאים ומלון עם כניסה ללא מדרגות."]
        : ["Pre-book airport assistance, suitable vehicle support and a step-free hotel entrance."],
      estimatedDailyCost: transfer.estimatedTotalCost + tripPlan.budget.travelers * 55,
    };
  }

  const plans = routeDayContent(isHebrew, routeTone);
  const destinationPlans = plans[destination] ?? plans.Bangkok;
  const selected = destinationPlans[(nightNumber - 1) % destinationPlans.length];

  return {
    ...selected,
    estimatedDailyCost: selected.estimatedDailyCost * tripPlan.budget.travelers,
  };
}

function canonicalDestination(name: string): "Bangkok" | "Phuket" | "Koh Samui" | "Krabi" {
  if (/phuket|פוקט/i.test(name)) return "Phuket";
  if (/samui|סמוי/i.test(name)) return "Koh Samui";
  if (/krabi|קראבי|phi phi|פי פי/i.test(name)) return "Krabi";
  return "Bangkok";
}

function routeDayContent(isHebrew: boolean, tone: "classic" | "islands" | "accessible") {
  if (!isHebrew) {
    return {
      Bangkok: [
        {
          morning: "Grand Palace and Wat Pho with a timed arrival before the heat and crowds.",
          afternoon: "Siam or IconSiam lunch break, then Jim Thompson House or Bangkok Art and Culture Centre.",
          evening: "Riverside dinner cruise or an easy Asiatique evening.",
          attractions: ["Grand Palace", "Wat Pho", "Chao Phraya riverside"],
          museums: ["Jim Thompson House", "Bangkok Art and Culture Centre"],
          transportNotes: ["Use BTS/MRT where practical and private taxi for door-to-door comfort."],
          accessibilityNotes: ["Grand Palace surfaces can be uneven; keep a backup mall or riverside plan."],
          estimatedDailyCost: 95,
        },
        {
          morning: "Chatuchak, Or Tor Kor Market, or a calm food-focused neighborhood morning.",
          afternoon: "Rest at the hotel, then a short accessible mall or spa stop.",
          evening: "Sukhumvit dinner near the hotel.",
          attractions: ["Or Tor Kor Market", "Sukhumvit", "Siam"],
          museums: ["Museum Siam"],
          transportNotes: ["Avoid rush hour and keep rides short."],
          accessibilityNotes: ["Choose malls and restaurants with elevator access and accessible toilets."],
          estimatedDailyCost: 80,
        },
      ],
      Phuket: [
        {
          morning: tone === "accessible" ? "Step-free resort morning at Kata or Bang Tao." : "Kata or Karon beach morning with shaded breaks.",
          afternoon: "Old Phuket Town cafes, Sino-Portuguese streets and a short museum stop.",
          evening: "Sunset dinner at Promthep Cape or a quieter beach restaurant.",
          attractions: ["Kata Beach", "Old Phuket Town", "Promthep Cape"],
          museums: ["Thai Hua Museum"],
          transportNotes: ["Use private car transfers; distances are easier by pre-booked driver."],
          accessibilityNotes: ["Confirm ramp access at beach clubs and avoid steep viewpoint paths if mobility is limited."],
          estimatedDailyCost: 105,
        },
        {
          morning: tone === "islands" ? "Phang Nga Bay boat day with a reputable operator." : "Relaxed resort pool and beach time.",
          afternoon: tone === "islands" ? "James Bond Island scenery and lunch stop." : "Short local market or spa break.",
          evening: "Easy dinner near the hotel.",
          attractions: tone === "islands" ? ["Phang Nga Bay", "James Bond Island"] : ["Bang Tao", "Kamala", "Local night market"],
          museums: ["Phuket Mining Museum"],
          transportNotes: ["Boat days require advance checks for pier access and sea conditions."],
          accessibilityNotes: ["For wheelchair users, replace boat days with resort, old town and accessible beach club time."],
          estimatedDailyCost: tone === "islands" ? 140 : 85,
        },
      ],
      "Koh Samui": [
        {
          morning: "Bophut Fisherman's Village and a calm beach start.",
          afternoon: "Big Buddha area, short cafe stop and hotel rest.",
          evening: "Bophut dinner and night market if it is operating.",
          attractions: ["Bophut Fisherman's Village", "Big Buddha", "Choeng Mon"],
          museums: ["Local temple culture stop"],
          transportNotes: ["Use private drivers; island roads are short but not always walkable."],
          accessibilityNotes: ["Some temple areas have steps; keep a step-free cafe or beach alternative."],
          estimatedDailyCost: 90,
        },
        {
          morning: tone === "accessible" ? "Slow resort morning with beach wheelchair or pool access if available." : "Ang Thong marine park or a gentle beach day.",
          afternoon: tone === "accessible" ? "Short Choeng Mon cafe and spa stop." : "Snorkeling viewpoint or Lamai beach time.",
          evening: "Sunset dinner close to the hotel.",
          attractions: tone === "accessible" ? ["Choeng Mon", "Bophut", "Hotel beach"] : ["Ang Thong Marine Park", "Lamai", "Chaweng Noi"],
          museums: ["Local island culture stop"],
          transportNotes: ["Marine park days are weather dependent; confirm pier and boat comfort."],
          accessibilityNotes: ["For limited mobility, avoid boat-heavy days and keep activities clustered near the resort."],
          estimatedDailyCost: tone === "accessible" ? 75 : 135,
        },
      ],
      Krabi: [
        {
          morning: "Ao Nang beach and limestone cliff viewpoints.",
          afternoon: "Railay area by boat if conditions are comfortable.",
          evening: "Ao Nang dinner near the hotel.",
          attractions: ["Ao Nang", "Railay", "Nopparat Thara"],
          museums: ["Krabi local culture stop"],
          transportNotes: ["Longtail boats are scenic but can be difficult with luggage or mobility needs."],
          accessibilityNotes: ["Use mainland Krabi as the base for easier transfers."],
          estimatedDailyCost: 95,
        },
      ],
    };
  }

  return {
    Bangkok: [
      {
        morning: "הארמון הגדול וואט פו בהגעה מוקדמת, לפני החום והעומס.",
        afternoon: "הפסקת צהריים בסיאם או אייקון סיאם, ואז בית ג'ים תומפסון או מרכז האמנות של בנגקוק.",
        evening: "ארוחת ערב על הנהר או ערב קל באסיאטיק.",
        attractions: ["הארמון הגדול", "וואט פו", "נהר צ'או פראיה"],
        museums: ["בית ג'ים תומפסון", "מרכז האמנות והתרבות של בנגקוק"],
        transportNotes: ["להשתמש ב-BTS/MRT כשנוח, ובמונית פרטית למעברים מדלת לדלת."],
        accessibilityNotes: ["באזור הארמון יש משטחים לא אחידים; כדאי להכין חלופה בקניון או בטיילת הנהר."],
        estimatedDailyCost: 95,
      },
      {
        morning: "שוק אור טור קור או בוקר אוכל רגוע בשכונה נוחה להגעה.",
        afternoon: "מנוחה במלון ואז קניון נגיש, ספא קצר או פעילות ממוזגת.",
        evening: "ארוחת ערב בסוקומוויט קרוב למלון.",
        attractions: ["שוק אור טור קור", "סוקומוויט", "סיאם"],
        museums: ["מוזיאון סיאם"],
        transportNotes: ["להימנע משעות עומס ולשמור על נסיעות קצרות."],
        accessibilityNotes: ["להעדיף קניונים ומסעדות עם מעלית ושירותים נגישים."],
        estimatedDailyCost: 80,
      },
    ],
    Phuket: [
      {
        morning: tone === "accessible" ? "בוקר רגוע בריזורט ללא מדרגות בקאטה או באנג טאו." : "בוקר חוף בקאטה או קארון עם עצירות צל ומנוחה.",
        afternoon: "העיר העתיקה של פוקט, בתי קפה, רחובות סינו-פורטוגזיים ומוזיאון קצר.",
        evening: "ארוחת שקיעה בכף פרומטפ או במסעדת חוף שקטה יותר.",
        attractions: ["חוף קאטה", "העיר העתיקה של פוקט", "כף פרומטפ"],
        museums: ["מוזיאון תאי הואה"],
        transportNotes: ["להשתמש בהעברות פרטיות; המרחקים בפוקט נוחים יותר עם נהג מוזמן מראש."],
        accessibilityNotes: ["לוודא רמפה במועדוני חוף ולהימנע משבילי תצפית תלולים כשיש מגבלת ניידות."],
        estimatedDailyCost: 105,
      },
      {
        morning: tone === "islands" ? "יום שייט במפרץ פאנג נגה עם מפעיל אמין ובדיקת תנאי ים." : "בוקר בריכה וחוף רגוע בריזורט.",
        afternoon: tone === "islands" ? "נופי אי ג'יימס בונד ועצירת צהריים מסודרת." : "שוק מקומי קצר, ספא או מנוחה במלון.",
        evening: "ארוחת ערב קלה ליד המלון.",
        attractions: tone === "islands" ? ["מפרץ פאנג נגה", "אי ג'יימס בונד"] : ["באנג טאו", "קמאלה", "שוק ערב מקומי"],
        museums: ["מוזיאון הכרייה של פוקט"],
        transportNotes: ["בימי שייט צריך לבדוק מראש נגישות למזח, גובה העלייה לסירה ותנאי ים."],
        accessibilityNotes: ["למשתמשים בכיסא גלגלים מומלץ להחליף יום שייט בזמן ריזורט, עיר עתיקה ומועדון חוף נגיש."],
        estimatedDailyCost: tone === "islands" ? 140 : 85,
      },
    ],
    "Koh Samui": [
      {
        morning: "כפר הדייגים בבופוט ובוקר חוף רגוע.",
        afternoon: "אזור הבודהה הגדול, עצירת קפה קצרה ומנוחה במלון.",
        evening: "ארוחת ערב בבופוט ושוק לילה אם הוא פעיל.",
        attractions: ["כפר הדייגים בבופוט", "בודהה הגדול", "צ'ואנג מון"],
        museums: ["עצירת תרבות במקדש מקומי"],
        transportNotes: ["להשתמש בנהג פרטי; המרחקים באי קצרים אך לא תמיד נוחים להליכה."],
        accessibilityNotes: ["בחלק מהמקדשים יש מדרגות; לשמור חלופה של בית קפה או חוף ללא מדרגות."],
        estimatedDailyCost: 90,
      },
      {
        morning: tone === "accessible" ? "בוקר ריזורט איטי עם גישה לבריכה או לחוף נגיש אם קיים." : "פארק ימי אנג תונג או יום חוף רגוע.",
        afternoon: tone === "accessible" ? "עצירת קפה קצרה בצ'ואנג מון וספא קרוב." : "נקודת שנורקלינג, תצפית או זמן חוף בלמאי.",
        evening: "ארוחת שקיעה קרובה למלון.",
        attractions: tone === "accessible" ? ["צ'ואנג מון", "בופוט", "חוף המלון"] : ["הפארק הימי אנג תונג", "למאי", "צ'אוונג נוי"],
        museums: ["עצירת תרבות מקומית באי"],
        transportNotes: ["ימי פארק ימי תלויים במזג אוויר; לבדוק מראש נוחות מזח וסירה."],
        accessibilityNotes: ["במגבלת ניידות עדיף להימנע מימים מרובי סירות ולרכז פעילויות ליד הריזורט."],
        estimatedDailyCost: tone === "accessible" ? 75 : 135,
      },
    ],
    Krabi: [
      {
        morning: "חוף או נאנג ותצפיות מצוקי הגיר.",
        afternoon: "אזור ריילי בסירה רק אם תנאי הים והעלייה לסירה נוחים.",
        evening: "ארוחת ערב באו נאנג ליד המלון.",
        attractions: ["או נאנג", "ריילי", "נופאראט תארה"],
        museums: ["עצירת תרבות מקומית בקראבי"],
        transportNotes: ["סירות לונגטייל יפות אך יכולות להיות מאתגרות עם מזוודות או צרכי ניידות."],
        accessibilityNotes: ["עדיף ללון ביבשת קראבי כדי לפשט מעברים ולצמצם סחיבת ציוד."],
        estimatedDailyCost: 95,
      },
    ],
  };
}

export function buildItineraryPrompt(input: CustomItineraryInput) {
  return [
    "Generate a realistic multi-destination travel plan as structured JSON.",
    "Do not create generic country-level days. Split the route into real cities, islands, or regions.",
    "For Thailand, use Bangkok, Phuket, and Koh Samui unless the user explicitly asks otherwise.",
    "For Thailand trips longer than 5 nights, always produce multiple selectable route options, never a one-city country-level plan.",
    "For 14-night Thailand trips include Classic, Islands focused, and Accessible relaxed route options.",
    "If accessibility needs are selected, avoid difficult ferry-heavy transfers, prefer flight-first domestic moves, step-free hotels, accessible transport, relaxed pace, and explain accessibility notes per destination.",
    "Each destination must include nights, best hotel area, hotel budget per night, and city-area recommendations.",
    "Each transfer must include mode, duration, route, notes, and estimated real-world flight or ferry cost.",
    "Each day must include destination, region, morning, afternoon, evening, food suggestion, areas, and practical timing.",
    "The route must be geographically logical and avoid unnecessary backtracking.",
    `User input: destination=${input.destination}; days=${input.days}; budget=${input.budget}; tripType=${input.tripType}.`,
  ].join("\n");
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
