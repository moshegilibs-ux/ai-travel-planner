import { apiError } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import {
  isAdminTokenConfigured,
  isValidAdminToken,
} from "@/lib/api-status";

export function unauthorizedResponse(message = "Unauthorized") {
  return apiError(message, 401, "UNAUTHORIZED");
}

export function getClientKey(request: Request, scope: string) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "local";
  return `${scope}:${forwardedFor.split(",")[0].trim()}`;
}

export function checkSensitiveRouteRateLimit(request: Request, scope: string) {
  const limited = rateLimit({
    key: getClientKey(request, scope),
    limit: 20,
    windowMs: 60_000,
  });

  if (!limited.ok) {
    return apiError(
      "Too many requests.",
      429,
      "RATE_LIMITED",
      undefined,
      {
        headers: {
          "Retry-After": String(Math.ceil((limited.retryAfter ?? 0) / 1000)),
        },
      },
    );
  }

  return null;
}

export function requireAdminToken(request: Request) {
  const rateLimitResponse = checkSensitiveRouteRateLimit(request, "admin");

  if (rateLimitResponse) return rateLimitResponse;

  const token = new URL(request.url).searchParams.get("token");

  if (!isAdminTokenConfigured()) {
    return unauthorizedResponse("Admin is not configured. Set ADMIN_ACCESS_TOKEN.");
  }

  if (!isValidAdminToken(token)) {
    return unauthorizedResponse();
  }

  return null;
}
