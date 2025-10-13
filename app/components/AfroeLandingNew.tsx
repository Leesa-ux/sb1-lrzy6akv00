"use client";

import Image from "next/image";
import { useState } from "react";

type Role = "client" | "pro" | "influencer";

export default function AfroeLandingNew() {
  const [role, setRole] = useState<Role>("client");

  const leaders = [
    { name: "Aïcha", pts: 63 },
    { name: "Malik", pts: 49 },
    { name: "Kenya", pts: 41 },
    { name: "Nadia", pts: 28 },
    { name: "S'Yann", pts: 22 },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900 text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">

        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-1 text-sm">
            <span className="text-yellow-400">🏆</span>
            <span>Jusqu&apos;à <span className="font-semibold">3 500 €</span> à gagner</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="text-white">Ton Style, Ton Impact, Ton Futur.</span>
          </h1>

          <div className="relative mx-auto rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl w-full max-w-3xl">
            <Image
              src="/images/hero-desert-beauty.jpg"
              alt="Afroé — Glow crew"
              width={1600}
              height={1066}
              className="w-full h-auto object-cover"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </section>

        <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 shadow-lg">
          <div className="prose prose-invert max-w-none">
            <p className="mb-3">
              T&apos;as galéré à trouver un(e) coiffeur(se) Afro qui capte ton style ?<br />
              Ou t&apos;es pro — coiffeur.se, barbier, maquilleur.se, ongliste, esthéticien.ne — et t&apos;en as marre qu&apos;on te prenne pas au sérieux ?
            </p>
            <p className="mb-3">
              Afroé comble des deux côtés du miroir 💈💅🏾
            </p>
            <p className="mb-3">
              Et si la beauté Afro devenait enfin visible, pro et stylée ?
            </p>
            <p className="mb-0">
              Et si c&apos;était toi, le/la prochain(e) <strong>Glow Leader</strong> ? 👑
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-semibold">Inscris-toi sur la liste d&apos;attente exclusive</h2>
            <p className="text-sm text-neutral-300 mt-2">
              Rejoins la waitlist Afroé et participe au concours de lancement. Partage ton lien unique,
              grimpe dans le classement et gagne jusqu&apos;à 3 500 € + des récompenses exclusives !
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Demo: inscription soumise (branche ton back quand prêt).");
              }}
            >
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 outline-none focus:ring-2 focus:ring-fuchsia-500"
              />

              <input
                type="tel"
                placeholder="Numéro de téléphone (optionnel)"
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 outline-none focus:ring-2 focus:ring-fuchsia-500"
              />

              <div className="flex flex-wrap gap-2">
                <RoleChip
                  label="Client"
                  active={role === "client"}
                  onClick={() => setRole("client")}
                />
                <RoleChip
                  label="Beauty Pro"
                  active={role === "pro"}
                  onClick={() => setRole("pro")}
                />
                <RoleChip
                  label="Influenceur"
                  active={role === "influencer"}
                  onClick={() => setRole("influencer")}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Code SMS (optionnel)"
                  className="flex-1 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
                <button
                  type="button"
                  className="rounded-xl px-4 py-3 font-medium bg-neutral-100 text-neutral-900 hover:bg-white transition"
                  onClick={() => alert("Demo: envoi SMS")}
                >
                  Envoyer un SMS
                </button>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl py-3 font-semibold bg-fuchsia-600 hover:bg-fuchsia-500 transition"
              >
                Rejoindre la Glow List
              </button>

              <p className="text-xs text-neutral-400">
                On t&apos;enverra le top départ par email / SMS. Tu peux te désinscrire à tout moment.
              </p>
            </form>

            <div className="mt-6">
              <h3 className="font-semibold">Invite tes amis, grimpe dans le classement et gagne jusqu&apos;à 3 500 € !</h3>
              <p className="text-sm text-neutral-300">
                Dès que tu t&apos;inscris, tu reçois ton lien unique. Partage-le pour gagner des points et débloquer des récompenses.
              </p>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                {["WhatsApp", "Email", "Insta", "TikTok", "LinkedIn"].map((k) => (
                  <button
                    key={k}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm hover:border-neutral-700"
                    onClick={() => alert(`Demo: partager via ${k}`)}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-semibold">Classement des Glow Leaders</h2>

            <ol className="mt-4 space-y-2">
              {leaders.map((row, i) => (
                <li
                  key={row.name}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "✨"}</span>
                    <span className="font-medium">{row.name}</span>
                  </div>
                  <span className="tabular-nums text-sm text-neutral-300">{row.pts} pts</span>
                </li>
              ))}
            </ol>

            <p className="mt-4 text-xs text-neutral-400">
              Chaque nom te fait monter la beauté Afro. Tu te places où ? ✊🏾
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-semibold">Système de points</h2>
              <span className="text-xs text-neutral-400">⚠️ dès le lancement prévu mi-décembre</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Client&nbsp;: <strong>+10</strong> (téléchargement de l&apos;app)</li>
              <li>Beauty Pro&nbsp;: <strong>+50</strong> (inscription validée)</li>
              <li>Influenceur&nbsp;: <strong>+100</strong> (≥ 2 000 followers)</li>
            </ul>
            <div className="mt-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 p-4">
              <p className="font-semibold">Bonus Lancement ×2</p>
              <p className="text-sm">Téléchargements & inscriptions le jour J.</p>
            </div>
            <p className="mt-3 text-xs text-neutral-400">
              Les points finaux sont validés au lancement (téléchargements clients, inscriptions pros, influenceurs éligibles).
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-semibold">Récompenses par étapes</h2>
            <p className="text-sm text-neutral-300 mt-2">
              Chaque étape débloque une récompense exclusive — plus tu partages, plus tu montes dans le classement.
            </p>

            <div className="mt-4 space-y-3">
              <Tier label="Palier 1" pts="10 pts" desc="Badge Glow Starter & mise en avant waitlist" />
              <Tier label="Palier 2" pts="50 pts" desc="Accès anticipé (VIP) + shoutout IG" />
              <Tier label="Palier 3" pts="100 pts" desc="Glow Kit édition limitée" />
              <Tier label="Grand Prix" pts="3 500 €" desc="🏆 1er·ère du classement au lancement" highlight />
            </div>

            <ul className="mt-4 text-xs text-neutral-400 space-y-1 list-disc list-inside">
              <li>Points validés au lancement (téléchargements clients, inscriptions pros, influenceurs éligibles).</li>
              <li>Influenceur éligible : ≥ 2 000 followers.</li>
              <li>Un seul compte par personne. Fraude = exclusion.</li>
            </ul>
          </div>
        </section>

        <section className="text-center py-6">
          <p className="font-semibold text-lg">Tu ne vends pas. Tu rayonnes. ✨</p>
          <p className="text-sm text-neutral-400 mt-2">
            Afroé — ton art, ta réussite, ton indépendance. Ton cercle = ton pouvoir. Let&apos;s glow. 🌟
          </p>
        </section>
      </div>
    </main>
  );
}

function RoleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-2 rounded-lg text-sm border transition",
        active
          ? "bg-fuchsia-600 border-fuchsia-500"
          : "bg-neutral-900 border-neutral-800 hover:border-neutral-700",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function Tier({
  label,
  pts,
  desc,
  highlight,
}: {
  label: string;
  pts: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl p-4 border",
        highlight
          ? "bg-fuchsia-600/10 border-fuchsia-500/30"
          : "bg-white/5 border-white/10",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{label}</span>
        <span className="text-sm text-neutral-400">{pts}</span>
      </div>
      <p className="text-sm text-neutral-300 mt-1">{desc}</p>
    </div>
  );
}
