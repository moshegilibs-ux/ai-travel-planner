import { NextResponse } from "next/server";
import {
  checkAmadeus,
  checkDatabase,
  checkOpenAI,
  checkRedis,
  checkStripe,
  summarizeHealth,
} from "@/lib/health-checks";
import { getPublicFeatureFlags } from "@/lib/feature-flags";

export async function GET() {
  const checks = await Promise.all([
    checkDatabase(),
    checkOpenAI(),
    checkAmadeus(),
    checkStripe(),
    checkRedis(),
  ]);
  const status = summarizeHealth(checks);

  return NextResponse.json(
    {
      status,
      checkedAt: new Date().toISOString(),
      flags: getPublicFeatureFlags(),
      checks,
    },
    {
      status: status === "down" ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
