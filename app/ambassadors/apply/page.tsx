import { AmbassadorApplicationForm } from "@/components/ambassadors/AmbassadorApplicationForm";

export default function AmbassadorApplyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white py-6">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-xl font-bold text-neutral-900">Programme Ambassadeur</h1>
        </div>
      </header>

      <main className="py-12 px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="mx-auto max-w-3xl h-auto">
          <AmbassadorApplicationForm />
        </div>
      </main>
    </div>
  );
}
