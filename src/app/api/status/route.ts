import { NextResponse } from "next/server";
import { getApiStatus } from "@/lib/api-status";
import { requireAdminToken } from "@/lib/admin-auth";

export function GET(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json(getApiStatus());
}
