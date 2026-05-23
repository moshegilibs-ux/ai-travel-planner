import type { BudgetBreakdown } from "@/types/travel-marketplace";

type BudgetInput = {
  flightPrice: number | null;
  hotelPricePerNight: number | null;
  travelers: number;
  nights: number;
  currency: string;
};

export function buildBudgetBreakdown({
  flightPrice,
  hotelPricePerNight,
  travelers,
  nights,
  currency,
}: BudgetInput): BudgetBreakdown {
  const safeTravelers = Math.max(1, travelers);
  const safeNights = Math.max(1, nights);
  // Flight provider offer totals already include the requested passenger count.
  // Keep this equal to the visible flight card price to avoid double-counting.
  const flight = flightPrice === null ? 0 : Math.round(flightPrice);
  const hotel =
    hotelPricePerNight === null ? 0 : Math.round(hotelPricePerNight * safeNights);
  const food = Math.round(55 * safeTravelers * safeNights);
  const activities = Math.round(35 * safeTravelers * safeNights);
  const fees = Math.round((flight + hotel + food + activities) * 0.06);
  const safetyMargin = Math.round((flight + hotel + food + activities + fees) * 0.1);
  const total = flight + hotel + food + activities + fees + safetyMargin;

  return {
    flight,
    hotel,
    food,
    activities,
    fees,
    safetyMargin,
    total,
    currency,
    labels: {
      flight: flightPrice === null ? "לא זמין כרגע" : "מחיר בזמן אמת",
      hotel: hotelPricePerNight === null ? "לא זמין כרגע" : "מחיר בזמן אמת",
      food: "הערכה בלבד",
      activities: "הערכה בלבד",
      fees: "הערכה בלבד",
      safetyMargin: "הערכה בלבד",
    },
  };
}

export function validateBudgetBreakdown(breakdown: BudgetBreakdown) {
  const calculatedTotal =
    breakdown.flight +
    breakdown.hotel +
    breakdown.food +
    breakdown.activities +
    breakdown.fees +
    breakdown.safetyMargin;

  return {
    isValid: calculatedTotal === breakdown.total,
    visibleTotal: breakdown.total,
    calculatedTotal,
  };
}
