import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireUser();

  if (auth.error) return auth.error;

  const notifications = await prisma.notification.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ notifications });
}
