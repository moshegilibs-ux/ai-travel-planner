import { AppHeader } from "@/components/app-header";

const notifications = [
  ["Price drop alerts", "We will notify you when tracked flights hit your target price."],
  ["Trip reminders", "Upcoming trip checklists and airport reminders."],
  ["AI recommendations", "Personalized suggestions from your travel memory."],
  ["Email queue", "Prepared for background delivery workers."],
];

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="text-4xl font-black">Notification center</h1>
        <div className="mt-8 grid gap-4">
          {notifications.map(([title, body]) => (
            <article key={title} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <h2 className="font-black">{title}</h2>
              <p className="mt-2 text-sm text-slate-500">{body}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
