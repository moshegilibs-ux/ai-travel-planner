import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

const favoriteFlightSchema = z.object({
  flightId: z.string().min(1),
  airline: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  payload: z.unknown(),
});

export async function GET() {
  const auth = await requireUser();

  if (auth.error) {
    return auth.error;
  }

  const flights = await prisma.favoriteFlight.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ flights });
}

export async function POST(request: Request) {
  const auth = await requireUser();

  if (auth.error) {
    return auth.error;
  }

  const payload = favoriteFlightSchema.parse(await request.json());
  const flight = await prisma.favoriteFlight.upsert({
    where: {
      userId_flightId: {
        userId: auth.userId,
        flightId: payload.flightId,
      },
    },
    create: {
      userId: auth.userId,
      flightId: payload.flightId,
      airline: payload.airline,
      origin: payload.origin,
      destination: payload.destination,
      payload: payload.payload as Prisma.InputJsonValue,
    },
    update: {
      airline: payload.airline,
      origin: payload.origin,
      destination: payload.destination,
      payload: payload.payload as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({ flight });
}
