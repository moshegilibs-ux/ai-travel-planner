import { AppHeader } from "@/components/app-header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const cards = [
    ["Saved searches", "Ready via SearchHistory"],
    ["Tracked prices", "Price alerts queue prepared"],
    ["AI usage", "UsageEvent tracks AI_MESSAGE"],
    ["Subscription", "Stripe customer portal ready"],
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <p className="text-sm font-bold text-sky-600 dark:text-sky-300">User dashboard</p>
        <h1 className="mt-2 text-4xl font-black">Welcome {session?.user?.name || "traveler"}</h1>
        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {cards.map(([title, description]) => (
            <article key={title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
