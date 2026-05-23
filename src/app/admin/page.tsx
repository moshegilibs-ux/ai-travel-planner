import { AppHeader } from "@/components/app-header";
import { DeveloperSettings } from "@/components/developer-settings";
import {
  getApiStatus,
  isAdminTokenConfigured,
  isValidAdminToken,
} from "@/lib/api-status";
import { rateLimit } from "@/lib/rate-limit";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

function AdminMessage({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <div className="rounded-[2rem] border border-rose-200 bg-white p-8 text-center dark:border-rose-400/30 dark:bg-slate-900">
          <h1 className="text-3xl font-black">{title}</h1>
          <p className="mt-3 text-slate-500">{text}</p>
        </div>
      </main>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const limited = rateLimit({
    key: "admin-page",
    limit: 30,
    windowMs: 60_000,
  });

  if (!limited.ok) {
    return (
      <AdminMessage
        title="Too many requests"
        text="יותר מדי ניסיונות גישה לאזור הניהול. נסו שוב בעוד דקה."
      />
    );
  }

  if (!isAdminTokenConfigured()) {
    return (
      <AdminMessage
        title="Admin לא מוגדר"
        text="יש להגדיר ADMIN_ACCESS_TOKEN בקובץ הסביבה לפני שניתן להיכנס לאזור הניהול."
      />
    );
  }

  if (!isValidAdminToken(params.token)) {
    return (
      <AdminMessage
        title="Unauthorized"
        text="Token חסר או לא תקין. יש להיכנס עם ‎/admin?token=...‎"
      />
    );
  }

  const stats = isDatabaseConfigured()
    ? {
        users: await prisma.user.count(),
        searches: await prisma.searchHistory.count(),
        affiliate: await prisma.affiliateEvent.count(),
        errors: await prisma.errorLog.count(),
      }
    : { users: 0, searches: 0, affiliate: 0, errors: 0 };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <p className="text-sm font-bold text-rose-600">Admin panel</p>
        <h1 className="mt-2 text-4xl font-black">Marketplace operations</h1>
        <section className="mt-8 grid gap-5 md:grid-cols-4">
          {Object.entries(stats).map(([label, value]) => (
            <article key={label} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <p className="text-sm font-bold uppercase text-slate-500">{label}</p>
              <p className="mt-3 text-4xl font-black">{value}</p>
            </article>
          ))}
        </section>
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
          <h2 className="text-2xl font-black">Monitoring</h2>
          <p className="mt-3 text-slate-500">
            Revenue, API usage, AI token usage and error logs are modeled and ready for production dashboards.
          </p>
        </section>
        <DeveloperSettings initialStatus={getApiStatus()} />
      </main>
    </div>
  );
}
