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
  price: number;
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
  pricePerNight: number;
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
  estimatedTotal: number;
};

export type TravelSearchResponse = {
  flights: FlightDeal[];
  hotels: HotelDeal[];
  deals: TripDeal[];
  mode: "amadeus" | "mock";
  warning?: string;
  warnings?: {
    flights?: string;
    hotels?: string;
  };
};
