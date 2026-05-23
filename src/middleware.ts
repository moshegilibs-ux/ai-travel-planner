import { NextResponse, type NextRequest } from "next/server";
import { isbot } from "isbot";
import { getFeatureFlags } from "@/lib/feature-flags";

export function middleware(request: NextRequest) {
  const flags = getFeatureFlags();
  const userAgent = request.headers.get("user-agent") || "";
  const path = request.nextUrl.pathname;
  const isHealth = path.startsWith("/api/health");
  const isStatic =
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.startsWith("/manifest") ||
    path.startsWith("/sw.js");

  if (flags.maintenanceMode && !isHealth && !isStatic) {
    if (path.startsWith("/api")) {
      return NextResponse.json(
        { error: "Service is temporarily in maintenance mode." },
        { status: 503 },
      );
    }

    if (path !== "/maintenance") {
      return NextResponse.rewrite(new URL("/maintenance", request.url));
    }
  }

  if (
    flags.waitlistMode &&
    !isHealth &&
    !isStatic &&
    !path.startsWith("/api/waitlist") &&
    !["/waitlist", "/privacy", "/terms"].includes(path)
  ) {
    if (path.startsWith("/api")) {
      return NextResponse.json(
        { error: "Public beta is in waitlist mode." },
        { status: 503 },
      );
    }

    return NextResponse.rewrite(new URL("/waitlist", request.url));
  }

  const isApiWrite =
    path.startsWith("/api") && request.method !== "GET";

  if (isApiWrite) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host && !origin.includes(host)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
  }

  if (isbot(userAgent) && path.startsWith("/api/ai")) {
    return NextResponse.json({ error: "Bot access restricted." }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
