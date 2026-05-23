import { AppHeader } from "@/components/app-header";
import { LoadingSkeletons } from "@/components/travel-dashboard-widgets";

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6">
          <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="mt-3 h-10 w-72 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
        </div>
        <LoadingSkeletons />
        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-[2rem] bg-slate-200 dark:bg-white/10" />
          <div className="h-48 animate-pulse rounded-[2rem] bg-slate-200 dark:bg-white/10" />
        </section>
      </main>
    </div>
  );
}
