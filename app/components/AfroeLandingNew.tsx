"use client";

import { useState } from "react";

type Role = "client" | "pro" | "influencer";

export default function AfroeLandingNew() {
  const [role, setRole] = useState<Role>("client");
  const [userLink] = useState("https://afroe.com/waitlist?ref=ton-code");

  const leaders = [
    { name: "Aïcha", pts: 63 },
    { name: "Malik", pts: 49 },
    { name: "Kenya", pts: 41 },
    { name: "Nadia", pts: 28 },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1221] to-[#0a0f1e] text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT COLUMN - 60% */}
          <div className="lg:col-span-3 space-y-6">
            {/* Prize Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1 text-sm text-yellow-400">
              <span>🏆</span>
              <span>
                Jusqu&apos;à <span className="font-semibold">3 500 €</span> à gagner
              </span>
            </div>

            {/* Main Content */}
            <div className="space-y-4 text-neutral-300 leading-relaxed">
              <p>T&apos;as galéré à trouver un(e) coiffeur(se) Afro qui capte ton style ?</p>
              <p>
                Ou t&apos;es pro — coiffeur.se, barbier, maquilleur.se, ongliste, esthéticien.ne — et t&apos;en as marre qu&apos;on te prenne pas au sérieux ?
              </p>
              <p>Afroé comprend les deux côtés du miroir 💅🏿✂️</p>
              <p>Et si la beauté Afro devenait enfin visible, pro et stylée ?</p>
              <p>
                Et si c&apos;était toi, le/la prochain(e){" "}
                <span className="text-yellow-400 font-semibold">Glow Leader ? 👑</span>
              </p>
            </div>

            <div className="space-y-4 text-sm text-neutral-400 leading-relaxed">
              <p>Afroé, c&apos;est la vibe et la structure qu&apos;il manquait.</p>
              <p>
                Parce que la beauté Afro, c&apos;est pas une tendance. C&apos;est notre héritage, notre fierté, notre excellence.
              </p>
            </div>

            {/* Form Section */}
            <div className="mt-8 space-y-4">
              {/* Champ nom */}
              <input
                type="text"
                placeholder="Ton prénom et ton blaze complet"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-fuchsia-500 backdrop-blur-sm"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-xl py-3 px-6 font-semibold bg-fuchsia-600 hover:bg-fuchsia-500 transition text-white"
                >
                  Fais briller ton blaze 💫
                </button>
              </div>

              {/* Champ email */}
              <input
                type="email"
                placeholder="Ton email"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-fuchsia-500 backdrop-blur-sm"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-xl py-3 px-6 font-semibold bg-fuchsia-600 hover:bg-fuchsia-500 transition text-white"
                >
                  Prends ta place ✨
                </button>
              </div>

              {/* Champ téléphone + bouton SMS */}
              <div className="flex gap-3">
                <input
                  type="tel"
                  placeholder="Ton numéro de téléphone"
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                />
                <button
                  type="button"
                  className="rounded-xl px-6 py-3 font-medium bg-blue-600 hover:bg-blue-500 transition text-white whitespace-nowrap"
                >
                  Envoie-moi un SMS
                </button>
              </div>

              {/* Champ code + vérification */}
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Code"
                  className="w-24 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-green-500 backdrop-blur-sm text-center"
                />
                <button
                  type="button"
                  className="rounded-xl px-6 py-3 font-medium bg-green-600 hover:bg-green-500 transition text-white"
                >
                  Vérifier
                </button>
              </div>

              {/* Message d’état */}
              <p className="text-xs text-neutral-500">Vérification SMS réussie (2 min).</p>
            </div>

            {/* Role Selector */}
            <div className="flex gap-3">
              <RoleChip label="Client.e" active={role === "client"} onClick={() => setRole("client")} />
              <RoleChip label="Influenceur.euse" active={role === "influencer"} onClick={() => setRole("influencer")} />
              <RoleChip label="Beauty Pro" active={role === "pro"} onClick={() => setRole("pro")} />
            </div>
          </div>

          {/* RIGHT COLUMN - 40% */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 ring-1 ring-white/10 shadow-2xl space-y-6 sticky top-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold">Afroé</h2>
                <span className="text-sm text-neutral-400">Glow Hub</span>
              </div>

              {/* Ton Lien Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-300">Ton lien</h3>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-neutral-300 break-all">
                  {userLink}
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex gap-2 flex-wrap">
                {["WhatsApp", "Email", "Insta", "TikTok", "LinkedIn"].map((platform) => (
                  <button
                    key={platform}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition"
                  >
                    {platform}
                  </button>
                ))}
              </div>

              {/* Classement */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-300">Classement</h3>
                <div className="space-y-2">
                  {leaders.map((leader, index) => (
                    <div
                      key={leader.name}
                      className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {index === 0 ? "👑" : index === 1 ? "🥈" : index === 2 ? "🥉" : "✨"}
                        </span>
                        <span className="text-sm font-medium">{leader.name}</span>
                      </div>
                      <span className="text-sm text-neutral-400">{leader.pts} pts</span>
                    </div>
                  ))}

                  {/* User Position */}
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">👤</span>
                      <span className="text-sm font-medium">12 Toi (toi)</span>
                    </div>
                    <span className="text-sm text-neutral-400">0 pts</span>
                  </div>
                </div>
              </div>

              {/* 🌀 Comment ça marche */}
              <div className="space-y-4 mt-10">
                <h3 className="text-sm sm:text-base font-semibold text-neutral-200 uppercase tracking-wide">
                  ⚙️ Comment ça marche
                </h3>

                <ul className="space-y-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-500 font-bold">•</span>
                    <span>Partage ton lien unique à ton crew.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-500 font-bold">•</span>
                    <span>+10 pts dès qu’un·e client·e télécharge l’app.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-500 font-bold">•</span>
                    <span>+50 pts quand un·e Beauty Pro s’inscrit via ton lien.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-500 font-bold">•</span>
                    <span>+100 pts si un·e influenceur·e (≥ 2k followers) rejoint la Glow List.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* END RIGHT COLUMN */}
        </div>
      </div>
    </main>
  );
}

/* ---------- UI subcomponents ---------- */
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
        "px-4 py-2 rounded-lg text-sm border transition",
        active
          ? "bg-fuchsia-600 border-fuchsia-500 text-white"
          : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
