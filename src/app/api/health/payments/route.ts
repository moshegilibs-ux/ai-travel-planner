import { NextResponse } from "next/server";
import { checkStripe } from "@/lib/health-checks";

export async function GET() {
  const check = await checkStripe();

  return NextResponse.json(check, {
    status: check.status === "down" ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
