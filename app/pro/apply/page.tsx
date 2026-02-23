import { ProApplicationMultiStepForm } from "@/src/components/pro/ProApplicationMultiStepForm";

export default function ProApplyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Afroé PRO
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                Rejoignez notre réseau de professionnels de la beauté
              </p>
            </div>
            <a
              href="/"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              ← Retour
            </a>
          </div>
        </div>
      </header>

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Devenez Professionnel Afroé
            </h2>
            <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
              Complétez ce formulaire en 3 étapes pour rejoindre notre plateforme.
              Nous recherchons des professionnels passionnés et qualifiés dans les domaines
              de la coiffure, l'esthétique, la manucure et le maquillage.
            </p>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-3 inline-flex rounded-lg bg-neutral-100 p-3">
                <svg
                  className="h-6 w-6 text-neutral-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-900">Missions Flexibles</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Choisissez vos missions selon votre disponibilité et vos préférences
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-3 inline-flex rounded-lg bg-neutral-100 p-3">
                <svg
                  className="h-6 w-6 text-neutral-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-900">Réseau Premium</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Accédez à une clientèle qualifiée et diversifiée
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-3 inline-flex rounded-lg bg-neutral-100 p-3">
                <svg
                  className="h-6 w-6 text-neutral-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-900">Paiements Sécurisés</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Recevez vos paiements rapidement et en toute sécurité
              </p>
            </div>
          </div>

          <ProApplicationMultiStepForm />

          <div className="mt-8 rounded-lg border bg-neutral-50 p-6 text-center">
            <p className="text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">Confidentialité garantie.</span>{" "}
              Vos données sont traitées de manière sécurisée et confidentielle.
              Nous vous contacterons sous 48-72h après examen de votre candidature.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
