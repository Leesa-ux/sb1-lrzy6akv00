"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFeature } from "@/lib/feature-flags";
import ReferralShareCard from "@/app/components/ReferralShareCard";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const showConditionalShare = useFeature("conditional-share");

  useEffect(() => {
    const code = searchParams.get("ref");
    if (code) {
      setReferralCode(code);
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white font-sans flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="glassy neon-fuchsia rounded-2xl p-8 md:p-12 text-center space-y-6">
          <div className="text-6xl mb-4">🎉</div>

          <h1 className="text-3xl sm:text-4xl font-bold">
            Merci ! Tu es officiellement sur la <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-amber-300">Glow List</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200/90">
            Check ton email pour confirmer ton inscription. En attendant, partage ton lien unique pour gagner des points !
          </p>

          {showConditionalShare && !referralCode && (
            <div className="bg-slate-900/60 border border-amber-300/20 rounded-xl p-6">
              <p className="text-amber-300 text-sm">
                ✨ Inscris-toi pour débloquer ton lien de parrainage.
              </p>
            </div>
          )}

          {(!showConditionalShare || referralCode) && referralCode && (
            <ReferralShareCard refCode={referralCode} />
          )}

          <div className="pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold mb-3">Comment gagner plus de points ?</h2>
            <ul className="text-sm text-slate-200/90 space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-amber-300">✨</span>
                <span><strong>Client.e :</strong> +2 pts par inscription</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-fuchsia-300">📸</span>
                <span><strong>Influenceur.euse :</strong> +15 pts par inscription</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-300">💅</span>
                <span><strong>Beauty Pro :</strong> +25 pts par inscription</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-6">
            <a
              href="/"
              className="inline-block px-8 py-3 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-amber-500 hover:brightness-110 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)]"
            >
              Retour à l'accueil
            </a>
            <Link
              href="/reglement"
              className="text-sm text-slate-400 hover:text-white underline transition-colors"
            >
              Voir le règlement
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white font-sans flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">✨</div>
          <p className="text-slate-300">Chargement...</p>
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
