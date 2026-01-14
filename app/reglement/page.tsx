"use client";

import Link from "next/link";

export default function ReglementPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white font-sans py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glassy rounded-2xl p-8 md:p-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
          >
            ← Retour à l'accueil
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold mb-8">
            Règlement du concours <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-amber-300">Glow List</span>
          </h1>

          <div className="space-y-8 text-slate-200/90">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">1. Principe général</h2>
              <p className="leading-relaxed mb-3">
                Le concours « Glow List Afroé » permet aux participants de gagner des récompenses en s'inscrivant sur la liste d'attente et en parrainant d'autres membres.
              </p>
              <p className="leading-relaxed">
                <strong>Aucun achat requis (No purchase necessary).</strong> La participation est gratuite.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">2. Dates et durée</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Date de début : <span className="font-semibold">15 janvier 2026</span></li>
                <li>Date de fin : <span className="font-semibold">1 mars 2026 à 23h59 (CET)</span></li>
                <li>Tirage au sort : dans les 30 jours suivant la clôture</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">3. Récompenses</h2>

              <div className="space-y-4">
                <div className="glassy neon-gold rounded-xl p-4">
                  <h3 className="text-xl font-bold mb-2 text-amber-300">🏆 Prix pour le rang #1</h3>
                  <p>Le participant ayant le plus de points provisoires au moment de la clôture remporte un <strong>iPhone 17 Pro</strong> (ou équivalent selon disponibilité).</p>
                </div>

                <div className="glassy neon-fuchsia rounded-xl p-4">
                  <h3 className="text-xl font-bold mb-2 text-fuchsia-300">💰 Tirage au sort pour 3 500 €</h3>
                  <p>Tous les participants ayant <strong>≥ 100 points provisoires</strong> entrent dans le tirage au sort pour gagner 3 500 € en cash.</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Le tirage sera effectué de manière aléatoire et équitable parmi les participants éligibles.
                  </p>
                </div>

                <div className="glassy neon-blue rounded-xl p-4">
                  <h3 className="text-xl font-bold mb-2 text-blue-300">🎁 Autres récompenses</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Glow Kits exclusifs (selon milestones)</li>
                    <li>Accès VIP à l'app Afroé</li>
                    <li>Réductions et avantages réservés aux membres de la waitlist</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">4. Système de points</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>+50 points</strong> : bonus early bird (100 premiers inscrits)</li>
                <li><strong>+2 points</strong> : par client invité via votre lien</li>
                <li><strong>+15 points</strong> : par influenceur invité</li>
                <li><strong>+25 points</strong> : par beauty pro invité</li>
              </ul>
              <p className="mt-4 text-sm text-slate-400">
                Les points provisoires sont attribués automatiquement. Les points finaux seront calculés après validation manuelle et contrôle anti-fraude.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">5. Règles anti-fraude</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>1 compte par personne.</strong> Les comptes multiples seront disqualifiés.</li>
                <li>Les inscriptions frauduleuses (faux emails, téléphones temporaires, etc.) seront détectées et supprimées.</li>
                <li>Les parrainages doivent être réels. Les pratiques abusives (spam, bots, etc.) entraînent une disqualification immédiate.</li>
                <li>L'équipe Afroé se réserve le droit de vérifier manuellement les comptes et de disqualifier tout participant en cas de fraude avérée.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">6. Méthode de tirage au sort</h2>
              <p className="leading-relaxed mb-3">
                Le tirage au sort pour le prix de 3 500 € sera effectué de manière transparente et équitable :
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Seuls les participants ayant ≥ 100 points provisoires valides participent</li>
                <li>Le tirage sera effectué via un générateur aléatoire certifié</li>
                <li>Le gagnant sera contacté par email et SMS dans les 7 jours suivant le tirage</li>
                <li>En cas de non-réponse sous 15 jours, un nouveau tirage sera effectué</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">7. Conditions d'éligibilité</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Être majeur(e) au moment de l'inscription</li>
                <li>Résider en Belgique, France ou Luxembourg</li>
                <li>Avoir un email et un numéro de téléphone valides</li>
                <li>Accepter les conditions générales et la politique de confidentialité</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">8. Données personnelles</h2>
              <p className="leading-relaxed">
                Les données collectées (nom, email, téléphone) sont utilisées uniquement dans le cadre du concours et de la communication autour d'Afroé.
                Elles sont traitées conformément au RGPD. Les participants peuvent demander la suppression de leurs données à tout moment en contactant <strong>contact@afroe.com</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">9. Modifications et annulation</h2>
              <p className="leading-relaxed">
                L'équipe Afroé se réserve le droit de modifier ou d'annuler le concours à tout moment en cas de circonstances exceptionnelles (force majeure, problèmes techniques, etc.).
                Les participants seront informés par email.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">10. Contact</h2>
              <p className="leading-relaxed">
                Pour toute question concernant le règlement ou le concours, contactez-nous :
              </p>
              <p className="mt-2">
                <strong>Email :</strong> <a href="mailto:contact@afroe.com" className="text-fuchsia-400 hover:underline">contact@afroe.com</a>
              </p>
            </section>

            <div className="border-t border-white/10 pt-6 mt-8">
              <p className="text-sm text-slate-400 text-center">
                Dernière mise à jour : 14 décembre 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
