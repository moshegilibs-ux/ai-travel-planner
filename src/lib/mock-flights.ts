export type FlightTimeFilter = "all" | "morning" | "afternoon" | "evening";

export type FlightSortOption = "cheapest" | "fastest" | "departure";

export type FlightSearchInput = {
  origin: string;
  destination: string;
  departureDate?: string;
  returnDate?: string;
  adults?: number;
};

export type FlightFilters = {
  sortBy: FlightSortOption;
  directOnly: boolean;
  airline: string;
  maxStops: string;
  timeOfDay: FlightTimeFilter;
};

export type FlightDeal = {
  id: string;
  airline: string;
  logoText: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  returnDepartureTime: string;
  returnArrivalTime: string;
  durationMinutes: number;
  originAirport: string;
  destinationAirport: string;
  isDirect: boolean;
  stops: number;
  estimatedPrice: number;
  baggageIncluded: string;
  airlineRating: number;
  notes: string[];
};

const airlineProfiles = [
  {
    airline: "EL AL",
    logoText: "LY",
    baseFlightNumber: "LY315",
    rating: 4.4,
    baggageIncluded: "טרולי ותיק אישי כלולים",
  },
  {
    airline: "Aegean Airlines",
    logoText: "A3",
    baseFlightNumber: "A3925",
    rating: 4.5,
    baggageIncluded: "תיק אישי כלול, כבודה בתשלום",
  },
  {
    airline: "Wizz Air",
    logoText: "W6",
    baseFlightNumber: "W64428",
    rating: 4.0,
    baggageIncluded: "תיק אישי בלבד",
  },
  {
    airline: "Ryanair",
    logoText: "FR",
    baseFlightNumber: "FR6472",
    rating: 3.9,
    baggageIncluded: "תיק אישי בלבד",
  },
  {
    airline: "Lufthansa",
    logoText: "LH",
    baseFlightNumber: "LH681",
    rating: 4.6,
    baggageIncluded: "טרולי ותיק אישי כלולים",
  },
];

const flightTemplates = [
  { departureTime: "06:20", arrivalTime: "09:55", durationMinutes: 215, stops: 0, priceOffset: 120 },
  { departureTime: "09:40", arrivalTime: "14:10", durationMinutes: 270, stops: 1, priceOffset: -40 },
  { departureTime: "13:15", arrivalTime: "17:05", durationMinutes: 230, stops: 0, priceOffset: 80 },
  { departureTime: "17:50", arrivalTime: "23:35", durationMinutes: 345, stops: 1, priceOffset: -90 },
  { departureTime: "22:10", arrivalTime: "07:35", durationMinutes: 565, stops: 2, priceOffset: -140 },
];

function normalizeAirport(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : fallback;
}

function getTimeOfDay(time: string): FlightTimeFilter {
  const hour = Number(time.split(":")[0]);

  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function formatFlightDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}ש׳ ${remainingMinutes}ד׳`;
}

export function generateMockFlights(input: FlightSearchInput): FlightDeal[] {
  const originAirport = normalizeAirport(input.origin, "TLV");
  const destinationAirport = normalizeAirport(input.destination, "ATH");
  const destinationFactor = destinationAirport.length * 17;

  return flightTemplates.map((template, index) => {
    const airline = airlineProfiles[index % airlineProfiles.length];
    const isDirect = template.stops === 0;
    const estimatedPrice = Math.max(
      119,
      260 + destinationFactor + template.priceOffset + index * 35,
    );

    return {
      id: `${airline.baseFlightNumber}-${originAirport}-${destinationAirport}-${index}`,
      airline: airline.airline,
      logoText: airline.logoText,
      flightNumber: airline.baseFlightNumber,
      departureTime: template.departureTime,
      arrivalTime: template.arrivalTime,
      returnDepartureTime: index % 2 === 0 ? "16:35" : "11:20",
      returnArrivalTime: index % 2 === 0 ? "20:05" : "15:45",
      durationMinutes: template.durationMinutes,
      originAirport,
      destinationAirport,
      isDirect,
      stops: template.stops,
      estimatedPrice,
      baggageIncluded: airline.baggageIncluded,
      airlineRating: airline.rating,
      notes: [
        isDirect ? "טיסה ישירה ונוחה למשפחות" : "עצירה קצרה עם זמן מעבר סביר",
        template.departureTime < "08:00"
          ? "המראה מוקדמת, מומלץ לישון קרוב לשדה"
          : "שעת המראה נוחה יחסית",
      ],
    };
  });
}

export function filterAndSortFlights(
  flights: FlightDeal[],
  filters: FlightFilters,
) {
  const maxStops =
    filters.maxStops === "any" ? Number.POSITIVE_INFINITY : Number(filters.maxStops);

  return flights
    .filter((flight) => {
      if (filters.directOnly && !flight.isDirect) return false;
      if (filters.airline !== "all" && flight.airline !== filters.airline) return false;
      if (flight.stops > maxStops) return false;
      if (
        filters.timeOfDay !== "all" &&
        getTimeOfDay(flight.departureTime) !== filters.timeOfDay
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === "fastest") return a.durationMinutes - b.durationMinutes;
      if (filters.sortBy === "departure") {
        return a.departureTime.localeCompare(b.departureTime);
      }

      return a.estimatedPrice - b.estimatedPrice;
    });
}

export function getAvailableAirlines(flights: FlightDeal[]) {
  return Array.from(new Set(flights.map((flight) => flight.airline)));
}
