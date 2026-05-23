export const travelerOptions = [
  { value: "couple", label: "זוג" },
  { value: "family", label: "משפחה" },
  { value: "friends", label: "חברים" },
  { value: "solo", label: "יחיד/ה" },
] as const;

export const travelModeOptions = [
  { value: "regular", label: "טיול רגיל" },
  { value: "motorcycle", label: "טיול אופנועים" },
  { value: "bicycle", label: "טיול אופניים" },
  { value: "ebike", label: "טיול אופניים חשמליים" },
] as const;

export const ridingExperienceOptions = [
  { value: "beginner", label: "מתחילים" },
  { value: "intermediate", label: "בינוני" },
  { value: "advanced", label: "מתקדמים" },
  { value: "expert", label: "מנוסים מאוד" },
] as const;

export const routeDifficultyOptions = [
  { value: "easy", label: "קל" },
  { value: "moderate", label: "בינוני" },
  { value: "challenging", label: "מאתגר" },
  { value: "hard", label: "קשה" },
] as const;

export const routePriorityOptions = [
  { value: "scenic", label: "נופי" },
  { value: "balanced", label: "מאוזן" },
  { value: "fast", label: "מהיר" },
] as const;

export const ridingStyleOptions = [
  { value: "relaxed", label: "רגוע" },
  { value: "adventure", label: "הרפתקני" },
] as const;

export const cyclingTypeOptions = [
  { value: "city", label: "עירוני / שבילים קלים" },
  { value: "road", label: "כביש" },
  { value: "mtb", label: "שטח / MTB" },
  { value: "family", label: "משפחתי" },
] as const;

export const travelStyleOptions = [
  { value: "classic", label: "קלאסי ומאוזן" },
  { value: "kosher", label: "מטיילים שומרי כשרות" },
  { value: "religious", label: "מטיילים דתיים" },
  { value: "family_with_kids", label: "משפחה עם ילדים" },
  { value: "honeymoon", label: "ירח דבש" },
  { value: "backpacker", label: "תרמילאים" },
  { value: "luxury", label: "יוקרה" },
] as const;

export const dietaryOptions = [
  { value: "none", label: "אין העדפה מיוחדת" },
  { value: "kosher", label: "כשר" },
  { value: "vegetarian", label: "צמחוני" },
  { value: "vegan", label: "טבעוני" },
  { value: "gluten_free", label: "ללא גלוטן" },
] as const;

export const kosherLevelOptions = [
  { value: "not_needed", label: "לא נדרש" },
  { value: "kosher_friendly", label: "ידידותי לשומרי כשרות" },
  { value: "kosher_certified", label: "כשרות מוסמכת בלבד" },
  { value: "mehadrin", label: "מהדרין / חב״ד" },
] as const;

export const shabbatOptions = [
  { value: "no", label: "לא" },
  { value: "yes", label: "כן, בלי נסיעות בשבת" },
  { value: "partial", label: "גמיש, עם התאמות" },
] as const;

export const budgetRangeOptions = [
  { value: "budget", label: "חסכוני" },
  { value: "moderate", label: "בינוני" },
  { value: "premium", label: "פרימיום" },
  { value: "luxury", label: "יוקרתי" },
] as const;

export const mobilityOptions = [
  { value: "full", label: "ניידות מלאה" },
  { value: "limited_walking", label: "הליכה מוגבלת" },
  { value: "wheelchair", label: "משתמש/ת בכיסא גלגלים" },
  { value: "senior_friendly", label: "קצב ידידותי לגיל השלישי" },
] as const;

export const walkingDifficultyOptions = [
  { value: "none", label: "אין קושי מיוחד" },
  { value: "mild", label: "קושי קל" },
  { value: "moderate", label: "קושי בינוני" },
  { value: "significant", label: "קושי משמעותי" },
] as const;

export const activityIntensityOptions = [
  { value: "very_light", label: "קל מאוד" },
  { value: "light", label: "קל" },
  { value: "moderate", label: "בינוני" },
  { value: "active", label: "פעיל" },
] as const;

export const transportationOptions = [
  { value: "public_transport", label: "תחבורה ציבורית" },
  { value: "walking", label: "הליכה" },
  { value: "taxi", label: "מוניות / רייד שייר" },
  { value: "rental_car", label: "רכב שכור" },
  { value: "private_driver", label: "נהג פרטי" },
] as const;

export const paceOptions = [
  { value: "relaxed", label: "רגוע" },
  { value: "balanced", label: "מאוזן" },
  { value: "intense", label: "אינטנסיבי" },
] as const;

export const dayPreferenceOptions = [
  { value: "morning", label: "אנשי בוקר" },
  { value: "balanced", label: "גמישים" },
  { value: "night", label: "אנשי לילה" },
] as const;

export const interestOptions = [
  { value: "hiking", label: "מסלולי הליכה" },
  { value: "waterfalls", label: "מפלים" },
  { value: "beaches", label: "חופים" },
  { value: "islands", label: "איים" },
  { value: "nightlife", label: "חיי לילה" },
  { value: "street_food", label: "אוכל רחוב" },
  { value: "fine_dining", label: "מסעדות שף" },
  { value: "photography_spots", label: "נקודות צילום" },
  { value: "museums", label: "מוזיאונים" },
  { value: "shopping_malls", label: "קניונים" },
  { value: "local_markets", label: "שווקים מקומיים" },
  { value: "adventure_sports", label: "ספורט אתגרי" },
  { value: "snorkeling", label: "שנורקלינג" },
  { value: "diving", label: "צלילה" },
  { value: "wellness_spa", label: "וולנס וספא" },
  { value: "jewish_heritage", label: "מורשת יהודית" },
  { value: "chabad_houses", label: "בתי חב״ד" },
  { value: "kosher_restaurants", label: "מסעדות כשרות" },
] as const;

export type TravelerType = (typeof travelerOptions)[number]["value"];
export type TravelMode = (typeof travelModeOptions)[number]["value"];
export type RidingExperience = (typeof ridingExperienceOptions)[number]["value"];
export type RouteDifficulty = (typeof routeDifficultyOptions)[number]["value"];
export type RoutePriority = (typeof routePriorityOptions)[number]["value"];
export type RidingStyle = (typeof ridingStyleOptions)[number]["value"];
export type CyclingType = (typeof cyclingTypeOptions)[number]["value"];
export type TravelStyle = (typeof travelStyleOptions)[number]["value"];
export type DietaryPreference = (typeof dietaryOptions)[number]["value"];
export type KosherLevel = (typeof kosherLevelOptions)[number]["value"];
export type ShabbatPreference = (typeof shabbatOptions)[number]["value"];
export type BudgetRange = (typeof budgetRangeOptions)[number]["value"];
export type MobilityLevel = (typeof mobilityOptions)[number]["value"];
export type WalkingDifficulty = (typeof walkingDifficultyOptions)[number]["value"];
export type ActivityIntensity = (typeof activityIntensityOptions)[number]["value"];
export type TransportationPreference = (typeof transportationOptions)[number]["value"];
export type TripPace = (typeof paceOptions)[number]["value"];
export type DayPreference = (typeof dayPreferenceOptions)[number]["value"];
export type Interest = (typeof interestOptions)[number]["value"];

export function labelFor<T extends string>(
  options: readonly { value: T; label: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}
