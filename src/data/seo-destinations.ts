export const seoDestinations = {
  paris: {
    name: "Paris",
    aiSummary:
      "Paris is best for romantic city breaks, museums, food, shopping and walkable neighborhoods with strong hotel supply.",
    bestMonths: ["April", "May", "September", "October"],
    averagePrices: "Flights $180-$420, hotels $130-$280/night",
    hotelZones: ["Le Marais", "Saint-Germain", "Opera", "Latin Quarter"],
    budgetEstimates: ["Budget: $120/day", "Comfort: $220/day", "Premium: $420/day"],
    sampleItinerary: ["Eiffel Tower and Seine walk", "Louvre and Le Marais", "Montmartre and food tour"],
  },
  tokyo: {
    name: "Tokyo",
    aiSummary:
      "Tokyo is ideal for food, culture, shopping, anime, design hotels and efficient transit-based itineraries.",
    bestMonths: ["March", "April", "October", "November"],
    averagePrices: "Flights $650-$1100, hotels $100-$260/night",
    hotelZones: ["Shinjuku", "Ginza", "Shibuya", "Ueno"],
    budgetEstimates: ["Budget: $100/day", "Comfort: $210/day", "Premium: $450/day"],
    sampleItinerary: ["Shibuya and Harajuku", "Asakusa and Ueno", "Tsukiji, Ginza and teamLab"],
  },
  bangkok: {
    name: "Bangkok",
    aiSummary:
      "Bangkok is a high-value base for food, markets, temples, luxury hotels and Thailand island connections.",
    bestMonths: ["November", "December", "January", "February"],
    averagePrices: "Flights $450-$900, hotels $55-$180/night",
    hotelZones: ["Sukhumvit", "Siam", "Riverside", "Silom"],
    budgetEstimates: ["Budget: $60/day", "Comfort: $140/day", "Premium: $320/day"],
    sampleItinerary: ["Grand Palace and river", "Markets and street food", "Spa, malls and rooftop dinner"],
  },
} as const;

export type SeoDestinationSlug = keyof typeof seoDestinations;
