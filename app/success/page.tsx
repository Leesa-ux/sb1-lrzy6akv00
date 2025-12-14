"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFeature } from "@/lib/feature-flags";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const showConditionalShare = useFeature("conditional-share");

  useEffect(() => {
    const code = searchParams.get("ref");
    if (code) {
      setReferralCode(code);
      const url = `${window.location.origin}?ref=${code}`;
      setShareUrl(url);
    }
  }, [searchParams]);

  const copyToClipboard = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent("Rejoins-moi sur Afroé, la plateforme qui révolutionne la beauté Afro ! 💅✨");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Rejoins-moi sur Afroé ! ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

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
            <>
              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 space-y-4">
                <p className="text-sm text-slate-300 font-medium">Ton code de parrainage</p>
                <div className="text-3xl font-bold text-amber-300 tracking-wider">
                  {referralCode}
                </div>

                {shareUrl && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      {copied ? "✓ Copié" : "Copier"}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm text-slate-300 font-medium">Partage sur les réseaux</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={shareOnWhatsApp}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-colors"
                  >
                    <span>📱</span> WhatsApp
                  </button>
                  <button
                    onClick={shareOnTwitter}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors"
                  >
                    <span>🐦</span> Twitter
                  </button>
                </div>
              </div>
            </>
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
