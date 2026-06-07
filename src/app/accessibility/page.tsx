import { AppHeader } from "@/components/app-header";
import { AccessibilityOnboarding } from "@/components/accessibility-onboarding";

export default function AccessibilityProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <AccessibilityOnboarding />
      </main>
    </div>
  );
}
