"use client";

import Link from "next/link";
import { POINTS_CONFIG } from '@/lib/points';

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
                Le concours « Glow List Afroé » permet aux participants de gagner des récompenses en s'inscrivant sur la liste d'attente Afroé et en parrainant d'autres membres via un lien personnel.
              </p>
              <p className="leading-relaxed">
                <strong>Aucun achat requis (No purchase necessary).</strong> La participation est gratuite.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">2. Dates et durée</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Date de début : <span className="font-semibold">01 février 2026 (CET)</span></li>
                <li>Date de fin : <span className="font-semibold">20 mars 2026 à 23h59 (CET – heure de Belgique)</span></li>
                <li>Tirage au sort (lot 2 000 €) : dans les 30 jours suivant la clôture</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">3. Récompenses</h2>

              <div className="space-y-4">
                <div className="glassy neon-gold rounded-xl p-4">
                  <h3 className="text-xl font-bold mb-2 text-amber-300">🏆 Prix pour le rang #1</h3>
                  <p className="mb-2">Le participant ayant le plus de points provisoires valides au moment de la clôture remporte un <strong>iPhone 17 Pro</strong> (ou un modèle équivalent de valeur comparable selon disponibilité).</p>
                  <p className="text-sm text-slate-300">Les lots sont attribués uniquement aux participants dont l'inscription est validée (email confirmé + SMS OTP) et sous réserve de contrôles anti-fraude.</p>
                </div>

                <div className="glassy neon-fuchsia rounded-xl p-4">
                  <h3 className="text-xl font-bold mb-2 text-fuchsia-300">💰 Tirage au sort pour 2 000 €</h3>
                  <p className="mb-2">Tous les participants ayant <strong>≥ {POINTS_CONFIG.JACKPOT_THRESHOLD} points provisoires valides</strong> à la clôture entrent dans le tirage au sort pour gagner 2 000 € (cash).</p>
                  <p className="text-sm text-slate-300">
                    Le tirage sera effectué de manière aléatoire et équitable parmi les participants éligibles.
                  </p>
                </div>

                <div className="glassy neon-blue rounded-xl p-4">
                  <h3 className="text-xl font-bold mb-2 text-blue-300">🎁 Autres récompenses (milestones)</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Glow Kits exclusifs (selon milestones)</li>
                    <li>2 e-books Beauté (selon milestones)</li>
                    <li>Accès VIP à l'app Afroé</li>
                    <li>Réductions et avantages réservés aux membres de la waitlist</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">4. Système de points</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-300">4.1 Avant le lancement (phase waitlist — points provisoires)</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>+{POINTS_CONFIG.EARLY_BIRD_BONUS} points</strong> : bonus Early Bird ({POINTS_CONFIG.EARLY_BIRD_LIMIT} premiers inscrits)</li>
                    <li><strong>+{POINTS_CONFIG.WAITLIST.CLIENT} points</strong> : par Client·e inscrit·e sur la waitlist via votre lien</li>
                    <li><strong>+{POINTS_CONFIG.WAITLIST.INFLUENCER} points</strong> : par Influenceur·euse (&gt; 2 000 followers) inscrit·e via votre lien</li>
                    <li><strong>+{POINTS_CONFIG.WAITLIST.BEAUTY_PRO} points</strong> : par Beauty Pro inscrit·e sur la waitlist via votre lien</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-fuchsia-300">4.2 Après le lancement (app live — points finaux)</h3>
                  <p className="text-slate-200/90 leading-relaxed mb-3">
                    Les points finaux peuvent évoluer après lancement (ex. téléchargements, validations pro/influenceur). Les modalités exactes seront communiquées lors du lancement de l'app.
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>+{POINTS_CONFIG.LAUNCH.APP_DOWNLOAD} points</strong> : par Client·e qui télécharge l'app via votre lien</li>
                    <li><strong>+{POINTS_CONFIG.LAUNCH.VALIDATED_INFLUENCER} points</strong> : par Influenceur·euse (&gt; 2 000 followers) validé·e après contrôle</li>
                    <li><strong>+{POINTS_CONFIG.LAUNCH.VALIDATED_PRO} points</strong> : par Beauty Pro dont l'inscription est validée après contrôle</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-amber-300">4.3 Règles de calcul & validation</h3>
                  <div className="text-slate-200/90 leading-relaxed space-y-3">
                    <p>Les points provisoires sont attribués automatiquement pendant la phase waitlist.</p>
                    <p>Une inscription est considérée valide uniquement après :</p>
                    <ul className="list-decimal list-inside space-y-1 ml-4">
                      <li>confirmation de l'adresse email, et</li>
                      <li>vérification du numéro de téléphone via SMS OTP.</li>
                    </ul>
                    <p>Un parrainage est considéré valide uniquement si le filleul :</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>s'inscrit via le lien de parrainage,</li>
                      <li>confirme son email,</li>
                      <li>valide son numéro via SMS OTP,</li>
                      <li>et ne constitue pas une participation multiple ou frauduleuse.</li>
                    </ul>
                    <p>Afroé se réserve le droit d'annuler des points, d'invalider des parrainages, ou d'exclure des comptes en cas de fraude, doublons ou non-conformité.</p>
                    <p>En cas de contestation, les enregistrements du système (base de données, horodatages, journaux techniques) font foi.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">5. Règles anti-fraude</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>1 personne = 1 compte.</strong> Les comptes multiples (même personne) sont disqualifiés.</li>
                <li>Les inscriptions frauduleuses (faux emails, emails temporaires, téléphones non personnels, abus de numéros virtuels, etc.) peuvent être détectées, invalidées et supprimées.</li>
                <li>Les parrainages doivent être réels. Les pratiques abusives (spam, bots, scripts, automatisation, auto-parrainage, etc.) entraînent une disqualification immédiate.</li>
                <li>L'équipe Afroé se réserve le droit de vérifier manuellement les comptes et de disqualifier tout participant en cas de fraude avérée ou suspicion sérieuse.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">6. Méthode de tirage au sort (lot 2 000 €)</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Seuls les participants ayant ≥ {POINTS_CONFIG.JACKPOT_THRESHOLD} points provisoires valides à la clôture participent.</li>
                <li>Le tirage est réalisé via un outil de sélection aléatoire et consigné (date/heure/paramètres) afin d'assurer la traçabilité.</li>
                <li>Le gagnant sera contacté par email et SMS dans les 30 jours suivant le tirage.</li>
                <li>En cas de non-réponse sous 15 jours, un nouveau tirage sera effectué.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">7. Désignation du gagnant rang #1 (tie-breaker)</h2>
              <p className="leading-relaxed mb-3">
                Le rang #1 est déterminé au moment de la clôture (20 mars 2026 à 23h59 CET).
              </p>
              <p className="leading-relaxed mb-3">
                En cas d'égalité de points provisoires valides :
              </p>
              <ul className="list-decimal list-inside space-y-2 ml-4">
                <li>le plus grand nombre de parrainages valides,</li>
                <li>puis le participant ayant atteint le score en premier (horodatage système),</li>
                <li>puis tirage au sort entre les ex æquo.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">8. Conditions d'éligibilité</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Être majeur·e au moment de l'inscription</li>
                <li>Résider en Belgique</li>
                <li>Avoir un email valide et un numéro de téléphone mobile valide</li>
                <li>Confirmer son email et valider son téléphone via SMS OTP</li>
                <li>Accepter les conditions générales et la politique de confidentialité</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">9. Données personnelles (RGPD)</h2>
              <p className="leading-relaxed mb-3">
                Les données collectées (nom, email, téléphone, données de parrainage, logs techniques, scores) sont utilisées uniquement pour gérer le concours, prévenir la fraude, vérifier l'éligibilité (email confirmé + SMS OTP), contacter les gagnants, et communiquer autour d'Afroé (si consentement).
              </p>
              <p className="leading-relaxed mb-3">
                Elles sont traitées conformément au RGPD. Les participants peuvent demander l'accès, la rectification, l'opposition ou la suppression de leurs données à tout moment en contactant : <strong>contact@afroe.studio</strong>.
              </p>
              <p className="leading-relaxed">
                Durée de conservation : 12 mois après la fin du concours, sauf obligation légale contraire.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">10. Modifications, annulation, responsabilité</h2>
              <p className="leading-relaxed mb-3">
                L'équipe Afroé se réserve le droit de modifier, suspendre ou d'annuler le concours à tout moment en cas de circonstances exceptionnelles (force majeure, fraude massive, problèmes techniques compromettant l'intégrité du concours, etc.). Les participants seront informés par email.
              </p>
              <p className="leading-relaxed mb-3">
                La responsabilité de l'organisateur est limitée dans les limites autorisées par la loi.
              </p>
              <p className="leading-relaxed mb-3">
                Apple n'est ni sponsor, ni partenaire, ni affilié au concours.
              </p>
              <p className="leading-relaxed">
                Le concours est soumis au droit belge.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">11. Organisateur & contact</h2>
              <p className="leading-relaxed mb-3">
                <strong>Organisateur :</strong> Afroé (association de fait), groupement sans personnalité juridique, représenté par Lisa M, domiciliée en Belgique.
              </p>
              <p className="leading-relaxed mb-3">
                <strong>Adresse postale :</strong> communiquée sur demande par email à contact@afroe.studio.
              </p>
              <p className="leading-relaxed mb-3">
                <strong>Email :</strong> <a href="mailto:contact@afroe.studio" className="text-fuchsia-400 hover:underline">contact@afroe.studio</a>
              </p>
              <p className="leading-relaxed">
                Toute demande relative au concours (règlement, réclamations, remise des lots) doit être envoyée à contact@afroe.studio.
              </p>
            </section>

            <div className="border-t border-white/10 pt-6 mt-8">
              <p className="text-sm text-slate-400 text-center">
                Dernière mise à jour : 03 février 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
