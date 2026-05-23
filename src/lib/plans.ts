export type SaaSPlan = "FREE" | "PRO" | "PREMIUM";

export const plans = {
  FREE: {
    name: "Free",
    price: 0,
    aiMessages: 10,
    searches: 25,
    trackedPrices: 2,
    features: ["Basic AI trips", "Mock fallback", "2 price alerts"],
    stripePriceEnv: "",
  },
  PRO: {
    name: "Pro",
    price: 19,
    aiMessages: 300,
    searches: 500,
    trackedPrices: 50,
    features: ["Real-time AI agent", "Saved searches", "50 price alerts", "PDF exports"],
    stripePriceEnv: "STRIPE_PRO_PRICE_ID",
  },
  PREMIUM: {
    name: "Premium",
    price: 49,
    aiMessages: 1500,
    searches: 3000,
    trackedPrices: 250,
    features: ["Advanced agent workflows", "Team sharing", "Priority recommendations", "API usage insights"],
    stripePriceEnv: "STRIPE_PREMIUM_PRICE_ID",
  },
} as const;

export function getPlanLimits(plan: SaaSPlan = "FREE") {
  return plans[plan] ?? plans.FREE;
}
