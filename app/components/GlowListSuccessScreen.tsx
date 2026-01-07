"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";

interface GlowListSuccessScreenProps {
  referralCode: string;
  firstName?: string;
}

export default function GlowListSuccessScreen({
  referralCode,
  firstName,
}: GlowListSuccessScreenProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/?ref=${referralCode}`;
  }, [referralCode]);

  const shareMessage = useMemo(() => {
    return `✨ Rejoins Afroé, la plateforme beauté afro qui change tout ! ${shareUrl}`;
  }, [shareUrl]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Erreur copie:", err);
    }
  }

  async function copyFallback() {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur copie:", err);
    }
  }

  function shareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  }

  function shareInstagram() {
    copyLink();
    window.open("https://www.instagram.com/", "_blank");
  }

  function shareTikTok() {
    copyLink();
    window.open("https://www.tiktok.com/upload", "_blank");
  }

  function shareSnapchat() {
    copyLink();
    window.open("https://www.snapchat.com/", "_blank");
  }

  function shareLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(url, "_blank");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            🚀 Partage ton lien & grimpe dans le classement
          </h1>
        </div>

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

          <div className="space-y-3">
            <h3 className="text-base font-semibold text-center">
              ⚡ Partage en 1 clic
            </h3>

            <div className="space-y-2">
              <button
                onClick={shareWhatsApp}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
              >
                <span className="text-xl">🟢</span>
                Partager sur WhatsApp
              </button>

              <button
                onClick={shareInstagram}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:brightness-110 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
              >
                <span className="text-xl">📸</span>
                Partager en story Instagram
              </button>

              <button
                onClick={shareTikTok}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-black via-cyan-500 to-pink-500 hover:brightness-110 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
              >
                <span className="text-xl">🎵</span>
                Partager sur TikTok
              </button>

              <button
                onClick={shareSnapchat}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-500 hover:to-yellow-400 text-black font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
              >
                <span className="text-xl">👻</span>
                Partager sur Snapchat
              </button>

              <button
                onClick={shareLinkedIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
              >
                <span className="text-xl">💼</span>
                Partager sur LinkedIn
              </button>

              <button
                onClick={copyFallback}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Message copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copier mon lien
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-center text-slate-400 pt-2">
              Chaque partage te rapporte des points.
              <br />
              Plus tu partages, plus tu te rapproches des récompenses.
            </p>
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
