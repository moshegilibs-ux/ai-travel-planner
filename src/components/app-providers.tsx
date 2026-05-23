"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { AnalyticsProvider } from "@/components/analytics-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AnalyticsProvider>
        {children}
        <Toaster richColors position="top-center" />
      </AnalyticsProvider>
    </SessionProvider>
  );
}
