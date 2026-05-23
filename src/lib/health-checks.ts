import OpenAI from "openai";
import { getRedisClient } from "@/lib/redis";
import { getStripeClient } from "@/lib/stripe";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { isAmadeusConfigured } from "@/lib/amadeus";
import { fetchWithTimeout } from "@/lib/external-api";
import {
  getAmadeusBaseUrl,
  getAmadeusCredentials,
  getOpenAIKey,
  hasOpenAI,
} from "@/lib/env";

export type HealthCheck = {
  name: string;
  status: "ok" | "degraded" | "down" | "skipped";
  latencyMs?: number;
  message: string;
};

async function timed(name: string, check: () => Promise<HealthCheck>) {
  const start = Date.now();

  try {
    const result = await check();
    return { ...result, name, latencyMs: Date.now() - start };
  } catch (error) {
    return {
      name,
      status: "down" as const,
      latencyMs: Date.now() - start,
      message: error instanceof Error ? error.message : "Health check failed.",
    };
  }
}

export async function checkDatabase() {
  return timed("database", async () => {
    if (!isDatabaseConfigured()) {
      return {
        name: "database",
        status: "skipped",
        message: "DATABASE_URL is not configured.",
      };
    }

    await prisma.$queryRaw`SELECT 1`;

    return {
      name: "database",
      status: "ok",
      message: "Database connection is healthy.",
    };
  });
}

export async function checkOpenAI() {
  return timed("openai", async () => {
    if (!hasOpenAI()) {
      return {
        name: "openai",
        status: "skipped",
        message: "OPENAI_API_KEY is not configured.",
      };
    }

    const openai = new OpenAI({ apiKey: getOpenAIKey() });
    await openai.models.list();

    return {
      name: "openai",
      status: "ok",
      message: "OpenAI API key is valid.",
    };
  });
}

export async function checkAmadeus() {
  return timed("amadeus", async () => {
    if (!isAmadeusConfigured()) {
      return {
        name: "amadeus",
        status: "skipped",
        message: "Amadeus credentials are not configured.",
      };
    }

    const response = await fetchWithTimeout(
      `${getAmadeusBaseUrl()}/v1/security/oauth2/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: getAmadeusCredentials().clientId,
          client_secret: getAmadeusCredentials().clientSecret,
        }),
        cache: "no-store",
      },
      8_000,
    );

    if (!response.ok) {
      throw new Error(`Amadeus auth returned ${response.status}.`);
    }

    return {
      name: "amadeus",
      status: "ok",
      message: "Amadeus authentication is healthy.",
    };
  });
}

export async function checkStripe() {
  return timed("stripe", async () => {
    const stripe = getStripeClient();

    if (!stripe) {
      return {
        name: "stripe",
        status: "skipped",
        message: "STRIPE_SECRET_KEY is not configured.",
      };
    }

    await stripe.balance.retrieve();

    return {
      name: "stripe",
      status: "ok",
      message: "Stripe API connection is healthy.",
    };
  });
}

export async function checkRedis() {
  return timed("redis", async () => {
    const redis = getRedisClient();

    if (!redis) {
      return {
        name: "redis",
        status: "skipped",
        message: "Upstash Redis is not configured.",
      };
    }

    await redis.ping();

    return {
      name: "redis",
      status: "ok",
      message: "Redis connection is healthy.",
    };
  });
}

export function summarizeHealth(checks: HealthCheck[]) {
  const hasDown = checks.some((check) => check.status === "down");
  const hasDegraded = checks.some((check) => check.status === "degraded");

  return hasDown ? "down" : hasDegraded ? "degraded" : "ok";
}
