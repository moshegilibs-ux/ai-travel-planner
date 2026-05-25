import { NextResponse, type NextRequest } from "next/server";
import { isbot } from "isbot";
import { getFeatureFlags } from "@/lib/feature-flags";
import {
  addLocaleToPath,
  detectLocale,
  getLocaleFromPath,
  isLocale,
  localeCookieName,
  removeLocaleFromPath,
} from "@/lib/i18n";

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
  const localeFromPath = getLocaleFromPath(path);
  const storedLocale =
    request.cookies.get(localeCookieName)?.value ||
    request.cookies.get("NEXT_LOCALE")?.value;
  const locale = localeFromPath || detectLocale(request.headers.get("accept-language"), storedLocale);

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

  if (!path.startsWith("/api") && !isStatic && path === "/") {
    const response = NextResponse.redirect(new URL(addLocaleToPath("/", locale), request.url));
    response.cookies.set(localeCookieName, locale, {
      maxAge: 31_536_000,
      path: "/",
      sameSite: "lax",
    });
    response.cookies.set("NEXT_LOCALE", locale, {
      maxAge: 31_536_000,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-trippilot-locale", locale);

  if (localeFromPath && !path.startsWith("/api")) {
    const url = request.nextUrl.clone();
    url.pathname = removeLocaleFromPath(path);
    const response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
    response.cookies.set(localeCookieName, locale, {
      maxAge: 31_536_000,
      path: "/",
      sameSite: "lax",
    });
    response.cookies.set("NEXT_LOCALE", locale, {
      maxAge: 31_536_000,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (isLocale(locale)) {
    response.cookies.set(localeCookieName, locale, {
      maxAge: 31_536_000,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
