export type AnalyticsEvent =
  | "search_submitted"
  | "booking_clicked"
  | "ai_message_sent"
  | "subscription_started"
  | "affiliate_clicked"
  | "trip_saved"
  | "waitlist_joined";

export async function trackServerEvent(
  event: AnalyticsEvent,
  properties: Record<string, unknown> = {},
) {
  const posthog = getPostHogEnv();

  if (!posthog.apiKey || !posthog.host) {
    return;
  }

  await fetch(`${posthog.host}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: posthog.apiKey,
      event,
      properties: {
        distinct_id: properties.userId || "anonymous",
        ...properties,
      },
    }),
  }).catch(() => undefined);
}
import { getPostHogEnv } from "@/lib/env";
