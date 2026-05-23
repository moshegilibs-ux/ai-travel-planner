import { AppHeader } from "@/components/app-header";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-5 py-14">
        <h1 className="text-4xl font-black">תנאי שימוש</h1>
        <div className="mt-6 space-y-5 leading-8 text-slate-600 dark:text-slate-300">
          <p>טיולים וחלומות מספקת כלי תכנון טיולים, השוואת מחירים והמלצות AI. מחירים וזמינות עשויים להשתנות.</p>
          <p>המשתמשים אחראים לוודא תנאי הזמנה, כבודה, דרישות ויזה, נגישות בפועל ומדיניות ספקים לפני רכישה.</p>
          <p>מנויים מתחדשים חודשית עד לביטול דרך ספק החיוב.</p>
          <p>זהו מבנה מוכן להשקה ויש להעביר אותו לבדיקה משפטית לפני פרסום רחב.</p>
        </div>
      </main>
    </div>
  );
}
