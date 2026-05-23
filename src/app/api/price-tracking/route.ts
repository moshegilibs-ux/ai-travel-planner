import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-response";

const trackedFlightSchema = z.object({
  flightId: z.string().min(1),
  airline: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  targetPrice: z.number().int().optional(),
  lastSeenPrice: z.number().int().optional(),
  payload: z.unknown(),
});

export async function GET() {
  const auth = await requireUser();

  if (auth.error) {
    return auth.error;
  }

  const trackedFlights = await prisma.trackedFlight.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    trackedFlights,
    notificationArchitecture: {
      status: "prepared",
      nextSteps: [
        "Scheduled cron re-checks Amadeus prices",
        "Compare lastSeenPrice against targetPrice",
        "Send email/push notification when target is reached",
      ],
    },
  });
}

export async function POST(request: Request) {
  const limited = rateLimit({
    key: `price-track:${request.headers.get("x-forwarded-for") || "local"}`,
    limit: 20,
  });

  if (!limited.ok) {
    return apiError("Too many requests.", 429, "RATE_LIMITED");
  }

  const auth = await requireUser();

  if (auth.error) {
    return auth.error;
  }

  const payload = trackedFlightSchema.parse(await request.json());
  const trackedFlight = await prisma.trackedFlight.create({
    data: {
      userId: auth.userId,
      flightId: payload.flightId,
      airline: payload.airline,
      origin: payload.origin,
      destination: payload.destination,
      targetPrice: payload.targetPrice,
      lastSeenPrice: payload.lastSeenPrice,
      payload: payload.payload as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({ trackedFlight }, { status: 201 });
}
