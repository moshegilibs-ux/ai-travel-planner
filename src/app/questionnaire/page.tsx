import { AppHeader } from "@/components/app-header";
import { QuestionnaireForm } from "@/components/questionnaire-form";

export default function QuestionnairePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <QuestionnaireForm />
    </div>
  );
}
