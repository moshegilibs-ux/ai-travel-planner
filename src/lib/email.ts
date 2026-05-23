import { Resend } from "resend";
import { getAppUrl, getEmailEnv } from "@/lib/env";

export type EmailTemplate = "welcome" | "price-drop" | "trip-reminder" | "subscription";

const emailEnv = getEmailEnv();
const resend = emailEnv.resendApiKey ? new Resend(emailEnv.resendApiKey) : null;

export function renderEmailTemplate({
  template,
  name = "traveler",
  title,
  body,
}: {
  template: EmailTemplate;
  name?: string;
  title?: string;
  body?: string;
}) {
  const templateTitles: Record<EmailTemplate, string> = {
    welcome: "ברוכים הבאים לטיולים וחלומות",
    "price-drop": "Your tracked trip price dropped",
    "trip-reminder": "Your trip is coming up",
    subscription: "Subscription confirmed",
  };

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a">
    <div style="max-width:640px;margin:0 auto;padding:32px">
      <div style="background:#020617;color:white;border-radius:28px;padding:28px">
        <p style="margin:0;color:#7dd3fc;font-weight:700">טיולים וחלומות</p>
        <h1 style="margin:12px 0 0;font-size:30px">${title || templateTitles[template]}</h1>
      </div>
      <div style="background:white;border-radius:24px;padding:28px;margin-top:16px;border:1px solid #e2e8f0">
        <p style="font-size:16px;line-height:1.7">Hi ${name},</p>
        <p style="font-size:16px;line-height:1.7">${body || defaultBody(template)}</p>
        <a href="${getAppUrl()}" style="display:inline-block;margin-top:20px;background:#0ea5e9;color:white;padding:14px 20px;border-radius:999px;text-decoration:none;font-weight:700">פתחו את טיולים וחלומות</a>
      </div>
    </div>
  </body>
</html>`;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend || !emailEnv.resendFromEmail) {
    return { queued: true, provider: "console" };
  }

  return resend.emails.send({
    from: emailEnv.resendFromEmail,
    to,
    subject,
    html,
  });
}

function defaultBody(template: EmailTemplate) {
  const bodies: Record<EmailTemplate, string> = {
    welcome: "עוזר ה-AI הנגיש מוכן להשוות טיסות, מלונות, תקציב ומסלולים רגועים.",
    "price-drop": "A tracked flight is now closer to your target price. Review it before fares change again.",
    "trip-reminder": "Here are your trip reminders, booking checks and AI recommendations for the days ahead.",
    subscription: "Your subscription is active. Premium travel automation is now available in your dashboard.",
  };

  return bodies[template];
}
