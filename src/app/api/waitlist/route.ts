import { redirect } from "next/navigation";
import { z } from "zod";
import { trackServerEvent } from "@/lib/analytics";

const waitlistSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = waitlistSchema.safeParse({ email: form.get("email") });

  if (parsed.success) {
    await trackServerEvent("waitlist_joined", {
      emailDomain: parsed.data.email.split("@")[1],
    });
  }

  redirect(parsed.success ? "/waitlist?joined=1" : "/waitlist?error=1");
}
