import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import he from "../../messages/he.json";
import en from "../../messages/en.json";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { CookieBanner } from "@/components/cookie-banner";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "טיולים וחלומות",
  description: "AI-powered accessible family travel planner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LocaleLayout>{children}</LocaleLayout>;
}

async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value === "en" ? "en" : "he";
  const messages = locale === "en" ? en : he;
  const dir = locale === "en" ? "ltr" : "rtl";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AnalyticsProvider>
            {children}
            <MobileBottomNav />
            <CookieBanner />
          </AnalyticsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
