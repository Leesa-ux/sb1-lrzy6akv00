"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import GlowListSuccessScreen from "@/app/components/GlowListSuccessScreen";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("ref");
    if (code) {
      setReferralCode(code);
    }
  }, [searchParams]);

  if (!referralCode) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white font-sans flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-slate-300 mb-4">Code de parrainage manquant</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-amber-500 hover:brightness-110 rounded-xl font-bold transition-all"
          >
            Retour à l'accueil
          </a>
        </div>
      </main>
    );
  }

  return <GlowListSuccessScreen referralCode={referralCode} />;
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
