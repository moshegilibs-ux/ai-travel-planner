"use client";

import { useEffect, useState } from "react";
import { Accessibility, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type AccessibilityOnboardingProfile,
  type MobilityDevice,
  defaultAccessibilityProfile,
  loadAccessibilityProfile,
  saveAccessibilityProfile,
} from "@/lib/accessibility-profile";
import type { DietaryPreference } from "@/lib/travel-options";

const deviceValues: MobilityDevice[] = [
  "none",
  "manual",
  "powered",
  "walker",
  "handbike",
];

const dietaryValues: DietaryPreference[] = [
  "none",
  "kosher",
  "vegetarian",
  "vegan",
  "gluten_free",
];

type ToggleKey =
  | "avoidStairs"
  | "accessibleRestroomRequired"
  | "frequentRestBreaks"
  | "serviceAnimal";

const toggleFields: Array<{ key: ToggleKey; label: string }> = [
  { key: "avoidStairs", label: "avoidStairs" },
  { key: "accessibleRestroomRequired", label: "accessibleRestroom" },
  { key: "frequentRestBreaks", label: "restBreaks" },
  { key: "serviceAnimal", label: "serviceAnimal" },
];

const selectClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-white/10 dark:bg-slate-900 dark:text-white";

/**
 * The guided accessibility profile form. Reads any saved profile on mount,
 * persists to localStorage on save, and reports back via onSaved so callers
 * (e.g. the home-page gate) can react.
 */
export function AccessibilityOnboarding({
  onSaved,
}: {
  onSaved?: (profile: AccessibilityOnboardingProfile) => void;
}) {
  const t = useTranslations("accessibilityOnboarding");
  const [profile, setProfile] = useState<AccessibilityOnboardingProfile>(
    defaultAccessibilityProfile,
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = loadAccessibilityProfile();
    if (stored) {
      setProfile(stored);
    }
  }, []);

  function update<K extends keyof AccessibilityOnboardingProfile>(
    key: K,
    value: AccessibilityOnboardingProfile[K],
  ) {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveAccessibilityProfile(profile);
    setSaved(true);
    onSaved?.(profile);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 md:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
          <Accessibility className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-200">
            {t("subtitle")}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {t("intro")}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {t("deviceLabel")}
          <select
            className={selectClass}
            value={profile.mobilityDevice}
            onChange={(event) =>
              update("mobilityDevice", event.target.value as MobilityDevice)
            }
          >
            {deviceValues.map((value) => (
              <option key={value} value={value}>
                {t(`device.${value}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {t("maxWalkingLabel")} ({profile.maxWalkingMinutes} {t("minutesUnit")})
          <input
            className="mt-4 w-full accent-emerald-600"
            type="range"
            min={0}
            max={240}
            step={15}
            value={profile.maxWalkingMinutes}
            onChange={(event) =>
              update("maxWalkingMinutes", Number(event.target.value))
            }
          />
        </label>

        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {t("dietaryLabel")}
          <select
            className={selectClass}
            value={profile.dietary}
            onChange={(event) =>
              update("dietary", event.target.value as DietaryPreference)
            }
          >
            {dietaryValues.map((value) => (
              <option key={value} value={value}>
                {t(`dietary.${value}`)}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-2">
          {toggleFields.map(({ key, label }) => (
            <label
              key={key}
              className="flex min-h-12 items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-emerald-600"
                checked={profile[key]}
                onChange={(event) => update(key, event.target.checked)}
              />
              {t(label)}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700"
        >
          <Check className="h-4 w-4" />
          {t("save")}
        </button>
        {saved ? (
          <p
            role="status"
            className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-100"
          >
            {t("saved")}
          </p>
        ) : null}
      </div>
    </form>
  );
}

/**
 * Home-page gate: shows the onboarding prompt only until a profile is saved.
 * Keeps first render SSR-stable (renders nothing) and decides visibility after
 * mount, mirroring the localStorage-gated pattern used by OnboardingPanel.
 */
export function AccessibilityOnboardingGate() {
  const t = useTranslations("accessibilityOnboarding");
  const [decision, setDecision] = useState<"pending" | "show" | "hide">(
    "pending",
  );
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setDecision(loadAccessibilityProfile() ? "hide" : "show");
  }, []);

  if (decision !== "show") {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-6">
      {expanded ? (
        <AccessibilityOnboarding onSaved={() => setDecision("hide")} />
      ) : (
        <div className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-slate-900">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {t("newUserPrompt")}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              {t("setUp")}
            </button>
            <button
              type="button"
              onClick={() => setDecision("hide")}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              {t("dismiss")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
