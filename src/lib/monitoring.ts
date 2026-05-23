import { logError } from "@/lib/logger";

export function captureAppError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.captureException(error, { extra: context });
    })
    .catch(() => undefined);

  logError(error instanceof Error ? error.message : "Unknown error", context);
}

export function capturePaymentFailure(error: unknown, context?: Record<string, unknown>) {
  captureAppError(error, { area: "payments", ...context });
}

export function captureAiFailure(error: unknown, context?: Record<string, unknown>) {
  captureAppError(error, { area: "ai", ...context });
}
