import Stripe from "stripe";
import {
  getStripePriceId as getEnvStripePriceId,
  getStripeSecretKey,
} from "@/lib/env";

export function isStripeConfigured() {
  return Boolean(getStripeSecretKey());
}

export function getStripeClient() {
  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia",
  });
}

export function getStripePriceId(plan: "PRO" | "PREMIUM") {
  return getEnvStripePriceId(plan === "PRO" ? "pro" : "premium");
}
