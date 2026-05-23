import { NextResponse } from "next/server";
import { z } from "zod";
import { renderEmailTemplate, sendEmail } from "@/lib/email";

const emailSchema = z.object({
  to: z.string().email(),
  template: z.enum(["welcome", "price-drop", "trip-reminder", "subscription"]),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  const payload = emailSchema.parse(await request.json());
  const html = renderEmailTemplate({
    template: payload.template,
    name: payload.name,
  });
  const result = await sendEmail({
    to: payload.to,
    subject: "טיולים וחלומות",
    html,
  });

  return NextResponse.json({ ok: true, result });
}
