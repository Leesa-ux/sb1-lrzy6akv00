"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle,
  CopySimple,
  WhatsappLogo,
  InstagramLogo,
  ChatCircleDots,
  ArrowRight,
} from "@phosphor-icons/react";

interface GlowListSuccessScreenProps {
  referralCode: string;
  shareUrl?: string | null;
  firstName?: string | null;
  role?: string | null;
}

export default function GlowListSuccessScreen({
  referralCode,
  shareUrl: providedShareUrl,
  firstName,
  role,
}: GlowListSuccessScreenProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [instaCopied, setInstaCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (providedShareUrl) return providedShareUrl;
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/?ref=${referralCode}`;
  }, [referralCode, providedShareUrl]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Erreur copie:", err);
    }
  }

  const fullMessage = `✨ Rejoins la Glow List Afroé — beauté Afro premium 🌟\n\n👉 ${shareUrl}\n\nInscription gratuite. Aucun achat requis.`;

  async function copyForInsta() {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setInstaCopied(true);
      setTimeout(() => setInstaCopied(false), 4000);
      window.open("https://www.instagram.com/direct/inbox/", "_blank");
    } catch (err) {
      console.error("Erreur copie:", err);
    }
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;

  const smsHref = `sms:?body=${encodeURIComponent(
    `Rejoins la Glow List Afroé ${shareUrl}`
  )}`;

  const displayName = firstName || "toi";

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-8 py-8">
        <section className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle
              size={64}
              weight="thin"
              className="text-green-400"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            🎉 Tu es sur la Glow List, {displayName} !
          </h1>
          <p className="text-base sm:text-lg text-slate-300">
            Ton lien est actif. Partage-le et grimpe dans le classement.
          </p>
        </section>

        <section className="glassy neon-gold rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-amber-300 text-center">
            Ton lien de parrainage
          </h2>
          <div className="bg-slate-900/60 border border-amber-300/30 rounded-xl p-4">
            <p className="text-sm sm:text-base text-slate-200 font-mono break-all text-center mb-4">
              {shareUrl}
            </p>
            <button
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {linkCopied ? (
                <>
                  <CheckCircle size={24} weight="thin" />
                  Copié ✓
                </>
              ) : (
                <>
                  <CopySimple size={24} weight="thin" />
                  📋 Copier mon lien
                </>
              )}
            </button>
          </div>
        </section>

        <section className="glassy neon-fuchsia rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-center">
            Partage maintenant
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-[#25D366] hover:bg-[#1fb856] text-white font-bold text-sm sm:text-base transition-all hover:scale-[1.02]"
            >
              <WhatsappLogo size={24} weight="thin" />
              WhatsApp
            </a>

            <button
              onClick={copyForInsta}
              className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-bold text-sm sm:text-base transition-all hover:scale-[1.02]"
            >
              <InstagramLogo size={24} weight="thin" />
              {instaCopied ? "Copié !" : "Instagram"}
            </button>

            <a
              href={smsHref}
              className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base transition-all hover:scale-[1.02]"
            >
              <ChatCircleDots size={24} weight="thin" />
              SMS
            </a>
          </div>
          {instaCopied && (
            <p className="text-xs text-center text-emerald-400 font-medium">
              ✓ Message copié — colle-le (Ctrl+V) dans ton DM Instagram !
            </p>
          )}
        </section>

        <section className="glassy neon-blue rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-center">Tes points</h2>
          <div className="text-center">
            <p className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-amber-300">
              0 pts
            </p>
            <p className="text-sm text-slate-300 mt-2">
              Chaque personne que tu invites = +5 à +25 pts
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Progression vers Glow Starter</span>
              <span>0 / 10 pts</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 bg-gradient-to-r from-fuchsia-500 to-amber-500"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col sm:flex-row gap-4 items-center justify-center text-sm sm:text-base">
          <a
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-amber-500 hover:brightness-110 rounded-xl font-bold transition-all"
          >
            Voir le classement
            <ArrowRight size={20} weight="thin" />
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            Retour à l'accueil
            <ArrowRight size={20} weight="thin" />
          </a>
        </section>
      </div>
    </main>
  );
}
