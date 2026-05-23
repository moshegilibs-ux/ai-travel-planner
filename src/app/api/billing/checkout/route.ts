import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/next-auth";
import { getStripeClient, getStripePriceId } from "@/lib/stripe";
import { capturePaymentFailure } from "@/lib/monitoring";
import { trackServerEvent } from "@/lib/analytics";
import { getFeatureFlags } from "@/lib/feature-flags";
import { getAppUrl } from "@/lib/env";

const checkoutSchema = z.object({
  plan: z.enum(["PRO", "PREMIUM"]),
});

export async function POST(request: Request) {
  if (!getFeatureFlags().payments) {
    return NextResponse.redirect(new URL("/pricing?billing=disabled", request.url));
  }

  const form = await request.formData();
  const parsed = checkoutSchema.safeParse({ plan: form.get("plan") });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  const stripe = getStripeClient();
  const price = getStripePriceId(parsed.data.plan);

  if (!stripe || !price) {
    return NextResponse.redirect(new URL("/pricing?billing=not-configured", request.url));
  }

  const session = await getServerSession(authOptions);
  let checkout;

  try {
    checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      success_url: `${getAppUrl()}/dashboard?billing=success`,
      cancel_url: `${getAppUrl()}/pricing?billing=cancelled`,
      customer_email: session?.user?.email || undefined,
      metadata: {
        userId: session?.user?.id || "anonymous",
        plan: parsed.data.plan,
      },
    });
    await trackServerEvent("subscription_started", {
      userId: session?.user?.id,
      plan: parsed.data.plan,
    });
  } catch (error) {
    capturePaymentFailure(error, { plan: parsed.data.plan });
    return NextResponse.redirect(new URL("/pricing?billing=failed", request.url));
  }

  return NextResponse.redirect(checkout.url || new URL("/pricing", request.url));
}
