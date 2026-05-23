import { AppHeader } from "@/components/app-header";
import { SavedTripsView } from "@/components/saved-trips-view";

export default function SavedTripsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <SavedTripsView />
    </div>
  );
}
