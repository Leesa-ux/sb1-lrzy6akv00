"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import PostSignupShareBar from "@/components/PostSignupShareBar";

interface GlowListSuccessScreenProps {
  referralCode: string;
  firstName?: string;
}

export default function GlowListSuccessScreen({
  referralCode,
  firstName,
}: GlowListSuccessScreenProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/?ref=${referralCode}`;
  }, [referralCode]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Erreur copie:", err);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="glassy neon-fuchsia rounded-2xl p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl">🎉</div>
            <h2 className="text-xl font-bold">Bienvenue sur la Glow List</h2>
            <p className="text-sm text-slate-300">
              Ton lien est actif.
              <br />
              Partage-le maintenant pour gagner des points.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-900/60 border border-amber-300/20 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">
                Ton lien personnel
              </p>
              <p className="text-sm text-amber-300 font-mono break-all mb-3">
                {shareUrl}
              </p>
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
                aria-label="Copier le lien de parrainage"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copier le lien
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-6">
            <PostSignupShareBar
              referralLink={shareUrl}
              onCopied={() => {
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
            />
          </div>

          <div className="bg-gradient-to-br from-fuchsia-900/30 to-amber-900/30 border border-fuchsia-400/20 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-center flex items-center justify-center gap-2">
              <span className="text-lg">🏆</span>
              Rappel motivation
            </h4>
            <div className="space-y-2 text-center">
              <p className="text-sm font-semibold text-amber-300">
                🎁 iPhone 17 Pro ou 3 500 € cash
              </p>
              <p className="text-xs text-slate-300">
                ⏱️ Classement mis à jour en temps réel
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            Zéro spam. Tu contrôles tout. Désinscription quand tu veux.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <a
            href="/leaderboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-amber-500 hover:brightness-110 rounded-xl font-bold transition-all text-sm"
          >
            Voir le classement
          </a>
          <a
            href="/"
            className="text-sm text-slate-400 hover:text-white underline transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </main>
  );
}
