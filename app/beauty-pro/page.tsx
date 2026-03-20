'use client';

import { useState } from 'react';
import {
  ShieldCheck, Scales, GraduationCap, Leaf,
  CalendarCheck, Users, CheckCircle, ArrowRight,
  Briefcase, Star, ChartLineUp, Question
} from '@phosphor-icons/react';
import Link from 'next/link';

// ── Simulateur de revenus ──────────────────────────────────────────────
function Simulateur() {
  const [prestations, setPrestations] = useState(3);
  const [type, setType] = useState<'naturels'|'tresses'|'tout'>('tout');
  const [jours, setJours] = useState(4);

  const tarifs = { naturels: 65, tresses: 85, tout: 75 };
  const tarif = tarifs[type];
  const brut = prestations * tarif * jours * 4;
  const net = Math.round(brut * 0.68);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Calcule tes revenus</h3>

      {/* Prestations / jour */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
          Prestations par jour
        </label>
        <div className="flex gap-3">
          {[2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setPrestations(n)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                prestations === n
                  ? 'bg-purple-900 text-white shadow-lg shadow-purple-900/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
          Spécialité
        </label>
        <div className="grid grid-cols-3 gap-3">
          {([
            ['naturels', 'Naturels'],
            ['tresses', 'Tresses & Locks'],
            ['tout', 'Toutes coupes'],
          ] as const).map(([val, label]) => (
            <button key={val} onClick={() => setType(val)}
              className={`py-3 px-2 rounded-xl font-semibold text-sm transition-all text-center ${
                type === val
                  ? 'bg-amber-400 text-amber-900 shadow-lg shadow-amber-400/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Jours / semaine */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
          Jours par semaine
        </label>
        <div className="flex gap-3">
          {[2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setJours(n)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                jours === n
                  ? 'bg-purple-900 text-white shadow-lg shadow-purple-900/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {n}j
            </button>
          ))}
        </div>
      </div>

      {/* Résultat */}
      <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-2xl p-6 text-white text-center">
        <p className="text-purple-300 text-sm uppercase tracking-wider mb-2">Revenu net estimé / mois</p>
        <p className="text-5xl font-black mb-1">{net.toLocaleString('fr-BE')} €</p>
        <p className="text-purple-300 text-xs mt-2">Après cotisations sociales · Basé sur {tarif}€/prestation</p>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        Estimation indicative. Varie selon ta zone géographique et tes tarifs.
      </p>
    </div>
  );
}

// ── FAQ accordéon ─────────────────────────────────────────────────────
const faqs = [
  {
    q: "Quels sont les prérequis pour rejoindre Afroé ?",
    a: "Tu dois avoir un diplôme ou minimum 2 ans d'expérience en soins capillaires afro, être en ordre de statut indépendant·e (ou en cours de démarches), et exercer ou souhaiter exercer dans la zone Bruxelles, Liège ou Anvers. Tu as besoin d'un smartphone iOS ou Android pour utiliser l'application."
  },
  {
    q: "Combien gagne un·e Beauty Pro Afroé ?",
    a: "Le revenu dépend de ton rythme et de tes spécialités. Sur base de 3 prestations par jour, 4 jours par semaine, les Beauty Pros Afroé peuvent générer entre 1 500 € et 3 500 € net par mois. Tu fixes toi-même tes tarifs — Afroé prend uniquement une commission sur les réservations confirmées."
  },
  {
    q: "Comment suis-je payé·e ?",
    a: "Le paiement est traité via l'application, directement par la cliente au moment de la réservation. Le montant (moins la commission Afroé) est versé sur ton compte bancaire toutes les 2 semaines. Tu reçois un récapitulatif détaillé de chaque prestation et toutes tes factures sont générées automatiquement."
  },
  {
    q: "Comment fonctionne le soutien administratif ?",
    a: "Afroé gère pour toi la TVA, les déclarations fiscales, la facturation cliente et la compta simplifiée. Tu reçois également un accès à des conseils juridiques et business via notre réseau de partenaires. L'objectif : tu te concentres sur ton art, on gère le reste."
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {faqs.map((f, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left"
          >
            <span className="font-semibold text-gray-900 pr-4">{f.q}</span>
            <Question weight="thin" size={24} className={`shrink-0 transition-transform ${open === i ? 'text-purple-700 rotate-45' : 'text-gray-400'}`} />
          </button>
          {open === i && (
            <div className="px-6 pb-5">
              <p className="text-gray-600 leading-relaxed">{f.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────
export default function BeautyProPage() {
  const piliers = [
    {
      icon: <ShieldCheck weight="thin" size={32} className="text-purple-400" />,
      titre: "Zéro admin",
      desc: "TVA, taxes, factures, compta — on gère tout. Tu te concentres sur ton art."
    },
    {
      icon: <Scales weight="thin" size={32} className="text-blue-400" />,
      titre: "Légal & Business",
      desc: "Accès à des conseils juridiques et business via notre réseau de partenaires experts."
    },
    {
      icon: <GraduationCap weight="thin" size={32} className="text-amber-400" />,
      titre: "Formation continue",
      desc: "Masterclasses technique et business avec les meilleures professionnelles du secteur afro."
    },
    {
      icon: <Leaf weight="thin" size={32} className="text-green-400" />,
      titre: "Éco-responsable",
      desc: "Gamme de produits éco-friendly sélectionnée, fournie ou recommandée selon tes besoins."
    },
    {
      icon: <CalendarCheck weight="thin" size={32} className="text-pink-400" />,
      titre: "Réservation dernier cri",
      desc: "Agenda intelligent, rappels automatiques, paiement intégré. Simple comme bonjour."
    },
    {
      icon: <Users weight="thin" size={32} className="text-orange-400" />,
      titre: "Communauté exclusive",
      desc: "Réseau de pros afro-premium à Bruxelles, Liège et Anvers. Ensemble, on va plus loin."
    },
  ];

  const prerequis = [
    "Diplôme ou 2 ans d'expérience en soins capillaires afro",
    "Statut indépendant·e ou démarches en cours",
    "Smartphone iOS ou Android",
    "Zone Bruxelles, Liège ou Anvers",
    "Être âgé·e de 18 ans minimum",
  ];

  const etapes = [
    {
      num: "01",
      titre: "Tu déposes ton dossier",
      desc: "Remplis le formulaire en ligne. Ça prend 5 minutes. Ton parcours, tes spécialités, ta zone.",
      icon: <Briefcase weight="thin" size={28} className="text-purple-400" />,
    },
    {
      num: "02",
      titre: "On vérifie ton profil",
      desc: "Notre équipe examine ton dossier sous 72h. On vérifie ton expérience et on te contacte.",
      icon: <Star weight="thin" size={28} className="text-amber-400" />,
    },
    {
      num: "03",
      titre: "Tu accèdes aux clientes",
      desc: "Dès le lancement, ton profil est visible. Les clientes te trouvent, tu choisis tes missions.",
      icon: <ChartLineUp weight="thin" size={28} className="text-green-400" />,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ══ HERO ══ */}
      <section className="relative bg-purple-950 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="text-amber-400 text-sm">✦</span>
            <span className="text-white/80 text-sm font-medium">Pré-inscription Beauty Pro — Bruxelles · Liège · Anvers</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Tu es Beauty Pro.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
              Afroé te connecte
            </span><br />
            à tes prochaines clientes.
          </h1>

          <p className="text-lg text-purple-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            La première plateforme afro-premium de Belgique. Zéro admin, formation continue,
            système de réservation dernier cri. Tu te concentres sur ton art — on gère le reste.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#dossier"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-amber-400/25">
              Déposer mon dossier
              <ArrowRight weight="bold" size={18} />
            </a>
            <a href="#piliers"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-full transition-all border border-white/20">
              Découvrir les avantages
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16">
            {[
              ['100%', 'Admin géré'],
              ['0€', 'Frais cachés'],
              ['3', 'Villes belges'],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-white">{val}</p>
                <p className="text-purple-300 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 6 PILIERS ══ */}
      <section id="piliers" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-amber-600 text-sm font-bold uppercase tracking-widest mb-3">Ce qui te distingue</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">
            Afroé, c'est plus qu'une plateforme
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            On a construit ce qu'aucune autre app ne propose aux Beauty Pros afro en Belgique.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {piliers.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="mb-4">{p.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{p.titre}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PRÉREQUIS ══ */}
      <section className="bg-purple-950 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-3">Conditions</p>
              <h2 className="text-3xl font-black text-white mb-4">Les prérequis</h2>
              <p className="text-purple-300 leading-relaxed">
                On cherche des professionnelles passionnées, expérimentées, prêtes à offrir une expérience premium aux clientes afro de Belgique.
              </p>
            </div>
            <div className="space-y-4">
              {prerequis.map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle weight="fill" size={22} className="text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-white/90 leading-relaxed">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SIMULATEUR ══ */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <p className="text-amber-600 text-sm font-bold uppercase tracking-widest mb-3">Revenus</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">
            Calcule tes gains
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Estime tes revenus nets selon ton rythme et ta spécialité.
          </p>
        </div>
        <div className="max-w-lg mx-auto">
          <Simulateur />
        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE ══ */}
      <section className="bg-gray-100 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-amber-600 text-sm font-bold uppercase tracking-widest mb-3">Processus</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Comment ça marche</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {etapes.map((e, i) => (
              <div key={i} className="relative">
                {i < etapes.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px border-t-2 border-dashed border-gray-300 -translate-x-4 z-0" />
                )}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-4xl font-black text-gray-100">{e.num}</span>
                    <div className="bg-gray-50 rounded-xl p-2">{e.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{e.titre}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <p className="text-amber-600 text-sm font-bold uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl font-black text-gray-900">Questions fréquentes</h2>
        </div>
        <FAQ />
      </section>

      {/* ══ CTA FINAL ══ */}
      <section id="dossier" className="bg-gradient-to-br from-purple-950 to-purple-900 py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-4">Prête à rejoindre Afroé ?</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Dépose ton dossier Beauty Pro
          </h2>
          <p className="text-purple-300 mb-10 leading-relaxed">
            5 minutes pour postuler. 72h pour une réponse.
            Zéro engagement avant validation.
          </p>
          <Link href="/beauty-pro/apply"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black px-10 py-5 rounded-full text-lg transition-all shadow-xl shadow-amber-400/20">
            Déposer mon dossier maintenant
            <ArrowRight weight="bold" size={20} />
          </Link>
          <p className="text-purple-400 text-sm mt-6">
            Sélection progressive · Lancement Bruxelles · Liège · Anvers
          </p>
        </div>
      </section>

    </main>
  );
}
