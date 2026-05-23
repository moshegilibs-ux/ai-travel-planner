import {
  ActivityIntensity,
  BudgetRange,
  DayPreference,
  DietaryPreference,
  Interest,
  KosherLevel,
  MobilityLevel,
  RidingExperience,
  RidingStyle,
  RouteDifficulty,
  RoutePriority,
  ShabbatPreference,
  TransportationPreference,
  TravelMode,
  TravelStyle,
  TravelerType,
  WalkingDifficulty,
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
  TripPace,
  CyclingType,
  cyclingTypeOptions,
} from "@/lib/travel-options";

export type TravelFormData = {
  destination: string;
  days: number;
  travelers: TravelerType;
  travelMode: TravelMode;
  ridingExperience: RidingExperience;
  preferredDailyRidingDistance: number;
  routeDifficulty: RouteDifficulty;
  routePriority: RoutePriority;
  ridingStyle: RidingStyle;
  needRentalOptions: boolean;
  needGearRecommendations: boolean;
  offRoadPreference: boolean;
  groupRidingSupport: boolean;
  cyclingType: CyclingType;
  ages: string;
  familyStatus: string;
  kidsAges: string;
  dietaryPreference: DietaryPreference;
  kosherLevel: KosherLevel;
  keepShabbat: ShabbatPreference;
  travelStyle: TravelStyle;
  budgetRange: BudgetRange;
  mobilityLevel: MobilityLevel;
  maxWalkingTimePerDay: number;
  needElevatorAccess: boolean;
  needWheelchairAccessibleTransportation: boolean;
  avoidStairs: boolean;
  needFrequentRestBreaks: boolean;
  accessibleBathroomRequired: boolean;
  walkingDifficulty: WalkingDifficulty;
  preferredActivityIntensity: ActivityIntensity;
  preferredTransportation: TransportationPreference;
  pace: TripPace;
  dayPreference: DayPreference;
  accessibilityNeeds: string;
  interests: Interest[];
};

export type TimelineActivity = {
  period: "morning" | "afternoon" | "evening";
  startTime: string;
  endTime: string;
  place: string;
  activity: string;
  description: string;
  travelTime: string;
  transportation: string;
  approximateCost: string;
  walkingDistance: string;
  ridingDistance: string;
  ridingDuration: string;
  elevationNote: string;
  routeDifficulty: string;
  fuelOrChargingStop: string;
  accessibilityNotes: string;
  restStopSuggestion: string;
  accessibilityTags: string[];
  matchReason: string;
  mapUrl: string;
  imageUrl: string;
  rating: number;
};

export type Recommendation = {
  name: string;
  area: string;
  reason: string;
  approximatePrice: string;
  rating: number;
  imageUrl: string;
  mapUrl: string;
  accessibilityNotes: string;
  isAccessible: boolean;
};

export type DailyPlan = {
  day: number;
  title: string;
  area: string;
  theme: string;
  flowNote: string;
  estimatedDailyCost: string;
  totalWalkingDistance: string;
  totalRidingDistance: string;
  ridingSummary: string;
  scenicHighlights: string[];
  riderTips: string[];
  accessibilitySummary: string;
  restBreaks: string[];
  activities: TimelineActivity[];
  restaurants: Recommendation[];
  budgetTip: string;
  travelerFit: string;
};

export type Itinerary = {
  destination: string;
  heroImageUrl: string;
  summary: string;
  profileSummary: string;
  routeNotes: string[];
  mobilitySummary: string;
  accessibilityHighlights: string[];
  travelModeSummary: string;
  ridingHighlights: string[];
  equipmentRecommendations: string[];
  safetyNotes: string[];
  estimatedTotalCost: string;
  tags: string[];
  days: DailyPlan[];
  hotelRecommendations: Recommendation[];
  kosherRestaurants: Recommendation[];
  chabadHouses: Recommendation[];
};

export type ItineraryResponse = {
  itinerary: Itinerary;
  source: "openai" | "mock";
};

const optionSets = {
  travelers: new Set(travelerOptions.map((option) => option.value)),
  travelMode: new Set(travelModeOptions.map((option) => option.value)),
  ridingExperience: new Set(ridingExperienceOptions.map((option) => option.value)),
  routeDifficulty: new Set(routeDifficultyOptions.map((option) => option.value)),
  routePriority: new Set(routePriorityOptions.map((option) => option.value)),
  ridingStyle: new Set(ridingStyleOptions.map((option) => option.value)),
  cyclingType: new Set(cyclingTypeOptions.map((option) => option.value)),
  dietaryPreference: new Set(dietaryOptions.map((option) => option.value)),
  kosherLevel: new Set(kosherLevelOptions.map((option) => option.value)),
  keepShabbat: new Set(shabbatOptions.map((option) => option.value)),
  travelStyle: new Set(travelStyleOptions.map((option) => option.value)),
  budgetRange: new Set(budgetRangeOptions.map((option) => option.value)),
  mobilityLevel: new Set(mobilityOptions.map((option) => option.value)),
  walkingDifficulty: new Set(walkingDifficultyOptions.map((option) => option.value)),
  preferredActivityIntensity: new Set(
    activityIntensityOptions.map((option) => option.value),
  ),
  preferredTransportation: new Set(
    transportationOptions.map((option) => option.value),
  ),
  pace: new Set(paceOptions.map((option) => option.value)),
  dayPreference: new Set(dayPreferenceOptions.map((option) => option.value)),
  interests: new Set(interestOptions.map((option) => option.value)),
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 4) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed)
    ? Math.min(Math.max(Math.round(parsed), 1), 21)
    : fallback;
}

function asBoolean(value: unknown) {
  return value === true || value === "true" || value === "on";
}

function enumValue<T extends string>(
  value: unknown,
  allowed: Set<string>,
  fallback: T,
): T {
  const stringValue = asString(value, fallback);
  return allowed.has(stringValue) ? (stringValue as T) : fallback;
}

export function normalizeInterests(value: unknown): Interest[] {
  const values = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];

  return values.filter(
    (item): item is Interest =>
      typeof item === "string" && optionSets.interests.has(item as Interest),
  );
}

export function parseTravelFormData(input: unknown): TravelFormData {
  if (!isRecord(input)) {
    throw new Error("Invalid request body");
  }

  const destination = asString(input.destination);

  if (!destination) {
    throw new Error("Destination is required");
  }

  return {
    destination,
    days: asNumber(input.days),
    travelers: enumValue(input.travelers, optionSets.travelers, "couple"),
    travelMode: enumValue(input.travelMode, optionSets.travelMode, "regular"),
    ridingExperience: enumValue(
      input.ridingExperience,
      optionSets.ridingExperience,
      "intermediate",
    ),
    preferredDailyRidingDistance: asNumber(input.preferredDailyRidingDistance, 80),
    routeDifficulty: enumValue(
      input.routeDifficulty,
      optionSets.routeDifficulty,
      "moderate",
    ),
    routePriority: enumValue(input.routePriority, optionSets.routePriority, "scenic"),
    ridingStyle: enumValue(input.ridingStyle, optionSets.ridingStyle, "relaxed"),
    needRentalOptions: asBoolean(input.needRentalOptions),
    needGearRecommendations: asBoolean(input.needGearRecommendations),
    offRoadPreference: asBoolean(input.offRoadPreference),
    groupRidingSupport: asBoolean(input.groupRidingSupport),
    cyclingType: enumValue(input.cyclingType, optionSets.cyclingType, "city"),
    ages: asString(input.ages),
    familyStatus: asString(input.familyStatus),
    kidsAges: asString(input.kidsAges),
    dietaryPreference: enumValue(
      input.dietaryPreference,
      optionSets.dietaryPreference,
      "none",
    ),
    kosherLevel: enumValue(input.kosherLevel, optionSets.kosherLevel, "not_needed"),
    keepShabbat: enumValue(input.keepShabbat, optionSets.keepShabbat, "no"),
    travelStyle: enumValue(input.travelStyle, optionSets.travelStyle, "classic"),
    budgetRange: enumValue(
      input.budgetRange ?? input.budget,
      optionSets.budgetRange,
      "moderate",
    ),
    mobilityLevel: enumValue(input.mobilityLevel, optionSets.mobilityLevel, "full"),
    maxWalkingTimePerDay: asNumber(input.maxWalkingTimePerDay, 90),
    needElevatorAccess: asBoolean(input.needElevatorAccess),
    needWheelchairAccessibleTransportation: asBoolean(
      input.needWheelchairAccessibleTransportation,
    ),
    avoidStairs: asBoolean(input.avoidStairs),
    needFrequentRestBreaks: asBoolean(input.needFrequentRestBreaks),
    accessibleBathroomRequired: asBoolean(input.accessibleBathroomRequired),
    walkingDifficulty: enumValue(
      input.walkingDifficulty,
      optionSets.walkingDifficulty,
      "none",
    ),
    preferredActivityIntensity: enumValue(
      input.preferredActivityIntensity,
      optionSets.preferredActivityIntensity,
      "moderate",
    ),
    preferredTransportation: enumValue(
      input.preferredTransportation,
      optionSets.preferredTransportation,
      "public_transport",
    ),
    pace: enumValue(input.pace, optionSets.pace, "balanced"),
    dayPreference: enumValue(input.dayPreference, optionSets.dayPreference, "balanced"),
    accessibilityNeeds: asString(input.accessibilityNeeds),
    interests: normalizeInterests(input.interests),
  };
}

function isRecommendation(value: unknown): value is Recommendation {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.area === "string" &&
    typeof value.reason === "string" &&
    typeof value.approximatePrice === "string" &&
    typeof value.rating === "number" &&
    typeof value.imageUrl === "string" &&
    typeof value.mapUrl === "string" &&
    typeof value.accessibilityNotes === "string" &&
    typeof value.isAccessible === "boolean"
  );
}

function isActivity(value: unknown): value is TimelineActivity {
  return (
    isRecord(value) &&
    ["morning", "afternoon", "evening"].includes(String(value.period)) &&
    typeof value.startTime === "string" &&
    typeof value.endTime === "string" &&
    typeof value.place === "string" &&
    typeof value.activity === "string" &&
    typeof value.description === "string" &&
    typeof value.travelTime === "string" &&
    typeof value.transportation === "string" &&
    typeof value.approximateCost === "string" &&
    typeof value.walkingDistance === "string" &&
    typeof value.ridingDistance === "string" &&
    typeof value.ridingDuration === "string" &&
    typeof value.elevationNote === "string" &&
    typeof value.routeDifficulty === "string" &&
    typeof value.fuelOrChargingStop === "string" &&
    typeof value.accessibilityNotes === "string" &&
    typeof value.restStopSuggestion === "string" &&
    Array.isArray(value.accessibilityTags) &&
    value.accessibilityTags.every((tag) => typeof tag === "string") &&
    typeof value.matchReason === "string" &&
    typeof value.mapUrl === "string" &&
    typeof value.imageUrl === "string" &&
    typeof value.rating === "number"
  );
}

export function isItinerary(value: unknown): value is Itinerary {
  if (!isRecord(value) || !Array.isArray(value.days)) {
    return false;
  }

  return (
    typeof value.destination === "string" &&
    typeof value.heroImageUrl === "string" &&
    typeof value.summary === "string" &&
    typeof value.profileSummary === "string" &&
    Array.isArray(value.routeNotes) &&
    value.routeNotes.every((note) => typeof note === "string") &&
    typeof value.mobilitySummary === "string" &&
    Array.isArray(value.accessibilityHighlights) &&
    value.accessibilityHighlights.every((highlight) => typeof highlight === "string") &&
    typeof value.travelModeSummary === "string" &&
    Array.isArray(value.ridingHighlights) &&
    value.ridingHighlights.every((highlight) => typeof highlight === "string") &&
    Array.isArray(value.equipmentRecommendations) &&
    value.equipmentRecommendations.every((item) => typeof item === "string") &&
    Array.isArray(value.safetyNotes) &&
    value.safetyNotes.every((note) => typeof note === "string") &&
    typeof value.estimatedTotalCost === "string" &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === "string") &&
    Array.isArray(value.hotelRecommendations) &&
    value.hotelRecommendations.every(isRecommendation) &&
    Array.isArray(value.kosherRestaurants) &&
    value.kosherRestaurants.every(isRecommendation) &&
    Array.isArray(value.chabadHouses) &&
    value.chabadHouses.every(isRecommendation) &&
    value.days.every(
      (day) =>
        isRecord(day) &&
        typeof day.day === "number" &&
        typeof day.title === "string" &&
        typeof day.area === "string" &&
        typeof day.theme === "string" &&
        typeof day.flowNote === "string" &&
        typeof day.estimatedDailyCost === "string" &&
        typeof day.totalWalkingDistance === "string" &&
        typeof day.totalRidingDistance === "string" &&
        typeof day.ridingSummary === "string" &&
        Array.isArray(day.scenicHighlights) &&
        day.scenicHighlights.every((highlight) => typeof highlight === "string") &&
        Array.isArray(day.riderTips) &&
        day.riderTips.every((tip) => typeof tip === "string") &&
        typeof day.accessibilitySummary === "string" &&
        Array.isArray(day.restBreaks) &&
        day.restBreaks.every((restBreak) => typeof restBreak === "string") &&
        Array.isArray(day.activities) &&
        day.activities.every(isActivity) &&
        Array.isArray(day.restaurants) &&
        day.restaurants.every(isRecommendation) &&
        typeof day.budgetTip === "string" &&
        typeof day.travelerFit === "string",
    )
  );
}
