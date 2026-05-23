import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/next-auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { trackServerEvent } from "@/lib/analytics";
import { getFeatureFlags } from "@/lib/feature-flags";
import { getAffiliateId } from "@/lib/env";

const affiliateSchema = z.object({
  provider: z.enum(["BOOKING", "EXPEDIA", "SKYSCANNER", "KIWI", "AGODA"]),
  outboundUrl: z.string().url(),
  source: z.string().optional(),
  tripId: z.string().optional(),
  metadata: z.unknown().optional(),
});

export async function POST(request: Request) {
  if (!getFeatureFlags().affiliateLinks) {
    return NextResponse.json(
      { error: "Affiliate redirects are temporarily disabled." },
      { status: 503 },
    );
  }

  const payload = affiliateSchema.parse(await request.json());
  const session = await getServerSession(authOptions);

  if (isDatabaseConfigured()) {
    await prisma.affiliateEvent.create({
      data: {
        userId: session?.user?.id || null,
        provider: payload.provider,
        outboundUrl: payload.outboundUrl,
        source: payload.source,
        tripId: payload.tripId,
        metadata: (payload.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  await trackServerEvent("affiliate_clicked", {
    userId: session?.user?.id,
    provider: payload.provider,
    source: payload.source,
  });

  return NextResponse.json({
    redirectUrl: formatAffiliateUrl(payload.outboundUrl, payload.provider, payload.source),
    tracked: isDatabaseConfigured(),
  });
}

function formatAffiliateUrl(url: string, provider: string, source?: string) {
  const nextUrl = new URL(url);
  nextUrl.searchParams.set("utm_source", "trippilot_ai");
  nextUrl.searchParams.set("utm_medium", "affiliate");
  nextUrl.searchParams.set("utm_campaign", source || provider.toLowerCase());

  const affiliateId = getAffiliateId();

  if (affiliateId) {
    nextUrl.searchParams.set("aff_id", affiliateId);
  }

  return nextUrl.toString();
}
