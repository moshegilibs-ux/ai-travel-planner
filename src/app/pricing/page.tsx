import { AppHeader } from "@/components/app-header";
import { plans } from "@/lib/plans";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-5 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-sky-600 dark:text-sky-300">Monetization</p>
          <h1 className="mt-2 text-5xl font-black">Plans for every traveler</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Start free, upgrade for more AI planning, price tracking, saved searches and marketplace automation.
          </p>
        </div>
        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {Object.entries(plans).map(([key, plan]) => (
            <article key={key} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <h2 className="text-2xl font-black">{plan.name}</h2>
              <p className="mt-3 text-4xl font-black">${plan.price}<span className="text-base font-medium text-slate-500">/mo</span></p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {plan.features.map((feature) => <li key={feature}>• {feature}</li>)}
                <li>• {plan.aiMessages} AI messages/month</li>
                <li>• {plan.searches} searches/month</li>
              </ul>
              <form action="/api/billing/checkout" method="POST">
                <input type="hidden" name="plan" value={key} />
                <button className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950">
                  {key === "FREE" ? "Start free" : "Subscribe"}
                </button>
              </form>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
