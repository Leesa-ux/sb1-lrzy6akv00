'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle, Copy, WhatsappLogo, InstagramLogo, ChatCircle, Trophy, ArrowRight } from '@phosphor-icons/react';
import Link from 'next/link';
import GlowNav from '../components/GlowNav';

function SuccessContent() {
  const params = useSearchParams();
  const firstName = params.get('firstName') || 'Toi';
  const shareUrl  = params.get('shareUrl')  || 'https://afroe.studio';
  const ref       = params.get('ref')       || '';

  const [copied, setCopied]     = useState(false);
  const [igCopied, setIgCopied] = useState(false);

  const copy = async (msg?: string) => {
    await navigator.clipboard.writeText(shareUrl);
    if (msg) { setIgCopied(true); setTimeout(() => setIgCopied(false), 2500); }
    else      { setCopied(true);   setTimeout(() => setCopied(false), 2500); }
  };

  const waText = encodeURIComponent(`Rejoins la Glow List Afroé 🌟 ${shareUrl}`);
  const smsText = encodeURIComponent(`Rejoins la Glow List Afroé ${shareUrl}`);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start px-4 py-12 pb-20 gap-8">

      {/* HERO */}
      <div className="flex flex-col items-center text-center gap-4 max-w-lg">
        <CheckCircle weight="thin" size={72} className="text-green-400" />
        <h1 className="text-3xl font-bold">
          🎉 Tu es sur la Glow List, {firstName} !
        </h1>
        <p className="text-white/60 text-base">
          Ton lien est actif. Partage-le et grimpe dans le classement.
        </p>
      </div>

      {/* REFERRAL LINK */}
      <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
        <p className="text-white/40 text-xs uppercase tracking-widest">Ton lien Glow</p>
        <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-purple-300 break-all">
          {shareUrl}
        </div>
        <button
          onClick={() => copy()}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-amber-500 hover:opacity-90 transition"
        >
          <Copy weight="thin" size={20} />
          {copied ? 'Copié ✓' : '📋 Copier mon lien'}
        </button>
      </div>

      {/* SHARE BUTTONS */}
      <div className="w-full max-w-lg flex gap-3">
        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition text-sm font-medium"
        >
          <WhatsappLogo weight="thin" size={20} />
          WhatsApp
        </a>
        <button
          onClick={() => copy('ig')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition text-sm font-medium"
        >
          <InstagramLogo weight="thin" size={20} />
          {igCopied ? 'Copié !' : 'Instagram'}
        </button>
        <a
          href={`sms:?body=${smsText}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium"
        >
          <ChatCircle weight="thin" size={20} />
          SMS
        </a>
      </div>

      {/* POINTS PREVIEW */}
      <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Trophy weight="thin" size={24} className="text-amber-400" />
          <span className="text-white/60 text-sm">Tes points</span>
        </div>
        <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
          0 pts
        </p>
        <p className="text-white/40 text-sm">
          Chaque personne que tu invites = +5 à +25 pts
        </p>
        <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
          <div className="bg-gradient-to-r from-purple-500 to-amber-400 h-1.5 rounded-full" style={{ width: '2%' }} />
        </div>
        <p className="text-white/30 text-xs">0 / 10 pts — Glow Starter</p>
      </div>

      {/* BOTTOM LINKS */}
      <div className="flex gap-6 text-sm text-white/40">
        <Link href="/leaderboard" className="flex items-center gap-1 hover:text-white transition">
          Voir le classement <ArrowRight weight="thin" size={16} />
        </Link>
        <Link href="/" className="flex items-center gap-1 hover:text-white transition">
          Retour à l'accueil <ArrowRight weight="thin" size={16} />
        </Link>
      </div>

      <GlowNav />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/60">Chargement...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
