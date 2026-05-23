import { NextResponse } from "next/server";

export function apiError(
  message: string,
  status = 500,
  code = "API_ERROR",
  details?: unknown,
  init?: ResponseInit,
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
      },
    },
    { ...init, status },
  );
}
