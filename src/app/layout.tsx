import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PwaRegister } from "@/components/pwa-register";
import { CookieBanner } from "@/components/cookie-banner";
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
  title: "טיולים וחלומות | מטיילים יחד, בלי גבולות",
  description:
    "מערכת AI לתכנון טיולים נגישים למשפחות, מבוגרים ואנשים עם מוגבלויות.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "טיולים וחלומות | מטיילים יחד, בלי גבולות",
    description:
      "תכנון חכם של חופשות נגישות למשפחות, מבוגרים ואנשים עם מוגבלויות.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col pb-24 md:pb-0">
        <AppProviders>
          {children}
          <MobileBottomNav />
          <PwaRegister />
          <CookieBanner />
        </AppProviders>
      </body>
    </html>
  );
}
