import { NextResponse } from "next/server";
import { checkOpenAI } from "@/lib/health-checks";

export async function GET() {
  const check = await checkOpenAI();

  return NextResponse.json(check, {
    status: check.status === "down" ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
