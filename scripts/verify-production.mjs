import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";
import { existsSync, readFileSync } from "node:fs";

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);

    if (!match || process.env[match[1]]) {
      continue;
    }

    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const requiredEnv = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "DATABASE_URL",
  "OPENAI_API_KEY",
  "AMADEUS_API_KEY",
  "AMADEUS_API_SECRET",
  "STRIPE_SECRET_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

const optionalEnv = [
  "SENTRY_DSN",
  "POSTHOG_API_KEY",
  "RESEND_API_KEY",
  "AFFILIATE_ID",
  "FEATURE_AI_ENABLED",
  "FEATURE_PAYMENTS_ENABLED",
  "FEATURE_AFFILIATE_LINKS_ENABLED",
  "WAITLIST_MODE",
  "MAINTENANCE_MODE",
];

function result(name, status, message) {
  const mark = status === "ok" ? "✓" : status === "warn" ? "!" : "✕";
  console.log(`${mark} ${name}: ${message}`);
  return { name, status, message };
}

async function runCheck(name, fn) {
  const start = Date.now();

  try {
    await fn();
    return result(name, "ok", `verified in ${Date.now() - start}ms`);
  } catch (error) {
    return result(
      name,
      "fail",
      error instanceof Error ? error.message : "verification failed",
    );
  }
}

function verifyEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  const missingOptional = optionalEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return result("env", "fail", `missing required vars: ${missing.join(", ")}`);
  }

  if (missingOptional.length > 0) {
    return result("env", "warn", `optional vars missing: ${missingOptional.join(", ")}`);
  }

  return result("env", "ok", "all required and optional vars are present");
}

async function verifyDatabase() {
  const prisma = new PrismaClient();

  try {
    await prisma.$queryRaw`SELECT 1`;
  } finally {
    await prisma.$disconnect();
  }
}

async function verifyOpenAI() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  await openai.models.list();
}

async function verifyAmadeus() {
  const response = await fetch(
    `${process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com"}/v1/security/oauth2/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Amadeus auth failed with ${response.status}`);
  }
}

async function verifyStripe() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });
  await stripe.balance.retrieve();
}

async function verifyRedis() {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  await redis.ping();
}

console.log("\nTripPilot AI production verification\n");

const checks = [
  verifyEnv(),
  await runCheck("database", verifyDatabase),
  await runCheck("openai", verifyOpenAI),
  await runCheck("amadeus", verifyAmadeus),
  await runCheck("stripe", verifyStripe),
  await runCheck("redis", verifyRedis),
];

const failed = checks.filter((check) => check.status === "fail");
const warned = checks.filter((check) => check.status === "warn");

console.log(
  `\nSummary: ${checks.length - failed.length - warned.length} ok, ${warned.length} warning, ${failed.length} failed\n`,
);

process.exit(failed.length > 0 ? 1 : 0);
