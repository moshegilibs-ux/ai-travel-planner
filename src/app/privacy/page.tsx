import { AppHeader } from "@/components/app-header";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-5 py-14">
        <h1 className="text-4xl font-black">מדיניות פרטיות</h1>
        <div className="mt-6 space-y-5 leading-8 text-slate-600 dark:text-slate-300">
          <p>טיולים וחלומות שומרת נתוני חשבון, חיפוש, מסלולים שמורים ושימוש כדי לספק תכנון טיולים נגיש.</p>
          <p>אנחנו משתמשים באנליטיקה וניטור שגיאות כדי לשפר אמינות. משתמשים יכולים לבקש ייצוא או מחיקה של מידע אישי.</p>
          <p>קישורי שותפים עשויים לכלול פרמטרים למדידת הזמנות.</p>
          <p>זהו מבנה מוכן להשקה ויש להעביר אותו לבדיקה משפטית לפני פרסום רחב.</p>
        </div>
      </main>
    </div>
  );
}
