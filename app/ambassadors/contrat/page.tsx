import Link from "next/link";

export default function AmbassadorContratPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header style={{ background: "linear-gradient(90deg,#010873,#0a3db4,#6d94ef)" }}
              className="py-6 px-8">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <span className="text-xs font-bold tracking-widest uppercase text-blue-200">
            Afroé — Ambassadeur·ice
          </span>
          <span className="text-xs text-blue-200 tracking-wider">Glow List</span>
        </div>
      </header>

      <main className="py-16 px-6">
        <div className="mx-auto max-w-2xl">

          {/* Badge */}
          <div className="inline-block mb-8 border border-violet-500/40 rounded-full px-5 py-2
                          bg-violet-500/10 text-xs font-bold tracking-widest uppercase text-violet-300">
            ✦ &nbsp;L'Alliance Afroé
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold leading-tight mb-4">
            La transparence,<br/>
            <span className="text-violet-400">c'est notre base.</span>
          </h1>
          <p className="text-white/60 text-base leading-relaxed mb-12">
            Pour activer tes commissions, tes dotations exclusives et tous les avantages
            du programme ambassadeur — on formalise ta collaboration avec Afroé.
            Simple. Rapide. Sécurisé.
          </p>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {[
              { step: "01", title: "Tu remplis ta candidature", desc: "Tes coordonnées officielles via le formulaire." },
              { step: "02", title: "On prépare ton contrat", desc: "L'équipe génère ton contrat sur mesure sous 48h." },
              { step: "03", title: "Tu signes en ligne", desc: "Signature électronique sécurisée. C'est officiel." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="text-xs font-bold text-violet-400 tracking-widest uppercase mb-2">{step}</div>
                <div className="font-semibold text-white text-sm mb-1">{title}</div>
                <div className="text-xs text-white/50 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-8 text-center">
            <p className="text-white/70 text-sm mb-6 leading-relaxed">
              Tu n'as pas encore rempli ta candidature ?<br/>
              Commence par là — notre équipe génère ensuite ton contrat personnalisé.
            </p>
            <Link
              href="/ambassadors/apply"
              className="inline-block rounded-full px-10 py-4 font-bold text-sm tracking-widest uppercase
                         bg-violet-600 hover:bg-violet-700 text-white transition-colors"
            >
              Remplir ma candidature →
            </Link>
          </div>

          {/* Already applied */}
          <p className="text-center text-xs text-white/30 mt-8">
            Tu as déjà envoyé ta candidature ? L'équipe Afroé te contactera sous 48h à l'adresse email fournie.
          </p>

        </div>
      </main>
    </div>
  );
}
