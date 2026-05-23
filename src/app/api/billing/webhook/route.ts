import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";
import { getStripeWebhookSecret } from "@/lib/env";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const signature = request.headers.get("stripe-signature");
  const secret = getStripeWebhookSecret();
  const body = await request.text();

  if (!stripe || !signature || !secret) {
    return NextResponse.json({ received: true, mode: "not-configured" });
  }

  const event = stripe.webhooks.constructEvent(body, signature, secret);

  if (event.type === "checkout.session.completed" && isDatabaseConfigured()) {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (userId && plan === "PRO" || plan === "PREMIUM") {
      await prisma.subscription.create({
        data: {
          userId: userId || "",
          plan,
          status: "active",
          stripeCustomerId: String(session.customer || ""),
          stripeSubscriptionId: String(session.subscription || ""),
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
