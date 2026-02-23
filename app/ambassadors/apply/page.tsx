import { AmbassadorApplicationForm } from "@/components/ambassadors/AmbassadorApplicationForm";

export default function Page() {
  return (
    <div className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Ambassadeurs Afroé</h1>
      <p className="text-sm text-muted-foreground">
        2 000+ abonnés. Package troc : services + visibilité dans l'appli (pas de paiement en espèces).
      </p>

      <AmbassadorApplicationForm />
    </div>
  );
}
