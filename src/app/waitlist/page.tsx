import { AppHeader } from "@/components/app-header";

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppHeader />
      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1fr_420px] lg:items-center">
        <section>
          <p className="inline-flex rounded-full bg-sky-400/10 px-4 py-2 text-sm font-bold text-sky-200">
            רשימת המתנה לבטא
          </p>
          <h1 className="mt-5 text-5xl font-black tracking-tight md:text-7xl">
            חופשות נגישות למשפחות אמיתיות.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            טיולים וחלומות עוזרת לתכנן חופשה רגועה למשפחות, מבוגרים ואנשים עם
            מוגבלויות. הצטרפו לרשימת ההמתנה וקבלו גישה מוקדמת.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            {["תכנון AI נגיש", "מעקב מחירים", "מסלולים שמורים"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                {item}
              </div>
            ))}
          </div>
        </section>

        <form
          action="/api/waitlist"
          method="post"
          className="rounded-[2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl"
        >
          <h2 className="text-2xl font-black">קבלו גישה מוקדמת</h2>
          <p className="mt-2 text-sm text-slate-600">
            נשלח מייל כשההזמנה לבטא תהיה מוכנה.
          </p>
          <label className="mt-6 block text-sm font-bold">
            אימייל
            <input
              required
              type="email"
              name="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500"
            />
          </label>
          <button className="mt-5 w-full rounded-full bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-sky-600">
            הצטרפות לרשימה
          </button>
        </form>
      </main>
    </div>
  );
}
