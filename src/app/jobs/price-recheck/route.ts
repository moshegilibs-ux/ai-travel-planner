import { NextResponse } from "next/server";
import { unauthorizedResponse } from "@/lib/admin-auth";
import { getCronSecret } from "@/lib/env";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = getCronSecret();

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return unauthorizedResponse();
  }

  return NextResponse.json({
    ok: true,
    job: "price-recheck",
    steps: [
      "Load tracked flights",
      "Re-check Amadeus prices",
      "Compare target price",
      "Enqueue email/push notification",
    ],
  });
}
