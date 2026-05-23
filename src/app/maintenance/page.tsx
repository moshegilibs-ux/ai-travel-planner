export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
      <section className="max-w-xl rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sky-300">
          מצב תחזוקה
        </p>
        <h1 className="mt-4 text-4xl font-black">טיולים וחלומות עוברת שדרוג קצר.</h1>
        <p className="mt-4 text-slate-300">
          אנחנו מעדכנים את המערכת כדי להחזיר חיפוש, מסלולים שמורים ותכנון AI
          נגיש בצורה יציבה יותר.
        </p>
      </section>
    </main>
  );
}
