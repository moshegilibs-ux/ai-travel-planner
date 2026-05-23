"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CloudSun, RefreshCw, WalletCards } from "lucide-react";

type FxState = {
  available: boolean;
  from?: string;
  to?: string;
  amount?: number;
  rate: number | null;
  converted: number | null;
  provider: string;
  lastChecked: string;
  warning?: string;
};

type WeatherState = {
  available: boolean;
  destination: string;
  provider: string;
  current: {
    description: string;
    temperatureC: number | null;
    feelsLikeC: number | null;
    humidity: number | null;
    windSpeed: number | null;
  } | null;
  lastChecked: string;
  warning?: string;
};

type WidgetStatus<T> = {
  data: T | null;
  isLoading: boolean;
  error: string;
};

export function LiveTripWidgets({
  destination,
  amount,
  currency,
}: {
  destination: string;
  amount: number | null;
  currency: string;
}) {
  const [reloadKey, setReloadKey] = useState(0);
  const [fx, setFx] = useState<WidgetStatus<FxState>>({
    data: null,
    isLoading: true,
    error: "",
  });
  const [weather, setWeather] = useState<WidgetStatus<WeatherState>>({
    data: null,
    isLoading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;

    async function loadFx() {
      if (!amount || amount <= 0) {
        setFx({
          data: null,
          isLoading: false,
          error: "אין סכום מאומת להמרת מטבע כרגע.",
        });
        return;
      }

      setFx((current) => ({ ...current, isLoading: true, error: "" }));

      try {
        const params = new URLSearchParams({
          from: currency,
          to: "ILS",
          amount: String(amount),
        });
        const response = await fetch(`/api/fx?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as FxState | { error?: { message?: string } };

        if (!active) return;

        if (!response.ok || getApiErrorMessage(payload)) {
          setFx({
            data: null,
            isLoading: false,
            error: getApiErrorMessage(payload) || "שער מטבע לא זמין כרגע.",
          });
          return;
        }

        if (!isFxState(payload)) {
          setFx({ data: null, isLoading: false, error: "שער מטבע לא זמין כרגע." });
          return;
        }

        setFx({ data: payload, isLoading: false, error: "" });
      } catch {
        if (!active) return;
        setFx({ data: null, isLoading: false, error: "שער מטבע לא זמין כרגע." });
      }
    }

    async function loadWeather() {
      setWeather((current) => ({ ...current, isLoading: true, error: "" }));

      try {
        const params = new URLSearchParams({ destination });
        const response = await fetch(`/api/weather?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as
          | WeatherState
          | { error?: { message?: string } };

        if (!active) return;

        if (!response.ok || getApiErrorMessage(payload)) {
          setWeather({
            data: null,
            isLoading: false,
            error: getApiErrorMessage(payload) || "מזג האוויר לא זמין כרגע.",
          });
          return;
        }

        if (!isWeatherState(payload)) {
          setWeather({
            data: null,
            isLoading: false,
            error: "מזג האוויר לא זמין כרגע.",
          });
          return;
        }

        setWeather({ data: payload, isLoading: false, error: "" });
      } catch {
        if (!active) return;
        setWeather({ data: null, isLoading: false, error: "מזג האוויר לא זמין כרגע." });
      }
    }

    void loadFx();
    void loadWeather();

    return () => {
      active = false;
    };
  }, [amount, currency, destination, reloadKey]);

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <LiveWidgetShell
        icon={<WalletCards className="h-5 w-5" />}
        title="המרת מטבע חיה"
        isLoading={fx.isLoading}
        onRetry={() => setReloadKey((value) => value + 1)}
      >
        {fx.data?.available && fx.data.converted !== null ? (
          <div>
            <p className="text-2xl font-black text-slate-950 dark:text-white">
              {new Intl.NumberFormat("he-IL", {
                style: "currency",
                currency: "ILS",
                maximumFractionDigits: 0,
              }).format(fx.data.converted)}
            </p>
            <p className="mt-1 text-sm font-black text-sky-700 dark:text-sky-200">
              {fx.data.amount ? `${formatCurrencyAmount(fx.data.amount, fx.data.from || currency)} -> ILS` : ""}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              מקור: {fx.data.provider} · נבדק לאחרונה {formatLastChecked(fx.data.lastChecked)}
            </p>
          </div>
        ) : (
          <UnavailableState message={fx.error || fx.data?.warning || "לא זמין כרגע"} />
        )}
      </LiveWidgetShell>

      <LiveWidgetShell
        icon={<CloudSun className="h-5 w-5" />}
        title="מזג אוויר ביעד"
        isLoading={weather.isLoading}
        onRetry={() => setReloadKey((value) => value + 1)}
      >
        {weather.data?.available && weather.data.current ? (
          <div>
            <p className="text-2xl font-black text-slate-950 dark:text-white">
              {weather.data.current.temperatureC ?? "לא זמין"}°C
            </p>
            <p className="mt-1 text-sm font-black text-sky-700 dark:text-sky-200">
              {weather.data.destination}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
              {weather.data.current.description || "תיאור לא זמין"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              מקור: {weather.data.provider} · נבדק לאחרונה{" "}
              {formatLastChecked(weather.data.lastChecked)}
            </p>
          </div>
        ) : (
          <UnavailableState
            message={weather.error || weather.data?.warning || "לא זמין כרגע"}
          />
        )}
      </LiveWidgetShell>
    </section>
  );
}

function getApiErrorMessage(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  return "";
}

function isFxState(payload: unknown): payload is FxState {
  return (
    payload !== null &&
    typeof payload === "object" &&
    "available" in payload &&
    "provider" in payload &&
    "lastChecked" in payload
  );
}

function isWeatherState(payload: unknown): payload is WeatherState {
  return (
    payload !== null &&
    typeof payload === "object" &&
    "available" in payload &&
    "destination" in payload &&
    "provider" in payload &&
    "lastChecked" in payload
  );
}

function LiveWidgetShell({
  icon,
  title,
  isLoading,
  onRetry,
  children,
}: {
  icon: ReactNode;
  title: string;
  isLoading: boolean;
  onRetry: () => void;
  children: ReactNode;
}) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-sky-50 p-3 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
            {icon}
          </span>
          <h2 className="text-lg font-black text-slate-950 dark:text-white">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
          aria-label="נסה שוב"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/10" />
        ) : (
          children
        )}
      </div>
    </article>
  );
}

function UnavailableState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-bold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
      {message || "לא זמין כרגע"}
    </div>
  );
}

function formatLastChecked(value: string) {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrencyAmount(value: number, currency: string) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
