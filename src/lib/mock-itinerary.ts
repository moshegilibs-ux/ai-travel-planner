import { Itinerary, Recommendation, TimelineActivity, TravelFormData } from "@/lib/itinerary-types";
import {
  activityIntensityOptions,
  Interest,
  budgetRangeOptions,
  cyclingTypeOptions,
  dietaryOptions,
  interestOptions,
  kosherLevelOptions,
  labelFor,
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
} from "@/lib/travel-options";

type ActivityTemplate = {
  place: string;
  activity: string;
  description: string;
  cost: string;
  rating: number;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

const interestTemplates: Record<Interest, ActivityTemplate> = {
  hiking: {
    place: "מסלול טבע מרכזי עם נקודת תצפית",
    activity: "הליכה מודרכת בקצב מותאם",
    description: "מסלול נוח שמכניס טבע אמיתי לתוך היום בלי לשבור את הלו״ז.",
    cost: "חינם עד $15",
    rating: 4.6,
  },
  waterfalls: {
    place: "מפל מומלץ באזור היעד",
    activity: "ביקור במפל ושביל צילום קצר",
    description: "עצירה מרעננת שמתאימה במיוחד לחובבי טבע וצילום.",
    cost: "$5-$20",
    rating: 4.7,
  },
  beaches: {
    place: "חוף מרכזי עם שירותים נוחים",
    activity: "זמן חוף, שחייה ושקיעה",
    description: "חוף נגיש עם אפשרות לשלב מנוחה, קפה וספורט ימי קל.",
    cost: "חינם עד $25",
    rating: 4.5,
  },
  islands: {
    place: "מעבר לאי סמוך או מפרץ מומלץ",
    activity: "יום אי בקצב רגוע",
    description: "יום שנבנה סביב מעבורת, חוף נבחר וזמן מנוחה בלי לחץ.",
    cost: "$20-$70",
    rating: 4.8,
  },
  nightlife: {
    place: "רובע הבילויים המרכזי",
    activity: "ברים, הופעה או מועדון",
    description: "ערב חי באזור בטוח ונוח לחזרה למלון.",
    cost: "$25-$90",
    rating: 4.4,
  },
  street_food: {
    place: "שוק אוכל מקומי",
    activity: "סיור טעימות רחוב",
    description: "טעימות קצרות שמציגות את המטבח המקומי בלי להזמין שולחן יקר.",
    cost: "$10-$30",
    rating: 4.7,
  },
  fine_dining: {
    place: "מסעדת שף באזור מרכזי",
    activity: "ארוחת ערב מתוכננת מראש",
    description: "חוויה קולינרית שמתאימה לערב זוגי, ירח דבש או טיול פרימיום.",
    cost: "$80-$180",
    rating: 4.8,
  },
  photography_spots: {
    place: "נקודת צילום איקונית",
    activity: "שעת זהב לצילומים",
    description: "עצירה בשעה יפה עם זוויות צילום מוכרות ונוף פתוח.",
    cost: "חינם",
    rating: 4.6,
  },
  museums: {
    place: "מוזיאון מוביל בעיר",
    activity: "ביקור מוזיאון ממוקד",
    description: "בחירה טובה ליום חם, גשום או למשפחות שרוצות קצב רגוע.",
    cost: "$10-$35",
    rating: 4.5,
  },
  shopping_malls: {
    place: "קניון מרכזי ונגיש",
    activity: "קניות ומנוחה במתחם ממוזג",
    description: "מתאים לשילוב קל בין קניות, אוכל והפסקה מהחום.",
    cost: "לפי קניות",
    rating: 4.2,
  },
  local_markets: {
    place: "שוק מקומי מסורתי",
    activity: "שיטוט בין דוכנים ומזכרות",
    description: "חוויה מקומית שמייצרת מפגש עם אוכל, צבעים ואנשים.",
    cost: "$10-$50",
    rating: 4.6,
  },
  adventure_sports: {
    place: "מתחם פעילות אתגרית מוסמך",
    activity: "אומגה, רפטינג או טרקטורונים",
    description: "אטרקציה עם אדרנלין שמתאימה למטיילים פעילים.",
    cost: "$45-$130",
    rating: 4.5,
  },
  snorkeling: {
    place: "מפרץ שנורקלינג מומלץ",
    activity: "שנורקלינג מודרך",
    description: "פעילות מים נגישה יחסית שמוסיפה חוויה ימית בלי יום צלילה מלא.",
    cost: "$25-$80",
    rating: 4.7,
  },
  diving: {
    place: "מועדון צלילה מוסמך",
    activity: "צלילת היכרות או צלילה מודרכת",
    description: "מתאים למי שרוצה חוויה ימית עמוקה יותר, עם בדיקת תנאי ים מראש.",
    cost: "$70-$160",
    rating: 4.8,
  },
  wellness_spa: {
    place: "ספא מומלץ באזור המלונות",
    activity: "מסאז׳, בריכה וטיפול זוגי",
    description: "עוגן מרגיע לירח דבש, יוקרה או יום התאוששות אחרי טיסות.",
    cost: "$50-$180",
    rating: 4.6,
  },
  jewish_heritage: {
    place: "אתר מורשת יהודית או בית כנסת היסטורי",
    activity: "סיור מורשת יהודית",
    description: "תחנה משמעותית למטיילים דתיים, משפחות ושומרי מסורת.",
    cost: "$5-$30",
    rating: 4.5,
  },
  chabad_houses: {
    place: "בית חב״ד המקומי",
    activity: "בדיקת זמני תפילה, שבת וסיוע למטיילים",
    description: "עוגן חשוב לשומרי שבת וכשרות, במיוחד ביעדים רחוקים.",
    cost: "לפי תרומה / ארוחה",
    rating: 4.7,
  },
  kosher_restaurants: {
    place: "מסעדה כשרה מומלצת",
    activity: "ארוחה כשרה מתוכננת",
    description: "עצירה שמאפשרת יום טיול רגוע בלי חיפוש אוכל בזמן אמת.",
    cost: "$20-$60",
    rating: 4.4,
  },
};

const thailandRoute = [
  {
    area: "בנגקוק",
    theme: "נחיתה רכה, שווקים ואוכל",
    place: "Grand Palace ו-Asiatique",
  },
  {
    area: "קוסמוי",
    theme: "חופים, ספא ואוכל כשר לפי תיאום",
    place: "Chaweng Beach ו-Fisherman's Village",
  },
  {
    area: "קו פנגן",
    theme: "איים, תצפיות ושנורקלינג",
    place: "Haad Rin ו-Ang Thong Marine Park",
  },
  {
    area: "פוקט",
    theme: "איים, שייט ופינאלה מפנקת",
    place: "Old Phuket Town ו-Phi Phi Islands",
  },
];

function isThailand(destination: string) {
  return /thailand|תאילנד|בנגקוק|פוקט|קוסמוי|קו סמוי/i.test(destination);
}

function googleMapsUrl(place: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
}

function profileTags(form: TravelFormData) {
  const ridingTags =
    form.travelMode === "motorcycle"
      ? ["טיול אופנועים", "כבישים נופיים"]
      : form.travelMode === "bicycle"
        ? ["טיול אופניים", labelFor(cyclingTypeOptions, form.cyclingType)]
        : form.travelMode === "ebike"
          ? ["E-bike", "עצירות טעינה"]
          : [];
  const accessibilityTags =
    form.mobilityLevel === "wheelchair"
      ? ["נגיש לכיסא גלגלים", "ללא מדרגות"]
      : form.mobilityLevel === "senior_friendly"
        ? ["ידידותי לגיל השלישי", "קצב רגוע"]
        : form.mobilityLevel === "limited_walking"
          ? ["הליכה מוגבלת", "עצירות מנוחה"]
          : [];

  return [
    ...ridingTags,
    labelFor(travelStyleOptions, form.travelStyle),
    ...accessibilityTags,
    labelFor(budgetRangeOptions, form.budgetRange),
    labelFor(paceOptions, form.pace),
    ...form.interests.map((interest) => labelFor(interestOptions, interest)),
  ].slice(0, 8);
}

function isRidingTrip(form: TravelFormData) {
  return form.travelMode !== "regular";
}

function isCyclingTrip(form: TravelFormData) {
  return form.travelMode === "bicycle" || form.travelMode === "ebike";
}

function ridingDistanceFor(form: TravelFormData, period: TimelineActivity["period"]) {
  if (!isRidingTrip(form)) {
    return "לא רלוונטי";
  }

  const daily = form.preferredDailyRidingDistance;
  const factor = period === "morning" ? 0.45 : period === "afternoon" ? 0.4 : 0.15;
  const distance = Math.max(3, Math.round(daily * factor));

  return `${distance} ק״מ`;
}

function ridingDurationFor(form: TravelFormData, period: TimelineActivity["period"]) {
  if (!isRidingTrip(form)) {
    return "לא רלוונטי";
  }

  if (form.travelMode === "motorcycle") {
    return period === "evening" ? "25-45 דקות רכיבה" : "1.5-2.5 שעות רכיבה";
  }

  if (form.travelMode === "ebike") {
    return period === "evening" ? "20-35 דקות רכיבה" : "60-110 דקות רכיבה";
  }

  return period === "evening" ? "20-40 דקות רכיבה" : "75-140 דקות רכיבה";
}

function fuelOrChargingStopFor(form: TravelFormData, area: string) {
  if (form.travelMode === "motorcycle") {
    return `תחנת דלק מומלצת ביציאה מ${area}, לבדוק לחץ אוויר ומים לפני כביש הררי.`;
  }

  if (form.travelMode === "ebike") {
    return `עצירת טעינה placeholder בבית קפה/מלון ב${area}; להביא מטען ומתאם.`;
  }

  if (form.travelMode === "bicycle") {
    return `נקודת מילוי מים וחנות אופניים placeholder ב${area}.`;
  }

  return "לא נדרש.";
}

function routeDifficultyText(form: TravelFormData) {
  const base = labelFor(routeDifficultyOptions, form.routeDifficulty);
  const elevation =
    form.travelMode === "motorcycle"
      ? "כביש מפותל עם עליות מתונות"
      : form.cyclingType === "mtb" || form.offRoadPreference
        ? "שטח/שבילים עם עליות קצרות"
        : form.cyclingType === "road"
          ? "כביש עם עליות מתונות ושוליים משתנים"
          : "שבילים קלים יחסית";

  return `${base} · ${elevation}`;
}

function needsAccessiblePlan(form: TravelFormData) {
  return (
    form.mobilityLevel !== "full" ||
    form.needElevatorAccess ||
    form.needWheelchairAccessibleTransportation ||
    form.avoidStairs ||
    form.needFrequentRestBreaks ||
    form.accessibleBathroomRequired ||
    form.walkingDifficulty !== "none"
  );
}

function walkingDistanceFor(form: TravelFormData, period: TimelineActivity["period"]) {
  if (form.mobilityLevel === "wheelchair") {
    return period === "evening" ? "עד 150 מטר" : "150-300 מטר";
  }

  if (form.mobilityLevel === "limited_walking" || form.mobilityLevel === "senior_friendly") {
    return period === "evening" ? "עד 250 מטר" : "250-600 מטר";
  }

  return period === "morning" ? "700-1,200 מטר" : "400-900 מטר";
}

function accessibilityTagsFor(form: TravelFormData) {
  const tags = ["מסלול נגיש יותר", "עצירת מנוחה קרובה"];

  if (form.mobilityLevel === "wheelchair") {
    tags.push("נגיש לכיסא גלגלים", "שירותים נגישים");
  }

  if (form.mobilityLevel === "senior_friendly") {
    tags.push("ידידותי לגיל השלישי");
  }

  if (form.avoidStairs || form.needElevatorAccess) {
    tags.push("עדיפות למעלית", "ללא מדרגות");
  }

  return tags;
}

function createRecommendation(
  name: string,
  area: string,
  reason: string,
  price: string,
  rating = 4.5,
  accessibilityNotes = "יש לאמת נגישות מלאה מול המקום לפני הגעה.",
  isAccessible = true,
): Recommendation {
  return {
    name,
    area,
    reason,
    approximatePrice: price,
    rating,
    imageUrl: fallbackImage,
    mapUrl: googleMapsUrl(`${name} ${area}`),
    accessibilityNotes,
    isAccessible,
  };
}

function createActivity(
  form: TravelFormData,
  template: ActivityTemplate,
  period: TimelineActivity["period"],
  dayIndex: number,
  area: string,
): TimelineActivity {
  const timeByPeriod = {
    morning: form.dayPreference === "night" ? ["10:30", "12:30"] : ["08:30", "11:00"],
    afternoon: ["13:30", "16:00"],
    evening: form.dayPreference === "morning" ? ["18:00", "20:00"] : ["20:00", "22:30"],
  } as const;
  const [startTime, endTime] = timeByPeriod[period];
  const accessiblePlan = needsAccessiblePlan(form);
  const ridingTrip = isRidingTrip(form);
  const transportation =
    form.travelMode === "motorcycle"
      ? "אופנוע, עם עדיפות לכבישים נופיים ובטוחים"
      : form.travelMode === "bicycle"
        ? "אופניים, שבילים בטוחים וכבישים שקטים"
        : form.travelMode === "ebike"
          ? "אופניים חשמליים, עם עצירות טעינה"
          :
    form.needWheelchairAccessibleTransportation || form.mobilityLevel === "wheelchair"
      ? "מונית נגישה / רכב עם מעלון בתיאום מראש"
      : labelFor(transportationOptions, form.preferredTransportation);

  return {
    period,
    startTime,
    endTime,
    place: isThailand(form.destination) && period !== "evening" ? `${template.place} - ${area}` : template.place,
    activity: template.activity,
    description: accessiblePlan
      ? `${template.description} נבחרה גרסה עם כניסה נוחה, פחות הליכה ונקודות מנוחה.`
      : template.description,
    travelTime: accessiblePlan ? "10-20 דקות, מעבר קצר וממוקד" : dayIndex % 2 === 0 ? "15-25 דקות" : "25-40 דקות",
    transportation,
    approximateCost: template.cost,
    walkingDistance: walkingDistanceFor(form, period),
    ridingDistance: ridingDistanceFor(form, period),
    ridingDuration: ridingDurationFor(form, period),
    elevationNote: ridingTrip
      ? form.travelMode === "motorcycle"
        ? "עליות ופיתולים בינוניים; לבדוק מזג אוויר וראות לפני היציאה."
        : form.cyclingType === "mtb" || form.offRoadPreference
          ? "עליות קצרות וקטעי שביל; מתאים רק עם ציוד שטח."
          : "עלייה מתונה, לבחור מסלול עם שוליים/שביל אופניים ככל האפשר."
      : "לא רלוונטי.",
    routeDifficulty: ridingTrip ? routeDifficultyText(form) : "מסלול רגיל",
    fuelOrChargingStop: fuelOrChargingStopFor(form, area),
    accessibilityNotes:
      form.mobilityLevel === "wheelchair"
        ? "לתאם מראש כניסה נגישה, מעלית ושירותים נגישים; להימנע משבילים תלולים או חול עמוק."
        : form.mobilityLevel === "senior_friendly" || form.mobilityLevel === "limited_walking"
          ? "המסלול מקצר הליכה, מעדיף ישיבה קרובה ומוסיף זמן מנוחה לפני המעבר הבא."
          : "נגישות בסיסית סבירה; מומלץ לאמת שעות עומס וזמינות מעליות.",
    restStopSuggestion:
      period === "afternoon"
        ? "הפסקת קפה/שירותים של 45 דקות לפני פעילות הערב."
        : "ספסלים או בית קפה קרוב למנוחה קצרה.",
    accessibilityTags: accessibilityTagsFor(form),
    matchReason: ridingTrip
      ? `מותאם ל${labelFor(travelModeOptions, form.travelMode)}, ניסיון ${labelFor(ridingExperienceOptions, form.ridingExperience)}, העדפה ל${labelFor(routePriorityOptions, form.routePriority)} וקושי ${labelFor(routeDifficultyOptions, form.routeDifficulty)}.`
      : `מותאם ל${labelFor(travelStyleOptions, form.travelStyle)}, רמת ניידות ${labelFor(mobilityOptions, form.mobilityLevel)} ועניין ב${template.activity}.`,
    mapUrl: googleMapsUrl(`${template.place} ${area}`),
    imageUrl: fallbackImage,
    rating: template.rating,
  };
}

function dailyRestaurants(form: TravelFormData, area: string): Recommendation[] {
  const needsKosher =
    form.dietaryPreference === "kosher" ||
    form.kosherLevel !== "not_needed" ||
    form.travelStyle === "kosher" ||
    form.travelStyle === "religious";

  if (needsKosher) {
    return [
      createRecommendation("Kosher Place Placeholder", area, "מסעדה כשרה לאימות לפני הזמנה", "$20-$55", 4.3, "לבקש שולחן נגיש ולוודא שאין מדרגות בכניסה."),
      createRecommendation("Chabad Meal Option", area, "אפשרות לארוחות שבת/חג בתיאום מראש", "לפי תרומה", 4.6, "לתאם מקום ישיבה נוח, שירותים נגישים וגישה ללא מדרגות."),
    ];
  }

  if (form.travelStyle === "luxury" || form.interests.includes("fine_dining")) {
    return [
      createRecommendation("Fine Dining Placeholder", area, "חוויה קולינרית איכותית לערב מרכזי", "$90-$180", 4.8, "לבקש כניסה נגישה, מעלית ושולחן קרוב לכניסה."),
      createRecommendation("Rooftop Dinner Placeholder", area, "אווירה יוקרתית ונוף לעיר", "$70-$140", 4.6, "חשוב לוודא מעלית פעילה וגישה נוחה לגג."),
    ];
  }

  return [
    createRecommendation("Local Market Bites", area, "טעימות מקומיות בתקציב נוח", "$10-$25", 4.5, "לבחור כניסה רחבה ושעות פחות עמוסות; לא כל דוכן נגיש.", false),
    createRecommendation("Family Friendly Cafe", area, "עצירה קלה שמתאימה גם לילדים ולהורים מבוגרים", "$15-$35", 4.4, "מקום ישיבה נוח ושירותים קרובים."),
  ];
}

export function generateMockItinerary(form: TravelFormData): Itinerary {
  const interests: Interest[] = form.interests.length
    ? form.interests
    : ["local_markets", "photography_spots", "beaches"];
  const route = isThailand(form.destination) ? thailandRoute : [];
  const needsShabbatPlan = form.keepShabbat !== "no";
  const accessiblePlan = needsAccessiblePlan(form);
  const ridingTrip = isRidingTrip(form);
  const cyclingTrip = isCyclingTrip(form);

  const days = Array.from({ length: form.days }, (_, index) => {
    const routeStop = route[index % route.length];
    const area = routeStop?.area ?? `${form.destination} - אזור מומלץ ${index + 1}`;
    const theme = routeStop?.theme ?? labelFor(interestOptions, interests[index % interests.length]);
    const morning = interestTemplates[interests[index % interests.length]];
    const afternoon = interestTemplates[interests[(index + 1) % interests.length]];
    const eveningInterest =
      needsShabbatPlan && index === 5 ? "chabad_houses" : interests[(index + 2) % interests.length];
    const evening = interestTemplates[eveningInterest];
    const activities = [
      createActivity(form, morning, "morning", index, area),
      createActivity(form, afternoon, "afternoon", index, area),
      createActivity(form, evening, "evening", index, area),
    ];

    return {
      day: index + 1,
      title: `יום ${index + 1}: ${theme}`,
      area,
      theme,
      flowNote:
        accessiblePlan
          ? `יום עם מעט מעברים, אזור גיאוגרפי אחד ומנוחה מובנית. עוגן מרכזי: ${routeStop?.place ?? area}.`
          : routeStop?.place ??
            "היום בנוי כרצף הגיוני: פעילות מרכזית בבוקר, מעבר קצר בצהריים וערב קל באזור הלינה.",
      estimatedDailyCost:
        form.budgetRange === "luxury"
          ? "$220-$420 לאדם"
          : form.budgetRange === "budget"
            ? "$45-$95 לאדם"
            : "$90-$180 לאדם",
      totalWalkingDistance:
        form.mobilityLevel === "wheelchair"
          ? "עד 700 מטר מצטבר, עם אפשרות לקיצור"
          : accessiblePlan
            ? "900-1,500 מטר מצטבר"
            : "2-4 ק״מ מצטבר",
      totalRidingDistance: ridingTrip
        ? `${Math.max(8, form.preferredDailyRidingDistance - 10)}-${form.preferredDailyRidingDistance + 15} ק״מ`
        : "לא רלוונטי",
      ridingSummary: ridingTrip
        ? form.travelMode === "motorcycle"
          ? `יום רכיבה נופי עם כבישים מפותלים, עצירת דלק אחת לפחות ומנוחת רוכבים כל 90 דקות.`
          : `יום רכיבה ${labelFor(cyclingTypeOptions, form.cyclingType)} עם עצירות מים, בדיקת עליות ושמירה על מרחק יומי סביב ${form.preferredDailyRidingDistance} ק״מ.`
        : "יום טיול רגיל ללא רכיבה מתוכננת.",
      scenicHighlights: ridingTrip
        ? [
            "כביש נופי עם נקודות צילום בטוחות",
            form.routePriority === "fast"
              ? "קטע מעבר יעיל עם פחות עצירות"
              : "קטע רכיבה איטי יותר לטובת נוף ועצירות",
            form.offRoadPreference ? "אפשרות שביל/שטח placeholder לבדיקה מקומית" : "העדפה לכבישים סלולים ובטוחים",
          ]
        : ["נקודת צילום מרכזית", "מעבר קצר בין אזורים"],
      riderTips: ridingTrip
        ? [
            form.travelMode === "motorcycle"
              ? "לתדלק לפני כבישים הרריים ולבדוק תחזית רוח/גשם."
              : "למלא מים לפני היציאה ולבדוק זמינות שבילי אופניים.",
            form.travelMode === "ebike"
              ? "לתכנן טעינה בצהריים ולהביא מטען נוסף."
              : "לתכנן עצירת מנוחה כל 60-90 דקות.",
            form.groupRidingSupport
              ? "לקבוע מוביל ומאסף, נקודות מפגש וחוקי עקיפה בקבוצה."
              : "לשתף מסלול ו-ETA עם איש קשר.",
          ]
        : ["בדקו שעות פתיחה ועומסים לפני יציאה."],
      accessibilitySummary:
        form.mobilityLevel === "wheelchair"
          ? "היום מתוכנן סביב כניסות נגישות, שירותים נגישים, מעליות ותחבורה נגישה בתיאום מראש."
          : accessiblePlan
            ? "היום מקצר הליכות, מצמצם מדרגות, מוסיף עצירות מנוחה ומעדיף מקומות עם מעלית."
            : "יום רגיל עם בדיקת נגישות בסיסית לפני הגעה.",
      restBreaks: accessiblePlan
        ? ["11:15-11:45 מנוחה וקפה", "16:00-17:00 חזרה למלון או ישיבה ממוזגת"]
        : ["הפסקה גמישה בין פעילות הצהריים לערב"],
      activities,
      restaurants: dailyRestaurants(form, area),
      budgetTip:
        form.budgetRange === "budget"
          ? "שלבו שווקים ותחבורה ציבורית, ושמרו אטרקציה בתשלום אחת ליום."
          : "הזמינו מראש מסעדות/אטרקציות מרכזיות כדי לקבל שעות טובות ולצמצם נסיעות.",
      travelerFit: ridingTrip
        ? `היום מתאים ל${labelFor(travelModeOptions, form.travelMode)} בסגנון ${labelFor(ridingStyleOptions, form.ridingStyle)}, ניסיון ${labelFor(ridingExperienceOptions, form.ridingExperience)} ותמיכה בנגישות ${labelFor(mobilityOptions, form.mobilityLevel)}.`
        : `היום מתאים ל${labelFor(travelerOptions, form.travelers)} בסגנון ${labelFor(travelStyleOptions, form.travelStyle)}, קצב ${accessiblePlan ? "מופחת ונגיש" : labelFor(paceOptions, form.pace)} ורמת ניידות ${labelFor(mobilityOptions, form.mobilityLevel)}.`,
    };
  });

  return {
    destination: form.destination,
    heroImageUrl: fallbackImage,
    summary: `מסלול ${form.days} ימים ל${form.destination} שמותאם ל${labelFor(travelModeOptions, form.travelMode)}, ${labelFor(travelStyleOptions, form.travelStyle)}, ${labelFor(dietaryOptions, form.dietaryPreference)}, תקציב ${labelFor(budgetRangeOptions, form.budgetRange)} וקצב ${labelFor(paceOptions, form.pace)}.`,
    profileSummary: `מטיילים: ${labelFor(travelerOptions, form.travelers)}. כשרות: ${labelFor(kosherLevelOptions, form.kosherLevel)}. שבת: ${labelFor(shabbatOptions, form.keepShabbat)}. תחבורה: ${labelFor(transportationOptions, form.preferredTransportation)}.`,
    routeNotes: isThailand(form.destination)
      ? [
          "דוגמת תאילנד: בנגקוק לפתיחה עירונית, קוסמוי למנוחה, קו פנגן לטבע ימי ופוקט לסיום מפנק.",
          "מעברים בין איים דורשים בדיקת טיסות/מעבורות לפי עונה ומזג אוויר.",
          needsShabbatPlan
            ? "לשומרי שבת: עדיף למקם שבת בבנגקוק/פוקט ליד בית חב״ד ואוכל כשר."
            : "אפשר לשלב מעברי איים גם בסופי שבוע, בכפוף לזמינות מעבורות.",
        ]
      : [
          "המסלול שומר על זרימה יומית ריאלית ומצמצם קפיצות מיותרות בין אזורים.",
          accessiblePlan
            ? "נגישות: הלו״ז מפחית מעברים, מוסיף מנוחות, מעדיף מעליות ומקומות עם שירותים נגישים."
            : "נגישות: מומלץ לאמת זמינות מעליות ושירותים נגישים באטרקציות המרכזיות.",
          needsShabbatPlan
            ? "נוספה התייחסות לשבת, תפילות ואוכל כשר לפי צורך."
            : "ניתן להחליף בין ימים לפי מזג אוויר ושעות פתיחה.",
        ],
    mobilitySummary:
      accessiblePlan
        ? `תוכנית ידידותית לניידות: עד ${form.maxWalkingTimePerDay} דקות הליכה ביום, ${labelFor(walkingDifficultyOptions, form.walkingDifficulty)}, עוצמת פעילות ${labelFor(activityIntensityOptions, form.preferredActivityIntensity)}.`
        : "תוכנית רגילה עם אפשרות להחליף פעילויות למסלול נגיש יותר לפי צורך.",
    accessibilityHighlights: [
      form.mobilityLevel === "wheelchair"
        ? "תג נגיש לכיסא גלגלים נוסף לפעילויות עם צורך בתיאום מראש."
        : "נוספו תגי נגישות ורמת הליכה לכל פעילות.",
      form.needElevatorAccess || form.avoidStairs
        ? "המסלול מעדיף מעליות ונמנע ממדרגות ככל האפשר."
        : "מומלץ לוודא מעליות במלונות ואטרקציות מרכזיות.",
      form.needFrequentRestBreaks || form.mobilityLevel === "senior_friendly"
        ? "נוספו עצירות מנוחה מובנות בין פעילויות."
        : "עצירות מנוחה גמישות מופיעות בכל יום.",
      form.accessibleBathroomRequired
        ? "הועדפו מקומות עם שירותים נגישים או נקודת עצירה סמוכה."
        : "שירותים נגישים מסומנים כהמלצת בדיקה לפני הגעה.",
    ],
    travelModeSummary: ridingTrip
      ? form.travelMode === "motorcycle"
        ? `טיול אופנועים עם דגש על ${labelFor(routePriorityOptions, form.routePriority)}, מרחק יומי סביב ${form.preferredDailyRidingDistance} ק״מ, עצירות דלק ומלונות ידידותיים לרוכבים.`
        : `טיול ${labelFor(travelModeOptions, form.travelMode)} מסוג ${labelFor(cyclingTypeOptions, form.cyclingType)}, מרחק יומי סביב ${form.preferredDailyRidingDistance} ק״מ, עצירות מים${form.travelMode === "ebike" ? " וטעינה" : ""}.`
      : "טיול רגיל ללא מצב רכיבה פעיל.",
    ridingHighlights: ridingTrip
      ? [
          form.travelMode === "motorcycle"
            ? "כבישים נופיים ומפותלים עם עצירות רוכבים"
            : "מסלולים ידידותיים לאופניים עם בדיקת קושי ועליות",
          form.needRentalOptions
            ? "נוספו placeholders להשכרת אופנוע/אופניים"
            : "ניתן להוסיף ספקי השכרה חיצוניים בהמשך",
          form.needGearRecommendations
            ? "נוספה רשימת ציוד והכנה"
            : "ציוד בסיסי מסומן כהמלצה כללית",
          form.groupRidingSupport
            ? "תמיכה ברכיבה קבוצתית: מוביל/מאסף ונקודות מפגש"
            : "מתאים גם לרוכב/ת יחיד/ה עם שיתוף מסלול",
        ]
      : ["מצב רכיבה לא הופעל."],
    equipmentRecommendations: ridingTrip
      ? [
          form.travelMode === "motorcycle"
            ? "קסדה מלאה, כפפות, מעיל ממוגן, שכבת גשם ומחזיק טלפון יציב."
            : "קסדה, כפפות, משאבה, פנימית/ערכת תיקון, תאורה קדמית ואחורית.",
          cyclingTrip ? "שני בקבוקי מים, חטיף אנרגיה ומנעול קל." : "ערכת עזרה ראשונה בסיסית ומטען נייד.",
          form.travelMode === "ebike" ? "מטען, מתאם שקע ובדיקת טווח סוללה לפני כל יום." : "בדיקת בלמים וצמיגים לפני יציאה.",
        ]
      : ["נעליים נוחות, בקבוק מים ומטען נייד."],
    safetyNotes: ridingTrip
      ? [
          "לאמת מזג אוויר, כבישים סגורים ותנאי ראות בבוקר היציאה.",
          form.travelMode === "motorcycle"
            ? "להימנע מרכיבה לילית בכבישים הרריים לא מוכרים."
            : "להעדיף שבילי אופניים וכבישים שקטים, ולהימנע מצירי תנועה מהירים.",
          form.groupRidingSupport
            ? "להגדיר מוביל, מאסף, מרווחים ונקודות עצירה ברורות."
            : "לשתף מיקום ומסלול עם איש קשר.",
        ]
      : ["לבדוק מזג אוויר, שעות פתיחה וביטוח נסיעות לפני יציאה."],
    estimatedTotalCost:
      form.budgetRange === "luxury"
        ? "$1,800-$3,500 לאדם לפני טיסות"
        : form.budgetRange === "budget"
          ? "$450-$950 לאדם לפני טיסות"
          : "$900-$1,800 לאדם לפני טיסות",
    tags: profileTags(form),
    days,
    hotelRecommendations: [
      createRecommendation("Accessible Central Hotel Placeholder", form.destination, "מיקום מרכזי שמפחית זמני נסיעה, עם בקשה לחדר נגיש ומעלית", "$120-$240 ללילה", 4.5, "לבקש חדר נגיש, מקלחון ללא מדרגה ומעלית פעילה."),
      createRecommendation("Family Senior Friendly Resort Placeholder", form.destination, "חדרים גדולים, מעליות, בריכה נגישה ומרחקים קצרים", "$160-$320 ללילה", 4.4, "מתאים למשפחות עם הורים מבוגרים ולצורך במנוחות."),
      createRecommendation("Rider Friendly Lodge Placeholder", form.destination, ridingTrip ? "חניה בטוחה, מקום לציוד, קרבה לכביש נופי/שביל רכיבה" : "אפשרות לינה נוספת עם חניה נוחה", "$90-$210 ללילה", 4.5, "לוודא חניה, מעלית וגישה נוחה לציוד."),
      createRecommendation("Luxury Accessible Resort Placeholder", form.destination, "מתאים לזוגות ירח דבש ומטיילי יוקרה עם שירותי הסעה פנימיים", "$350-$700 ללילה", 4.8, "לוודא רמפות, מעליות וחדר קרוב ללובי."),
    ],
    kosherRestaurants: [
      createRecommendation("Kosher Restaurant Placeholder", form.destination, "יש לאמת תעודת כשרות ושעות פתיחה", "$25-$65", 4.3, "לוודא כניסה נגישה ושירותים קרובים."),
      createRecommendation("Kosher Bakery Placeholder", form.destination, "פתרון נוח לבוקר ולצידה לדרך", "$8-$25", 4.2, "עדיף לאיסוף מהיר כדי להפחית הליכה ועמידה בתור."),
    ],
    chabadHouses: [
      createRecommendation("Chabad House Placeholder", form.destination, "מידע לתפילות, שבת, אוכל כשר וסיוע למטיילים", "לפי תרומה", 4.7, "לתאם מראש נגישות, מקום ישיבה וכניסה ללא מדרגות."),
    ],
  };
}
