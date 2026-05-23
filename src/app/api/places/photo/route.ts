import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { getGoogleMapsApiKey, validateProductionRuntimeEnv } from "@/lib/env";

export async function GET(request: Request) {
  validateProductionRuntimeEnv();
  const apiKey = getGoogleMapsApiKey();
  const { searchParams } = new URL(request.url);
  const photoName = searchParams.get("name");

  if (!apiKey || !photoName) {
    return apiError("Photo unavailable", 404, "PHOTO_UNAVAILABLE");
  }

  try {
    // TODO: Add image proxy caching so repeated Google photo requests do not hit quota.
    const response = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=720&maxWidthPx=960&key=${apiKey}`,
      { redirect: "follow" },
    );

    if (!response.ok) {
      return apiError("Photo unavailable", 404, "PHOTO_UNAVAILABLE");
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return apiError("Photo unavailable", 404, "PHOTO_UNAVAILABLE");
  }
}
