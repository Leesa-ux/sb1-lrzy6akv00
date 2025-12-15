"use client";

import React, { useMemo, useState } from "react";

type Props = {
  refCode: string;
  baseUrl?: string;
};

export default function ReferralShareCard({ refCode, baseUrl }: Props) {
  const [toast, setToast] = useState<string | null>(null);

  const shareUrl = useMemo(() => {
    const origin =
      baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
    return `${origin}/?ref=${refCode}`;
  }, [refCode, baseUrl]);

  const shareMessage = useMemo(() => {
    return `✨ Afroé – Glow List ✨

Je te partage mon lien privé :
${shareUrl}

Rejoins le crew beauté Afro premium 🔥`;
  }, [shareUrl]);

  async function copyAll() {
    await navigator.clipboard.writeText(shareMessage);
    setToast("Lien copié ✨ Colle-le dans l'app");
    setTimeout(() => setToast(null), 2000);
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  function openInstagram() {
    copyAll();
    window.open("https://www.instagram.com/", "_blank");
  }

  function openTikTok() {
    copyAll();
    window.open("https://www.tiktok.com/upload", "_blank");
  }

  return (
    <div className="max-w-2xl mx-auto rounded-2xl bg-white/5 border border-white/10 p-6">
      {/* Code */}
      <p className="text-sm text-white/60">Ton code Glow</p>
      <p className="text-3xl font-extrabold text-amber-300 mt-1">{refCode}</p>

      {/* URL */}
      <div className="mt-4 bg-black/30 rounded-xl p-3">
        <p className="text-xs text-white/60 mb-1">Lien de partage</p>
        <p className="text-sm break-all text-white">{shareUrl}</p>
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={copyAll}
          className="rounded-xl py-3 bg-amber-300/15 text-amber-200 font-semibold hover:bg-amber-300/25 transition-colors"
        >
          📋 Copier le lien
        </button>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl py-3 bg-white/10 text-center font-semibold hover:bg-white/15 transition-colors"
        >
          🟢 WhatsApp
        </a>

        <a
          href={linkedinHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl py-3 bg-white/10 text-center font-semibold hover:bg-white/15 transition-colors"
        >
          🔵 LinkedIn
        </a>

        <button
          onClick={openInstagram}
          className="rounded-xl py-3 bg-white/10 font-semibold hover:bg-white/15 transition-colors"
        >
          📸 Instagram
        </button>

        <button
          onClick={openTikTok}
          className="rounded-xl py-3 bg-white/10 font-semibold sm:col-span-2 hover:bg-white/15 transition-colors"
        >
          🎵 TikTok
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mt-4 inline-block bg-black/50 px-4 py-2 rounded-xl text-sm">
          {toast}
        </div>
      )}

      <p className="mt-4 text-xs text-white/50">
        Astuce : IG & TikTok → colle le lien en bio, story ou description.
      </p>
    </div>
  );
}
