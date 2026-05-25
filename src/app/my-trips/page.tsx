import { AppHeader } from "@/components/app-header";
import { MyTripsView } from "@/components/my-trips-view";

export default function MyTripsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <MyTripsView />
    </div>
  );
}
