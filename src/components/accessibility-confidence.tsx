"use client";

import { Accessibility, AlertTriangle, CheckCircle2, CircleHelp } from "lucide-react";
import {
  type AccessibilityScoreResult,
  type ConfidenceBand,
  type FactStatus,
  BAND_LABELS_HE,
  REQUIREMENT_LABELS_HE,
  SOURCE_LABELS_HE,
  STATUS_LABELS_HE,
} from "@/lib/accessibility-score";
import { getUiTranslations } from "@/lib/ui-translations";

const bandClass: Record<ConfidenceBand, string> = {
  high: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
  low: "bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-200",
};

const statusIconClass: Record<FactStatus, string> = {
  verified: "text-emerald-600",
  declared: "text-amber-600",
  absent: "text-rose-600",
  unknown: "text-slate-400",
};

function StatusIcon({ status }: { status: FactStatus }) {
  if (status === "verified" || status === "declared") {
    return <CheckCircle2 className={`h-4 w-4 ${statusIconClass[status]}`} />;
  }
  if (status === "absent") {
    return <AlertTriangle className={`h-4 w-4 ${statusIconClass[status]}`} />;
  }
  return <CircleHelp className={`h-4 w-4 ${statusIconClass[status]}`} />;
}

/**
 * Renders an accessibility confidence score for the traveler's profile.
 * The score is ALWAYS shown together with coverage and (when relevant) the
 * "not verified" warning, so a high score can never hide low coverage.
 * Honest by design: when nothing is verified it shows the low/unverified state
 * rather than implying accessibility is confirmed.
 */
export function AccessibilityConfidence({
  result,
  locale = "he",
}: {
  result: AccessibilityScoreResult | null;
  locale?: string;
}) {
  const ui = getUiTranslations(locale).results;

  if (!result || result.coverage.total === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
        <p className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
          <Accessibility className="h-4 w-4 text-emerald-600" />
          {ui.a11yConfidenceTitle}
        </p>
        <p className="mt-1">{ui.a11yNoData}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
          <Accessibility className="h-4 w-4 text-emerald-600" />
          {ui.a11yConfidenceTitle}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-slate-950 dark:text-white">
            {result.score}
            <span className="text-sm font-bold text-slate-500">/100</span>
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${bandClass[result.band]}`}>
            {BAND_LABELS_HE[result.band]}
          </span>
        </div>
      </div>

      {/* Score is always paired with coverage so it can't hide gaps. */}
      <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">
        {ui.a11yCoverage}: {result.coverage.checked} {ui.a11yOf} {result.coverage.total}
      </p>

      {result.hasCriticalUnknowns ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900 dark:bg-amber-400/10 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {ui.a11yUnverifiedWarning}
        </p>
      ) : null}

      <ul className="mt-3 grid gap-1.5">
        {result.breakdown.map((item) => (
          <li
            key={item.requirement}
            className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-white/5"
          >
            <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
              <StatusIcon status={item.status} />
              {REQUIREMENT_LABELS_HE[item.requirement]}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {STATUS_LABELS_HE[item.status]} · {SOURCE_LABELS_HE[item.source]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
