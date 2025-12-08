"use client";

import React from "react";

interface HeroSectionProps {
  onCTAClick?: () => void;
  earlyBirdSpotsLeft?: number;
}

const HeroSectionV2: React.FC<HeroSectionProps> = ({
  onCTAClick,
  earlyBirdSpotsLeft = 100
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-black via-slate-950 to-black text-white pt-16 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge marque avec effet glassy */}
          <div className="inline-flex items-center justify-center mb-6">
            <span className="px-4 py-1 rounded-full glassy text-xs font-medium tracking-wide uppercase">
              Afroé — Brussels · Liège · Anvers
            </span>
          </div>

          {/* Titre principal - ton street maintenu */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4">
            Ton crew beauté Afro.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-violet-400 to-amber-300">
              Pro, stylé,
            </span>{" "}
            chez toi.
          </h1>

          {/* Sous-titre - simplifié mais authentique */}
          <p className="text-base sm:text-lg md:text-xl text-slate-200/90 max-w-3xl mx-auto mb-6 leading-relaxed">
            La beauté Afro premium, livrée à domicile ou en salon — par les meilleur·es.
            Une app pensée pour les client·es, les beauty pros et la culture Afro européenne.
          </p>

          {/* Bonus lancement - style glassy neon-gold */}
          <div className="inline-flex flex-col items-center gap-2 mb-6 glassy neon-gold rounded-2xl px-6 py-4 max-w-2xl">
            <p className="text-amber-300 font-bold text-base sm:text-lg">
              🏆 iPhone 17 Pro pour le rang #1 + 3 500 € (tirage ≥ 100 pts)
            </p>
            <p className="text-rose-200/90 text-sm sm:text-base">
              Les <span className="font-semibold">100 premiers inscrits</span> : +50 pts offerts.
              {earlyBirdSpotsLeft > 0 && (
                <span className="ml-2 text-amber-300 font-bold">
                  {earlyBirdSpotsLeft} places restantes 🔥
                </span>
              )}
            </p>
          </div>

          {/* CTA principal - effet neon-fuchsia */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <button
              type="button"
              onClick={onCTAClick}
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-fuchsia-500 via-violet-500 to-amber-400 shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:brightness-110 hover:scale-105 transition-all duration-300"
            >
              Je prends ma place maintenant ✨
            </button>

            {/* Sous-CTA rassurant - ton moins corporate */}
            <p className="text-xs sm:text-sm text-slate-300/80">
              🔒 Inscription gratuite. Aucune carte. Tes données sont sécurisées (RGPD).
            </p>
          </div>

          {/* Preuve sociale immédiate */}
          <div className="mt-8 glassy rounded-xl px-4 py-3 inline-flex items-center gap-2 text-sm">
            <span className="text-fuchsia-400">🔥</span>
            <span className="text-slate-200">
              <span className="font-semibold">1 500+ personnes</span> suivent déjà Afroé sur LinkedIn & Instagram
            </span>
          </div>

          {/* Image hero du crew */}
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-fuchsia-500/20 border border-white/10">
              <img
                src="/images/lucid_origin_hero_crew_beaut_afro__domicile_ultradetailed_edit_2.jpg"
                alt="Professionnels de la beauté Afro au travail - Afroé"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionV2;
