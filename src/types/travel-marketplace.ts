export type AccessibilityProfile =
  | "none"
  | "wheelchair"
  | "walker"
  | "mobility-scooter"
  | "senior"
  | "young-children";

export type SearchParams = {
  from: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
  budget: number;
  accessibilityProfile?: AccessibilityProfile;
  accessibilityFilters?: string[];
  multiCity?: string;
  flexibleDates?: boolean;
  cheapestMonth?: boolean;
  nearbyAirports?: boolean;
};

export type TravelSearchRequest = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  budget: number;
  accessibilityProfile?: AccessibilityProfile;
  accessibilityFilters?: string[];
  multiCity?: string;
  flexibleDates?: boolean;
  cheapestMonth?: boolean;
  nearbyAirports?: boolean;
};

export type FlightDeal = {
  id: string;
  airline: string;
  from: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number | null;
  currency: string;
  provider: string;
  availabilityStatus: "available" | "unavailable" | "unknown";
  lastChecked: string;
  bookingLink?: string;
  priceLabel: "מחיר בזמן אמת" | "לא זמין כרגע";
  duration: string;
  nonstop: boolean;
};

export type HotelDeal = {
  id: string;
  name: string;
  image: string;
  rating: number;
  stars: number;
  location: string;
  pricePerNight: number | null;
  currency: string;
  provider: string;
  availabilityStatus: "available" | "unavailable" | "unknown";
  lastChecked: string;
  bookingLink?: string;
  priceLabel: "מחיר בזמן אמת" | "לא זמין כרגע";
  amenities: string[];
};

export type TripDeal = {
  id: string;
  title: string;
  destination: string;
  image: string;
  flight: FlightDeal;
  hotel: HotelDeal;
  aiSummary: string;
  tags: string[];
  estimatedTotal: number | null;
  currency: string;
  budgetBreakdown: BudgetBreakdown;
  budgetValidation: {
    isValid: boolean;
    visibleTotal: number;
    calculatedTotal: number;
  };
};

export type BudgetBreakdown = {
  flight: number;
  hotel: number;
  food: number;
  activities: number;
  fees: number;
  safetyMargin: number;
  total: number;
  currency: string;
  labels: {
    flight: "מחיר בזמן אמת" | "לא זמין כרגע";
    hotel: "מחיר בזמן אמת" | "לא זמין כרגע";
    food: "הערכה בלבד";
    activities: "הערכה בלבד";
    fees: "הערכה בלבד";
    safetyMargin: "הערכה בלבד";
  };
};

export type TravelSearchResponse = {
  flights: FlightDeal[];
  hotels: HotelDeal[];
  deals: TripDeal[];
  mode: "amadeus" | "mock" | "unavailable";
  warning?: string;
  warnings?: {
    flights?: string;
    hotels?: string;
  };
};
