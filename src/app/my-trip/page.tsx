import { AppHeader } from "@/components/app-header";
import { MyTripView } from "@/components/my-trip-view";

export default function MyTripPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <MyTripView />
    </div>
  );
}
