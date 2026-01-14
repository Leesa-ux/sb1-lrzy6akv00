"use client";

import React, { useState, useEffect } from "react";

interface PostSignupShareBarProps {
  referralLink: string;
  role?: 'client' | 'influencer' | 'beauty_pro';
  onCopied?: () => void;
}

interface ToastState {
  show: boolean;
  message: string;
}

export default function PostSignupShareBar({
  referralLink,
  role,
  onCopied,
}: PostSignupShareBarProps) {
  const [toast, setToast] = useState<ToastState>({ show: false, message: "" });
  const [showFallbackInput, setShowFallbackInput] = useState(false);

  useEffect(() => {
    if (!navigator.clipboard) {
      setShowFallbackInput(true);
    }
  }, []);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 2500);
  };

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
      onCopied?.();
    } catch (err) {
      console.error("Erreur copie:", err);
      setShowFallbackInput(true);
    }
  };

  const handleWhatsApp = () => {
    const text = `Je viens de rejoindre Afroé ✨ Accès VIP + récompenses à gagner. 👉 ${referralLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSnapchat = () => {
    const url = `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(referralLink)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleInstagram = async () => {
    await copyToClipboard(referralLink, "Lien copié ✨ Colle-le dans ta story");
    setTimeout(() => {
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    }, 300);
  };

  const handleTikTok = async () => {
    await copyToClipboard(referralLink, "Lien copié ✨ Colle-le dans ta story");
    setTimeout(() => {
      window.open("https://www.tiktok.com/upload", "_blank", "noopener,noreferrer");
    }, 300);
  };

  const handleCopyLink = async () => {
    await copyToClipboard(referralLink, "Lien copié");
  };

  if (!referralLink) {
    return (
      <div className="w-full rounded-xl bg-slate-900/40 border border-slate-700/50 p-4">
        <p className="text-sm text-slate-400 text-center">Ton lien arrive…</p>
        <button
          disabled
          className="mt-3 w-full px-4 py-2 bg-slate-700 text-slate-500 rounded-lg cursor-not-allowed text-sm"
          aria-label="Copier le lien (désactivé)"
        >
          📋 Copier le lien
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="text-center space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold">
          🚀 Partage ton lien & grimpe dans le classement
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-2 px-2">
          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 hover:border-green-500/40 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
            aria-label="Partager sur WhatsApp"
          >
            <span className="text-base">🟢</span>
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            onClick={handleInstagram}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 hover:border-pink-500/40 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
            aria-label="Partager sur Instagram"
          >
            <span className="text-base">📸</span>
            <span className="hidden sm:inline">Instagram</span>
          </button>

          <button
            onClick={handleTikTok}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 hover:border-cyan-500/40 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
            aria-label="Partager sur TikTok"
          >
            <span className="text-base">🎵</span>
            <span className="hidden sm:inline">TikTok</span>
          </button>

          <button
            onClick={handleLinkedIn}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 hover:border-blue-500/40 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
            aria-label="Partager sur LinkedIn"
          >
            <span className="text-base">💼</span>
            <span className="hidden sm:inline">LinkedIn</span>
          </button>

          <button
            onClick={handleSnapchat}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 hover:border-yellow-500/40 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
            aria-label="Partager sur Snapchat"
          >
            <span className="text-base">👻</span>
            <span className="hidden sm:inline">Snapchat</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 hover:from-violet-600 hover:to-fuchsia-600 border border-violet-500/50 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
            aria-label="Copier le lien"
          >
            <span className="text-base">📋</span>
            <span>Copier le lien</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
          Chaque partage te rapporte des points. Plus tu partages, plus tu montes.
        </p>
      </div>

      {showFallbackInput && (
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
          <label htmlFor="fallback-link" className="block text-xs text-slate-400 mb-2">
            Ton lien (copie manuellement)
          </label>
          <input
            id="fallback-link"
            type="text"
            readOnly
            value={referralLink}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 font-mono"
            onClick={(e) => e.currentTarget.select()}
          />
        </div>
      )}

      {toast.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-slate-900 border border-violet-500/50 shadow-lg rounded-xl px-4 py-3 flex items-center gap-2 backdrop-blur-sm">
            <span className="text-sm font-medium text-white">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
