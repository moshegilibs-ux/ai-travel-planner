import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { AppProviders } from "@/components/app-providers";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PwaRegister } from "@/components/pwa-register";
import { CookieBanner } from "@/components/cookie-banner";
import { I18nClientSync } from "@/components/i18n-client-sync";
import {
  AppLocale,
  defaultLocale,
  getDirection,
  isLocale,
  localeCookieName,
  locales,
  messagesByLocale,
} from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trips & Dreams | Accessible AI travel planner",
  description:
    "AI travel planner for accessible family trips, older travelers and people with disabilities.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Trips & Dreams",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  alternates: {
    languages: Object.fromEntries(locales.map((locale) => [locale, `/${locale}`])),
  },
  openGraph: {
    title: "Trips & Dreams | Accessible AI travel planner",
    description:
      "Smart planning for accessible vacations for families, older travelers and people with disabilities.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const headerLocale = requestHeaders.get("x-trippilot-locale");
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  const locale: AppLocale = isLocale(headerLocale)
    ? headerLocale
    : isLocale(cookieLocale)
      ? cookieLocale
      : defaultLocale;

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col pb-24 md:pb-0">
        <NextIntlClientProvider locale={locale} messages={messagesByLocale[locale]}>
          <AppProviders>
            <I18nClientSync />
            {children}
            <MobileBottomNav />
            <PwaRegister />
            <CookieBanner />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
