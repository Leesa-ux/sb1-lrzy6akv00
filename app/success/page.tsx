'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle, Copy, LinkedinLogo, InstagramLogo, ChatCircle, Trophy, ArrowRight, WhatsappLogo } from '@phosphor-icons/react';
import Link from 'next/link';
import GlowNav from '../components/GlowNav';

function SuccessContent() {
  const params = useSearchParams();
  const firstName = params.get('firstName') || 'Toi';
  const shareUrl  = params.get('shareUrl')  || 'https://afroe.studio';
  const ref       = params.get('ref')       || '';

  // Persist params so the leaderboard can navigate back here
  if (typeof window !== 'undefined' && params.toString()) {
    sessionStorage.setItem('glowSuccessParams', params.toString());
  }

  const [copied, setCopied]           = useState(false);
  const [igCopied, setIgCopied]       = useState(false);
  const [liCopied, setLiCopied]       = useState(false);

  const fullMessage = `✨ Rejoins la Glow List Afroé — la plateforme beauté Afro-européenne !\n\n👉 ${shareUrl}\n\nInscription gratuite. Aucun achat requis.`;

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareToInstagram = async () => {
    await navigator.clipboard.writeText(fullMessage);
    setIgCopied(true);
    setTimeout(() => setIgCopied(false), 4000);
    window.open('https://www.instagram.com/direct/inbox/', '_blank');
  };

  const shareToLinkedIn = async () => {
    await navigator.clipboard.writeText(fullMessage);
    setLiCopied(true);
    setTimeout(() => setLiCopied(false), 4000);
    window.open('https://www.linkedin.com/messaging/compose/', '_blank');
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
  const smsText = encodeURIComponent(fullMessage);

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
        <p className="text-white/30 text-xs border border-white/10 rounded-full px-4 py-1.5">
          📩 Garde le SMS/email reçu — il te ramène ici à tout moment
        </p>
      </div>

      {/* REFERRAL LINK */}
      <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
        <p className="text-white/40 text-xs uppercase tracking-widest">Ton lien Glow</p>
        <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-white/40 text-xs mb-0.5">Ton code de parrainage</p>
            <p className="text-2xl font-bold tracking-widest text-purple-300">{ref || 'GLOW'}</p>
          </div>
          <div className="text-white/20 text-xs text-right">
            <p>afroe.studio</p>
            <p>?ref={ref || 'GLOW'}</p>
          </div>
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
      <div className="w-full max-w-lg flex flex-col gap-3">
        {(igCopied || liCopied) && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-900/50 border border-emerald-500/30 text-sm text-emerald-200">
            ✓ Message copié ! Colle-le (Ctrl+V) dans la conversation.
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] hover:bg-[#1fb856] transition text-sm font-medium text-white"
          >
            <WhatsappLogo weight="thin" size={20} />
            WhatsApp
          </a>
          <button
            onClick={shareToInstagram}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition text-sm font-medium"
          >
            <InstagramLogo weight="thin" size={20} />
            {igCopied ? 'Copié !' : 'Instagram'}
          </button>
          <button
            onClick={shareToLinkedIn}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-700 hover:bg-blue-600 transition text-sm font-medium"
          >
            <LinkedinLogo weight="thin" size={20} />
            {liCopied ? 'Copié !' : 'LinkedIn'}
          </button>
          <a
            href={`sms:?body=${smsText}`}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition text-sm font-medium"
          >
            <ChatCircle weight="thin" size={20} />
            SMS
          </a>
        </div>
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
