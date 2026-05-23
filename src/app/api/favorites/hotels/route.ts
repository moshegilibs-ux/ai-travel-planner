import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

const favoriteHotelSchema = z.object({
  hotelId: z.string().min(1),
  name: z.string().min(1),
  destination: z.string().optional(),
  payload: z.unknown(),
});

export async function GET() {
  const auth = await requireUser();

  if (auth.error) {
    return auth.error;
  }

  const hotels = await prisma.favoriteHotel.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ hotels });
}

export async function POST(request: Request) {
  const auth = await requireUser();

  if (auth.error) {
    return auth.error;
  }

  const payload = favoriteHotelSchema.parse(await request.json());
  const hotel = await prisma.favoriteHotel.upsert({
    where: {
      userId_hotelId: {
        userId: auth.userId,
        hotelId: payload.hotelId,
      },
    },
    create: {
      userId: auth.userId,
      hotelId: payload.hotelId,
      name: payload.name,
      destination: payload.destination,
      payload: payload.payload as Prisma.InputJsonValue,
    },
    update: {
      name: payload.name,
      destination: payload.destination,
      payload: payload.payload as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({ hotel });
}
