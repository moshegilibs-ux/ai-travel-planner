import { AppHeader } from "@/components/app-header";
import { ResultsView } from "@/components/results-view";

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <ResultsView />
    </div>
  );
}
