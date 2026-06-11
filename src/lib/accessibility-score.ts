/**
 * accessibility-score.ts
 * ---------------------------------------------------------------------------
 * מודול חישוב "ציון ביטחון נגישות" עבור "טיולים וחלומות".
 *
 * הרעיון: במקום סימון בינארי "נגיש / לא נגיש", מחזירים ציון מדורג (0–100)
 * המותאם לפרופיל הספציפי של המשתמש, יחד עם פירוק שקוף של מה נבדק,
 * מה אומת, ומה לא ידוע.
 *
 * שלושה רכיבים מרכיבים את הציון:
 *   1. התאמה לפרופיל (Match)   — כל דרישה נשקלת לפי החשיבות שלה לפרופיל
 *   2. אמינות המקור (Confidence) — מאיפה הגיע המידע (אדם > API > הצהרה)
 *   3. כיסוי (Coverage)         — כמה מהדרישות הקריטיות בכלל נבדקו
 *
 * עיקרון ברזל: לעולם לא להמציא נתון חסר. "לא ידוע" הוא מצב לגיטימי.
 * ---------------------------------------------------------------------------
 */

/* ===========================================================================
 * 1. טיפוסי יסוד
 * ======================================================================== */

/** סוגי הפרופיל הנתמכים. ניתן לשלב כמה יחד (משפחה עם סבא בקלנועית). */
export type ProfileType =
  | "wheelchair"   // כיסא גלגלים
  | "scooter"      // קלנועית
  | "walker"       // הליכון
  | "elderly"      // מבוגר
  | "family";      // משפחה עם ילדים

/** מזהי הדרישות לנגישות — תואמים לשדות שהוגדרו במוצר. */
export type RequirementId =
  | "step_free_access"      // גישה ללא מדרגות
  | "elevator"              // מעלית חובה
  | "accessible_bathroom"   // חדר רחצה נגיש
  | "accessible_toilet"     // שירותים נגישים
  | "short_walking"         // מרחקי הליכה קצרים
  | "wide_doors"            // רוחב דלת מספק
  | "ramp"                  // רמפה
  | "medical_nearby";       // סיוע רפואי קרוב

/**
 * מצב הידיעה על דרישה מסוימת במלון/יעד.
 * "unknown" הוא ברירת המחדל — אסור לנחש.
 */
export type FactStatus = "verified" | "declared" | "unknown" | "absent";

/**
 * מקור המידע. קובע את מקדם האמינות.
 *   user_review  — ביקורת של משתמש אמיתי עם אותו צורך   → 1.0
 *   manual_audit — אימות ידני של הצוות שלנו              → 1.0
 *   api          — נתון מ-API (Amadeus וכו')             → 0.6
 *   hotel_claim  — הצהרה עצמית של המלון                  → 0.4
 *   none         — אין מקור (status = unknown)           → 0.0
 */
export type SourceType =
  | "user_review"
  | "manual_audit"
  | "api"
  | "hotel_claim"
  | "none";

/** עובדה בודדת שנאספה על דרישה אחת. */
export interface AccessibilityFact {
  requirement: RequirementId;
  status: FactStatus;
  source: SourceType;
  /** הערה חופשית להצגה למשתמש, למשל "רוחב דלת 82 ס״מ". אופציונלי. */
  note?: string;
}

/** הפרופיל של המשתמש — אילו צרכים פעילים. */
export interface UserProfile {
  types: ProfileType[];
}

/* ===========================================================================
 * 2. מקדמי אמינות לפי מקור
 * ======================================================================== */

export const SOURCE_CONFIDENCE: Record<SourceType, number> = {
  user_review: 1.0,
  manual_audit: 1.0,
  api: 0.6,
  hotel_claim: 0.4,
  none: 0.0,
};

/* ===========================================================================
 * 3. טבלת משקלים — כמה כל דרישה "שווה" לכל סוג פרופיל
 * ---------------------------------------------------------------------------
 * סולם 0–10. 10 = קריטי (בלעדיו הטיול בלתי אפשרי), 0 = לא רלוונטי.
 * אלה ערכי התחלה סבירים — כדאי לכייל מולם משתמשים אמיתיים בהמשך.
 * ======================================================================== */

export const PROFILE_WEIGHTS: Record<
  ProfileType,
  Partial<Record<RequirementId, number>>
> = {
  wheelchair: {
    step_free_access: 10,
    wide_doors: 10,
    elevator: 9,
    accessible_bathroom: 9,
    accessible_toilet: 8,
    ramp: 7,
    short_walking: 4,
    medical_nearby: 3,
  },
  scooter: {
    step_free_access: 10,
    wide_doors: 10,
    elevator: 10, // קלנועית רחבה יותר — מעלית צרה חוסמת לגמרי
    ramp: 8,
    accessible_bathroom: 7,
    accessible_toilet: 6,
    short_walking: 3,
    medical_nearby: 3,
  },
  walker: {
    short_walking: 10, // ההליכון = בעיקר מרחקים וקצב
    elevator: 8,
    step_free_access: 7,
    accessible_bathroom: 6,
    accessible_toilet: 5,
    ramp: 4,
    wide_doors: 3,
    medical_nearby: 4,
  },
  elderly: {
    short_walking: 8,
    elevator: 8,
    medical_nearby: 7, // קרבה לסיוע רפואי חשובה במיוחד
    step_free_access: 6,
    accessible_bathroom: 5,
    accessible_toilet: 4,
    ramp: 3,
    wide_doors: 2,
  },
  family: {
    short_walking: 5,
    elevator: 5,
    step_free_access: 4, // עגלת תינוק נהנית מאותם פתרונות
    medical_nearby: 4,
    accessible_bathroom: 2,
    ramp: 2,
    accessible_toilet: 2,
    wide_doors: 2,
  },
};

/**
 * סף שמעליו דרישה נחשבת "קריטית" לצורך חישוב הכיסוי (Coverage).
 * דרישה במשקל גבוה שלא נבדקה כלל פוגעת בכיסוי.
 */
export const CRITICAL_WEIGHT_THRESHOLD = 7;

/* ===========================================================================
 * 4. מיזוג משקלים כשיש כמה סוגי פרופיל
 * ---------------------------------------------------------------------------
 * משפחה עם סבא בקלנועית = ["scooter", "elderly", "family"].
 * לכל דרישה לוקחים את המשקל הגבוה ביותר מבין כל הפרופילים —
 * כי אם צורך כלשהו קריטי למישהו במשפחה, הוא קריטי לטיול כולו.
 * ======================================================================== */

export function mergeWeights(
  profile: UserProfile,
): Partial<Record<RequirementId, number>> {
  const merged: Partial<Record<RequirementId, number>> = {};
  for (const type of profile.types) {
    const weights = PROFILE_WEIGHTS[type];
    for (const key in weights) {
      const reqId = key as RequirementId;
      const w = weights[reqId] ?? 0;
      if (w > (merged[reqId] ?? 0)) {
        merged[reqId] = w;
      }
    }
  }
  return merged;
}

/* ===========================================================================
 * 5. תרגום מצב עובדה לערך התאמה (0–1)
 * ---------------------------------------------------------------------------
 *   verified / declared → 1   (הדרישה מסופקת; האמינות תיקבע ע"י המקור)
 *   absent              → 0   (נבדק במפורש שאין — פגיעה מלאה)
 *   unknown             → null (לא נכנס לחישוב הציון, אבל פוגע בכיסוי)
 * ======================================================================== */

function statusValue(status: FactStatus): number | null {
  switch (status) {
    case "verified":
    case "declared":
      return 1;
    case "absent":
      return 0;
    case "unknown":
      return null;
  }
}

/* ===========================================================================
 * 6. תוצאת החישוב
 * ======================================================================== */

export type ConfidenceBand = "high" | "medium" | "low";

export interface RequirementBreakdown {
  requirement: RequirementId;
  weight: number;
  status: FactStatus;
  source: SourceType;
  sourceConfidence: number;
  note?: string;
}

export interface AccessibilityScoreResult {
  /** הציון הסופי 0–100 */
  score: number;
  band: ConfidenceBand;
  /** כמה דרישות קריטיות נבדקו מתוך כמה קיימות, למשל "5 מתוך 7" */
  coverage: { checked: number; total: number };
  /** האם נותרו דרישות קריטיות לא ידועות — טריגר לקונסיירז' אנושי */
  hasCriticalUnknowns: boolean;
  breakdown: RequirementBreakdown[];
}

function bandFromScore(score: number): ConfidenceBand {
  if (score >= 80) return "high";
  if (score >= 55) return "medium";
  return "low";
}

/* ===========================================================================
 * 7. הפונקציה המרכזית
 * ======================================================================== */

export function calculateAccessibilityScore(
  profile: UserProfile,
  facts: AccessibilityFact[],
): AccessibilityScoreResult {
  const weights = mergeWeights(profile);
  const factByReq = new Map<RequirementId, AccessibilityFact>();
  for (const f of facts) factByReq.set(f.requirement, f);

  let weightedSum = 0; // מונה: Σ (משקל × ערך × אמינות)
  let weightTotal = 0; // מכנה: Σ משקל (רק לדרישות שנכנסו לחישוב)
  let criticalChecked = 0;
  let criticalTotal = 0;
  let hasCriticalUnknowns = false;

  const breakdown: RequirementBreakdown[] = [];

  for (const key in weights) {
    const reqId = key as RequirementId;
    const weight = weights[reqId] ?? 0;
    if (weight <= 0) continue;

    const isCritical = weight >= CRITICAL_WEIGHT_THRESHOLD;
    if (isCritical) criticalTotal++;

    const fact = factByReq.get(reqId);
    let status: FactStatus = fact?.status ?? "unknown";
    const source: SourceType = fact?.source ?? "none";
    const confidence = SOURCE_CONFIDENCE[source];

    // הקשחה: "אומת"/"הוצהר" ללא מקור אמיתי (confidence 0) אינו ידיעה אמיתית —
    // מתייחסים אליו כ-"לא ידוע" כדי שלא ינופח ציון על סמך מקור ריק.
    if ((status === "verified" || status === "declared") && confidence === 0) {
      status = "unknown";
    }

    const value = statusValue(status);

    breakdown.push({
      requirement: reqId,
      weight,
      status,
      source,
      sourceConfidence: confidence,
      note: fact?.note,
    });

    if (value === null) {
      // unknown — לא נכנס לציון אבל פוגע בכיסוי
      if (isCritical) hasCriticalUnknowns = true;
      continue;
    }

    if (isCritical) criticalChecked++;

    // דרישה שנבדקה: תורמת לפי המשקל, מעוכבת באמינות המקור.
    weightedSum += weight * value * confidence;
    weightTotal += weight;
  }

  const score =
    weightTotal === 0 ? 0 : Math.round((weightedSum / weightTotal) * 100);

  // מיון התצוגה: קריטי קודם, ובתוך זה אומת מעל לא ידוע
  const statusRank: Record<FactStatus, number> = {
    verified: 0,
    declared: 1,
    absent: 2,
    unknown: 3,
  };
  breakdown.sort(
    (a, b) => b.weight - a.weight || statusRank[a.status] - statusRank[b.status],
  );

  return {
    score,
    band: bandFromScore(score),
    coverage: { checked: criticalChecked, total: criticalTotal },
    hasCriticalUnknowns,
    breakdown,
  };
}

/* ===========================================================================
 * 8. תוויות בעברית להצגה ב-UI (RTL)
 * ======================================================================== */

export const REQUIREMENT_LABELS_HE: Record<RequirementId, string> = {
  step_free_access: "גישה ללא מדרגות",
  elevator: "מעלית",
  accessible_bathroom: "חדר רחצה נגיש",
  accessible_toilet: "שירותים נגישים",
  short_walking: "מרחקי הליכה קצרים",
  wide_doors: "רוחב דלת מספק",
  ramp: "רמפה",
  medical_nearby: "סיוע רפואי קרוב",
};

export const STATUS_LABELS_HE: Record<FactStatus, string> = {
  verified: "אומת",
  declared: "הוצהר",
  unknown: "לא ידוע",
  absent: "לא קיים",
};

export const SOURCE_LABELS_HE: Record<SourceType, string> = {
  user_review: "אומת בביקורת משתמש",
  manual_audit: "אומת על ידי הצוות",
  api: "נתון API",
  hotel_claim: "הצהרת מלון בלבד",
  none: "לא ידוע",
};

export const BAND_LABELS_HE: Record<ConfidenceBand, string> = {
  high: "ביטחון גבוה",
  medium: "ביטחון בינוני",
  low: "ביטחון נמוך",
};

/* ===========================================================================
 * 9. דוגמת שימוש — מלון אגאיון, פרופיל קלנועית + מבוגר
 * ---------------------------------------------------------------------------
 * ניתן לייבא ולהריץ exampleAgaeonHotel() כדי לקבל את התוצאה לדוגמה.
 * ======================================================================== */

export function exampleAgaeonHotel(): AccessibilityScoreResult {
  const profile: UserProfile = { types: ["scooter", "elderly"] };

  const facts: AccessibilityFact[] = [
    { requirement: "step_free_access", status: "verified", source: "user_review" },
    { requirement: "elevator", status: "verified", source: "user_review", note: "רוחב דלת 82 ס״מ" },
    { requirement: "accessible_bathroom", status: "declared", source: "hotel_claim" },
    { requirement: "short_walking", status: "verified", source: "api" },
    { requirement: "ramp", status: "unknown", source: "none" },
    { requirement: "medical_nearby", status: "unknown", source: "none" },
  ];

  return calculateAccessibilityScore(profile, facts);
}
