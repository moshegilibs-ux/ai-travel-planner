# Smoke Tests - ai-travel-planner

בדיקות ידניות לאחר דיפלוי Vercel production או preview.

יש להריץ את הבדיקות מול כתובת הדיפלוי:

```text
https://YOUR-VERCEL-DOMAIN.vercel.app
```

## 1. Homepage

URL / Action:

```text
GET /
```

Expected result:

- דף הבית נטען בהצלחה.
- UI בעברית RTL.
- תמונת hero מופיעה.
- אין שגיאות console קריטיות.

Common failure:

- תמונות לא נטענות בגלל הגדרות `next.config`.
- בעיית hydration בגלל ENV שונה בין build/runtime.

Related ENV / API key:

- `NEXT_PUBLIC_USE_MOCK_DATA`

## 2. Admin Without Token

URL / Action:

```text
GET /admin
```

Expected result:

- מוצגת הודעת `Unauthorized`.
- אין חשיפה של status פנימי או secrets.

Common failure:

- Admin פתוח ללא token.
- שגיאת server אם `ADMIN_ACCESS_TOKEN` חסר.

Related ENV / API key:

- `ADMIN_ACCESS_TOKEN`

## 3. Admin With Token

URL / Action:

```text
GET /admin?token=YOUR_ADMIN_ACCESS_TOKEN
```

Expected result:

- Admin dashboard נטען.
- Developer Settings מציגים מצב providers.
- ה־token נמחק מה־URL אחרי טעינה.

Common failure:

- `Unauthorized` בגלל token שגוי או env לא מוגדר.
- `ADMIN_ACCESS_TOKEN` לא הוגדר בסביבת Vercel הנכונה.

Related ENV / API key:

- `ADMIN_ACCESS_TOKEN`

## 4. API Status Without Token

URL / Action:

```text
GET /api/status
```

Expected result:

- תגובת `401`.
- מבנה שגיאה אחיד.

Common failure:

- route מחזיר status ללא token.

Related ENV / API key:

- `ADMIN_ACCESS_TOKEN`

## 5. API Status With Token

URL / Action:

```text
GET /api/status?token=YOUR_ADMIN_ACCESS_TOKEN
```

Expected result:

- תגובת `200`.
- מוחזרים רק booleans ושמות providers.
- אין API keys בתגובה.

Common failure:

- `401` בגלל token שגוי.
- provider מסומן mock בגלל ENV חסר או `NEXT_PUBLIC_USE_MOCK_DATA=true`.

Related ENV / API key:

- `ADMIN_ACCESS_TOKEN`
- `OPENAI_API_KEY`
- `GOOGLE_MAPS_API_KEY`
- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`
- `NEXT_PUBLIC_USE_MOCK_DATA`

## 6. Real Itinerary Generation

URL / Action:

```text
POST /api/ai/itinerary
Content-Type: application/json

{
  "destination": "Athens",
  "days": 3,
  "budget": "$150 per day",
  "interests": ["family", "accessibility", "food"]
}
```

Expected result:

- תגובת `200`.
- `source` הוא `ai` כאשר real mode פעיל והמפתח תקין.
- itinerary כולל ימים ו־places.
- אם ספק נכשל, מתקבל fallback ברור בלי שבירת UI.

Common failure:

- `source=fallback` בגלל `OPENAI_API_KEY` חסר.
- תשובת AI לא תקינה ונפילה ל־mock.

Related ENV / API key:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_USE_MOCK_DATA=false`

## 7. Places Search

URL / Action:

```text
POST /api/places/search
Content-Type: application/json

{
  "destination": "Athens",
  "category": "אטרקציה",
  "query": "accessible museum"
}
```

Expected result:

- תגובת `200`.
- כאשר Google configured ו־mock כבוי, `source=google`.
- מוחזרת רשימת places עם `placeId`, שם, כתובת, דירוג ותמונות אם קיימות.

Common failure:

- `places=[]` בגלל `GOOGLE_MAPS_API_KEY` חסר.
- Google Places API לא מופעל בפרויקט Google Cloud.

Related ENV / API key:

- `GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_USE_MOCK_DATA=false`

## 8. Place Photo

URL / Action:

```text
GET /api/places/photo?name=GOOGLE_PHOTO_NAME
```

Expected result:

- תמונה נטענת.
- response לא חושף API key.
- cache headers קיימים.

Common failure:

- `404 PHOTO_UNAVAILABLE` אם photo name חסר/לא תקין.
- Google photo access לא פעיל.

Related ENV / API key:

- `GOOGLE_MAPS_API_KEY`

## 9. Flights Search

URL / Action:

```text
POST /api/flights/search
Content-Type: application/json

{
  "origin": "TLV",
  "destination": "ATH",
  "departureDate": "2026-08-10",
  "returnDate": "2026-08-17",
  "adults": 2
}
```

Expected result:

- תגובת `200`.
- כאשר Amadeus configured ו־mock כבוי, `source=amadeus`.
- מוחזרות טיסות בפורמט UI קיים.

Common failure:

- fallback ל־mock בגלל credentials חסרים.
- Amadeus test API לא מחזיר תוצאות לתאריכים מסוימים.

Related ENV / API key:

- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`
- `NEXT_PUBLIC_USE_MOCK_DATA=false`

## 10. Saved Trips

URL / Action:

```text
GET /api/saved-trips
POST /api/saved-trips
```

Expected result:

- משתמש לא מחובר מקבל `401`.
- משתמש מחובר עם DB מוגדר יכול לראות/לשמור trips.

Common failure:

- `DATABASE_NOT_CONFIGURED`.
- NextAuth/Google Auth לא מוגדר.

Related ENV / API key:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## 11. Price Tracking

URL / Action:

```text
GET /api/price-tracking
POST /api/price-tracking
```

Expected result:

- משתמש לא מחובר מקבל `401`.
- משתמש מחובר יכול לשמור tracked flight.
- rate limiting פעיל ב־POST.

Common failure:

- DB לא מוגדר.
- session חסר.

Related ENV / API key:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`

## Secret Exposure Check

URL / Action:

```text
Open browser DevTools -> Network / Sources
Search for:
OPENAI_API_KEY
GOOGLE_MAPS_API_KEY
AMADEUS_CLIENT_SECRET
ADMIN_ACCESS_TOKEN
```

Expected result:

- אין secrets ב־client bundle.
- `/api/status` לא מחזיר secrets.

Common failure:

- שימוש בטעות ב־`NEXT_PUBLIC_` עבור secret.
- console logs שמדפיסים env values.

Related ENV / API key:

- כל משתני ה־server-side.
