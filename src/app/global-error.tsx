"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void import("@sentry/nextjs")
      .then((Sentry) => {
        Sentry.captureException(error);
      })
      .catch(() => undefined);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
          <section className="max-w-lg rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center">
            <p className="text-sm font-bold text-sky-300">Something went wrong</p>
            <h1 className="mt-2 text-3xl font-black">We logged this error.</h1>
            <p className="mt-3 text-slate-300">
              The travel assistant hit an unexpected issue. Please try again.
            </p>
            <button
              onClick={reset}
              className="mt-6 rounded-full bg-sky-500 px-5 py-3 font-bold text-slate-950"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
