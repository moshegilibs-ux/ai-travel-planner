import { NextResponse } from "next/server";
import { checkDatabase } from "@/lib/health-checks";

export async function GET() {
  const check = await checkDatabase();

  return NextResponse.json(check, {
    status: check.status === "down" ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
