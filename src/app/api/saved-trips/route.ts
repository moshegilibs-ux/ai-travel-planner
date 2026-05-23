import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-response";

const savedTripSchema = z.object({
  externalId: z.string().optional(),
  title: z.string().min(1),
  destination: z.string().min(1),
  totalPrice: z.number().int().optional(),
  payload: z.unknown(),
});

export async function GET(request: Request) {
  const limited = rateLimit({ key: `saved:${request.headers.get("x-forwarded-for") || "local"}` });

  if (!limited.ok) {
    return apiError("Too many requests.", 429, "RATE_LIMITED");
  }

  const auth = await requireUser();

  if (auth.error) {
    return auth.error;
  }

  const trips = await prisma.savedTrip.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ trips });
}

export async function POST(request: Request) {
  const limited = rateLimit({ key: `saved-write:${request.headers.get("x-forwarded-for") || "local"}`, limit: 12 });

  if (!limited.ok) {
    return apiError("Too many requests.", 429, "RATE_LIMITED");
  }

  const auth = await requireUser();

  if (auth.error) {
    return auth.error;
  }

  const payload = savedTripSchema.parse(await request.json());
  const trip = await prisma.savedTrip.create({
    data: {
      userId: auth.userId,
      externalId: payload.externalId,
      title: payload.title,
      destination: payload.destination,
      totalPrice: payload.totalPrice,
      payload: payload.payload as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({ trip }, { status: 201 });
}
