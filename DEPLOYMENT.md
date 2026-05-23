# טיולים וחלומות - Production Deployment

מסמך הכנה לפרודקשן עבור `ai-travel-planner`.

לאחר כל דיפלוי, להריץ גם את תוכנית הבדיקות הידנית:

```text
SMOKE_TESTS.md
```

## Local Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

ברירת מחדל מקומית מומלצת:

```bash
npm run dev -- -p 3001
```

## Required Environment Variables

הקובץ `.env.example` מכיל את משתני הסביבה הקריטיים להפעלה אמיתית:

```env
OPENAI_API_KEY=
GOOGLE_MAPS_API_KEY=
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
ADMIN_ACCESS_TOKEN=
NEXT_PUBLIC_USE_MOCK_DATA=false
NODE_ENV=development
```

ב־production יש להגדיר את אותם משתנים ב־Vercel Project Settings או בספק הדיפלוי.

## ENV Validation

הפרויקט משתמש ב־`src/lib/env.ts` כ־utility מרכזי לניהול ENV.

ה־utility מספק:

- `isProduction`
- `isMockMode`
- `hasOpenAI`
- `hasGoogleMaps`
- `hasAmadeus`
- `validateProductionRuntimeEnv`

ב־`NODE_ENV=production`:

- אם `ADMIN_ACCESS_TOKEN` חסר, Admin ו־status API לא יאפשרו גישה.
- אם `NEXT_PUBLIC_USE_MOCK_DATA=false`, חסרון של `OPENAI_API_KEY`, `GOOGLE_MAPS_API_KEY`, `AMADEUS_CLIENT_ID` או `AMADEUS_CLIENT_SECRET` יגרום לשגיאה ברורה.
- אם `NEXT_PUBLIC_USE_MOCK_DATA=true`, תודפס אזהרה ברורה שהמערכת בפרודקשן עובדת עם mock data.

## Mock vs Production Behavior

`NEXT_PUBLIC_USE_MOCK_DATA=true`:

- אין קריאות חיצוניות אמיתיות מטיסות, מקומות או AI במסלולים שעברו דרך שכבת השירותים.
- המערכת מדפיסה log ברור שמסביר ש־mock data פעיל.
- מתאים לפיתוח UI, בדיקות דמו ו־staging ללא עלויות API.

`NEXT_PUBLIC_USE_MOCK_DATA=false`:

- AI משתמש ב־OpenAI.
- Places/Maps משתמשים ב־Google Maps / Places API.
- Flights משתמשים ב־Amadeus.
- אם ספק חיצוני נכשל בזמן ריצה, השירותים עדיין כוללים fallback כדי שה־UI לא יישבר, אבל בפרודקשן חסרון ENV קריטי ייכשל בצורה ברורה.

## APIs Required

- OpenAI API: יצירת מסלולים חכמה ו־AI assistant.
- Google Places / Maps API: מקומות, תמונות וקישורי מפה.
- Amadeus API: חיפוש טיסות.
- Admin token: הגנה בסיסית על `/admin` ו־`/api/status`.

## Build Commands

```bash
npm install
npm run lint
npm run build
```

Vercel:

- Framework: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `.next`
- Root directory: `ai-travel-planner`

## Actual Vercel Deployment Steps

1. Connect GitHub repo to Vercel

   - Vercel Dashboard -> Add New Project.
   - Import the repository that contains `ai-travel-planner`.
   - Set Root Directory to:

   ```text
   ai-travel-planner
   ```

2. Confirm project settings

   - Framework Preset: `Next.js`
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. Set Environment Variables

   Production:

   ```env
   NODE_ENV=production
   NEXT_PUBLIC_USE_MOCK_DATA=false
   OPENAI_API_KEY=...
   GOOGLE_MAPS_API_KEY=...
   AMADEUS_CLIENT_ID=...
   AMADEUS_CLIENT_SECRET=...
   ADMIN_ACCESS_TOKEN=...
   ```

   Preview:

   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ADMIN_ACCESS_TOKEN=...
   ```

   Development:

   ```env
   NODE_ENV=development
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ADMIN_ACCESS_TOKEN=dev-token
   ```

4. Deploy Preview

   - Push a branch or open a Pull Request.
   - Wait for Vercel preview deployment.
   - Run `SMOKE_TESTS.md` against the preview URL.

5. Deploy Production

   - Merge to the production branch configured in Vercel.
   - Confirm the production deployment completed.
   - Run `SMOKE_TESTS.md` against the production URL.

6. Post-deploy checks

   - Verify `/api/status?token=...`.
   - Verify real providers show active when `NEXT_PUBLIC_USE_MOCK_DATA=false`.
   - Verify no secrets appear in browser DevTools, network responses or logs.

## Vercel Deployment Notes

- להגדיר את כל משתני הסביבה ב־Vercel Project Settings.
- לוודא ש־`NEXT_PUBLIC_USE_MOCK_DATA=false` רק אחרי שה־API keys קיימים.
- API keys כמו `OPENAI_API_KEY`, `GOOGLE_MAPS_API_KEY`, `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`, `ADMIN_ACCESS_TOKEN` חייבים להיות server-side בלבד.
- לא להוסיף API keys עם prefix של `NEXT_PUBLIC_`, למעט `NEXT_PUBLIC_USE_MOCK_DATA`.
- לוודא ש־API routes עובדים בצד שרת:
  - `/api/ai/itinerary`
  - `/api/places/search`
  - `/api/places/photo`
  - `/api/flights/search`
  - `/api/status?token=...`
- לבדוק fallback: אם ספק API נכשל, האתר צריך להמשיך לעבוד עם mock data.

## Vercel ENV Setup

Production:

```env
NODE_ENV=production
NEXT_PUBLIC_USE_MOCK_DATA=false
OPENAI_API_KEY=...
GOOGLE_MAPS_API_KEY=...
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...
ADMIN_ACCESS_TOKEN=...
```

Preview:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
ADMIN_ACCESS_TOKEN=...
```

אפשר להוסיף API keys אמיתיים גם ל־Preview אם רוצים לבדוק אינטגרציות לפני production.

Development:

```env
NODE_ENV=development
NEXT_PUBLIC_USE_MOCK_DATA=true
ADMIN_ACCESS_TOKEN=dev-token
```

ב־production, אם `NEXT_PUBLIC_USE_MOCK_DATA` לא מוגדר במפורש, ברירת המחדל היא real mode. בפיתוח, אם הוא לא מוגדר, ברירת המחדל היא mock mode.

## Production Health Checklist

- [ ] `/` מחזיר 200 ומציג את דף הבית בעברית RTL.
- [ ] `/admin?token=...` עובד רק עם `ADMIN_ACCESS_TOKEN` תקין.
- [ ] `/api/status?token=...` מחזיר provider status בלי secrets.
- [ ] `/api/status` ללא token מחזיר 401.
- [ ] יצירת מסלול AI עובדת או מחזירה fallback ברור.
- [ ] Places search עובד עם Google Places או חוזר ל־fallback ברור.
- [ ] Flights search עובד עם Amadeus או חוזר ל־fallback ברור.
- [ ] אין API keys ב־client bundle או בתשובות API.
- [ ] `npm run lint` ו־`npm run build` עוברים בסביבת CI/Vercel.

## Smoke Test After Deployment

פירוט מלא נמצא ב־`SMOKE_TESTS.md`.

```text
GET /
GET /admin
GET /admin?token=YOUR_ADMIN_ACCESS_TOKEN
GET /api/status
GET /api/status?token=YOUR_ADMIN_ACCESS_TOKEN
POST /api/ai/itinerary
POST /api/places/search
POST /api/flights/search
```

ציפיות:

- `/admin` ללא token מציג Unauthorized.
- `/api/status` ללא token מחזיר 401.
- `/api/status?token=...` לא מחזיר מפתחות, רק booleans ושמות providers.
- AI/Places/Flights מחזירים real data כש־ENV תקין ו־mock כבוי.
- אם ספק נכשל, ה־UI לא נשבר ומתקבלת הודעת fallback ברורה.

## Troubleshooting ENV

- `Missing required production environment variables`: חסר משתנה קריטי בפרודקשן. בדקו את הרשימה בהודעת השגיאה.
- `Admin לא מוגדר`: חסר `ADMIN_ACCESS_TOKEN`.
- `Unauthorized`: ה־token ב־`/admin?token=...` או `/api/status?token=...` לא תואם ל־`ADMIN_ACCESS_TOKEN`.
- האתר מציג mock data בפרודקשן: בדקו ש־`NEXT_PUBLIC_USE_MOCK_DATA=false`.
- Flight API חוזר ל־mock: בדקו `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET` והפעלת Amadeus test/prod environment.
- Places API חוזר ל־mock: בדקו `GOOGLE_MAPS_API_KEY` והרשאות Places API.
- AI חוזר ל־mock: בדקו `OPENAI_API_KEY` ומכסות חשבון.

## Production Checklist

- [ ] להגדיר את כל ENV variables בפרודקשן.
- [ ] לבדוק ש־`npm run build` עובר נקי.
- [ ] לבדוק ש־`/` עולה תקין.
- [ ] לבדוק ש־`/admin?token=...` נפתח רק עם token תקין.
- [ ] לבדוק ש־`/api/status?token=...` מחזיר סטטוס בלי לחשוף מפתחות.
- [ ] לבדוק יצירת מסלול AI עם `NEXT_PUBLIC_USE_MOCK_DATA=false`.
- [ ] לבדוק חיפוש טיסות Amadeus.
- [ ] לבדוק החלפת מקום עם Google Places.
- [ ] לבדוק fallback ללא API keys בסביבת staging.
- [ ] לבדוק mobile layout ו־RTL.

## Security Checklist

- [ ] להחליף query token ל־secure session/cookie בעתיד.
- [x] להוסיף rate limiting בסיסי ל־Admin ול־status route.
- [ ] לחייב HTTPS בפרודקשן.
- [ ] להוסיף monitoring/logging ל־API failures.
- [x] להגן על admin ו־status route עם `ADMIN_ACCESS_TOKEN`.
- [ ] להחליף את `ADMIN_ACCESS_TOKEN` ל־auth מלא עם session, RBAC ו־cookie מאובטח.
- [ ] להוסיף audit log לניסיונות כניסה כושלים.
- [ ] לוודא שאין API keys בקוד, ב־client bundle או ב־logs.
- [ ] להגדיר rotation policy ל־API keys.

## Admin Auth

Admin מוגן כרגע באמצעות `ADMIN_ACCESS_TOKEN`.

כניסה:

```text
/admin?token=YOUR_ADMIN_ACCESS_TOKEN
```

בדיקת סטטוס:

```text
/api/status?token=YOUR_ADMIN_ACCESS_TOKEN
```

ה־token לא נשמר ב־`localStorage`, ובדף ה־Admin הוא נמחק מה־URL אחרי טעינה.

## Rate Limiting

נוסף rate limiting בסיסי לנתיבים רגישים:

- `/admin`
- `/api/status`

זהו מנגנון in-memory בסיסי שמתאים להגנה ראשונית. בפרודקשן עם כמה instances מומלץ להחליף/להרחיב ל־Redis או provider חיצוני כדי שהמגבלה תהיה עקבית בין שרתים.

## Remaining Security Notes

- Query token הוא פתרון זמני בלבד. לפני פתיחה רחבה מומלץ לעבור ל־secure session/cookie.
- שגיאות API מוחזרות במבנה אחיד `{ error: { code, message, details } }` בנתיבים הרגישים.
- יש להוסיף audit logs לניסיונות כניסה כושלים.
- יש לחייב HTTPS בכל סביבת production.
- יש לוודא rotation ל־`ADMIN_ACCESS_TOKEN` ולמפתחות API.
- יש להוסיף CSP מחמיר יותר אם מתחילים להטמיע ספקי צד שלישי נוספים.

## Deployment Notes

- התחילו עם `NEXT_PUBLIC_USE_MOCK_DATA=true` אם רוצים לבדוק UI בלבד.
- עברו ל־`NEXT_PUBLIC_USE_MOCK_DATA=false` רק אחרי שכל הספקים מוגדרים.
- שמרו staging נפרד מפרודקשן כדי לבדוק מכסות API וחיובים.
- מומלץ להפעיל monitoring לפני פתיחה לקהל אמיתי.
## Real Provider Reliability Policy

Production must not invent travel prices, availability, images or booking options.

Required Vercel environment variables for verified provider data:

```env
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
HOTEL_API_KEY=
FX_API_KEY=
WEATHER_API_KEY=
OPENAI_API_KEY=
GOOGLE_MAPS_API_KEY=
ADMIN_ACCESS_TOKEN=
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Runtime behavior:

- Flights use Amadeus when credentials are configured.
- Hotels use Amadeus Hotels now, with `HOTEL_API_KEY` reserved for Booking/Expedia affiliate integration.
- Currency rates use `/api/fx` server-side only.
- Weather uses `/api/weather` server-side only.
- Provider keys are never sent to the client.
- If a provider fails or returns no verified offers, the UI must show `לא זמין כרגע`.
- Use `מחיר בזמן אמת` only for verified API data.
- Use `הערכה בלבד` for food, activities, fees and safety margin.
- Budget total must equal: `flight + hotel + food + activities + fees + safetyMargin`.

Pre-deploy checks:

```bash
npm run lint
npm test
npm run build
```
