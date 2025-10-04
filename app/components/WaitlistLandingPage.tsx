"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RewardsTimeline from "./RewardsTimeline";

/** === Images (placer les fichiers dans /public/images/…) === */
const HERO_IMAGE_SRC = "/images/hero-desert-beauty.jpg";
const LOGO_IMAGE_SRC = "/images/afroe-logo.jpg";

/* ---------------- Progress Bar (inchangée) ---------------- */
function ProgressBar({
  points,
  breaks = [10, 25, 50, 100],
}: {
  points: number;
  breaks?: number[];
}) {
  const total = breaks[3];
  const pct = Math.max(0, Math.min(100, (points / total) * 100));
  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-[#0c0c0c] p-4">
      <div className="mb-3 grid grid-cols-4 text-center text-xs sm:text-sm text-zinc-300">
        <span>🎀 Étape 1 · {breaks[0]} pts</span>
        <span>✨ Étape 2 · {breaks[1]} pts</span>
        <span>💎 Étape 3 · {breaks[2]} pts</span>
        <span>🏆 Étape 4 · {breaks[3]} pts</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#222]">
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: pct + "%",
            transition: "width 700ms ease",
            background: "linear-gradient(90deg,#FF2D95,#7B2FFF,#00E5FF)",
          }}
        />
      </div>
    </div>
  );
}

type Role = "client" | "influenceur" | "pro";

/* ---------------- PAGE ---------------- */
export default function WaitlistLandingPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("client");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [countdown, setCountdown] = useState("—");
  const [demoPts, setDemoPts] = useState(12);

  useEffect(() => {
    const END = new Date("2025-10-01T23:59:59Z").getTime();
    const t = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, END - now);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown(
        `${d}j ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`
      );
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const roleNote = useMemo(() => {
    if (role === "pro")
      return "Pro : 1 mois de booking fees off (après 2 mois payés) à l'étape 2.";
    if (role === "influenceur")
      return "Influenceur·e : spotlight IG/TikTok à l'étape 2.";
    return "Client·e : bon service beauté gratuit (cap 30) à l'étape 2.";
  }, [role]);

  async function sendOTP() {
    if (!phone) return alert("Entre un numéro de téléphone.");
    setOtpSent(true);
    alert("Code envoyé par SMS (démo).");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !phone) return alert("Email et téléphone requis.");
    if (otpSent && otp.length < 4) return alert("Entre le code de vérification SMS.");
    setSubmitted(true);
    alert("Inscription envoyée (démo). Ton lien de parrainage arrive par email.");
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* HEADER — largeur contenue */}
      <header className="mx-auto w-full max-w-7xl px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Accueil Afroé">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-800 bg-black">
            {logoError ? (
              <div className="w-full h-full grid place-items-center text-[10px] text-zinc-300">Logo</div>
            ) : (
              <Image
                src={LOGO_IMAGE_SRC}
                alt="Logo Afroé"
                fill
                sizes="48px"
                className="object-cover"
                onError={() => setLogoError(true)}
                priority
              />
            )}
          </div>
          <div>
            <div className="font-extrabold tracking-wide font-sans">Afroé</div>
            <div className="text-xs text-zinc-400 font-sans">Hip-Hop Glam • Indie Luxe</div>
          </div>
        </Link>
        <span className="text-[10px] px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60">
          Private Waitlist
        </span>
      </header>

      {/* HERO — grille 2 colonnes, espacements et alignements revus */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Colonne gauche : titre + paragraphe + bannière + formulaire */}
          <div className="order-2 md:order-1">
            <h1 className="font-h1 text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-[#8E58C7] via-[#1B9AA2] to-[#92D14F] bg-clip-text text-transparent">
              ON CHANGE DE GAME
            </h1>

            <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed mb-6">
              Le futur de la beauté afro démarre maintenant. 🔥 Afroé, c'est l'étincelle qui allume le game.
              <br />Pro ? Monte ton business d'un cran.
              <br />Client·e ? Connecte-toi aux meilleurs pros.
              <br />Ce n'est pas juste une app. C'est ta nouvelle force.
            </p>

            {/* Bannière récompenses — replacée juste sous le texte */}
            <div className="relative mb-6 p-6 rounded-2xl bg-gradient-to-r from-[#1B9AA2] via-[#8E58C7] to-[#92D14F] text-black shadow-xl inline-block">
              <div
                aria-hidden
                className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-white flex items-center justify-center font-extrabold text-sm shadow-lg"
              >
                €3500
              </div>
              <h2 className="font-h2 text-lg sm:text-xl font-bold mb-1">
                🎁 Jusqu'à 3500€ de récompenses
              </h2>
              <p className="text-sm text-[#0B0B0B]">
                Invite, grimpe les étapes, débloque des exclus — et vise la cagnotte <strong>3 500€</strong>.
              </p>
            </div>

            {/* FORM - New vertical layout */}
            <form onSubmit={handleSubmit} className="grid gap-4 max-w-md">
              {/* Email field */}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Balance ton email"
                className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:ring-2 focus:ring-[#1B9AA2] focus:border-transparent"
              />

              {/* Submit button directly under email */}
              <button
                type="submit"
                className="bg-gradient-to-r from-[#8E58C7] via-[#1B9AA2] to-[#92D14F] rounded-2xl py-4 font-bold text-base text-black hover:opacity-90 transition-opacity"
              >
                Prends ta place
              </button>

              {/* Phone field */}
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+32 4 12 34 56 78"
                className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:ring-2 focus:ring-[#1B9AA2] focus:border-transparent"
              />

              {/* Radio buttons for role selection */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-zinc-800 bg-[#111] text-sm cursor-pointer hover:border-[#1B9AA2] transition-colors">
                  <input type="radio" checked={role === "client"} onChange={() => setRole("client")} />
                  Client·e
                </label>
                <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-zinc-800 bg-[#111] text-sm cursor-pointer hover:border-[#1B9AA2] transition-colors">
                  <input type="radio" checked={role === "influenceur"} onChange={() => setRole("influenceur")} />
                  Influenceur·e
                </label>
                <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-zinc-800 bg-[#111] text-sm cursor-pointer hover:border-[#1B9AA2] transition-colors">
                  <input type="radio" checked={role === "pro"} onChange={() => setRole("pro")} />
                  Pro beauté
                </label>
              </div>

              {/* Send SMS button */}
              <button
                type="button"
                onClick={sendOTP}
                className="bg-gradient-to-r from-[#8E58C7] via-[#1B9AA2] to-[#92D14F] rounded-2xl py-4 font-bold text-base text-black hover:opacity-90 transition-opacity"
              >
                Envoyer code SMS
              </button>

              {/* OTP field (shown after SMS sent) */}
              {otpSent && (
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Code de vérification (6 chiffres)"
                  className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:ring-2 focus:ring-[#1B9AA2] focus:border-transparent"
                />
              )}

              {/* Role note at bottom */}
              <p className="text-xs text-zinc-500 mt-1">{roleNote}</p>
            </form>
          </div>

          {/* Colonne droite : Phone mockup hybride */}
          <div className="order-1 md:order-2 flex justify-center items-center">
            <div className="relative w-[280px] sm:w-[320px] h-[550px] sm:h-[650px] rounded-[40px] border-[10px] border-[#2A2A2A] bg-black shadow-2xl overflow-hidden flex-shrink-0 mt-10 md:mt-16">
              {/* En-tête (notch) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20" />

              {/* Contenu interne */}
              <div className="absolute inset-0 overflow-y-auto flex flex-col">
                {/* Logo + catégories */}
                <div className="h-36 sm:h-40 bg-gradient-to-br from-[#1B9AA2] via-[#8E58C7] to-[#92D14F] flex flex-col justify-center items-center text-center px-4">
                  <Image
                    src={LOGO_IMAGE_SRC}
                    alt="Logo Afroé"
                    width={50}
                    height={50}
                    className="rounded-full mb-2"
                    priority
                  />

                  {/* Liste services avec points épais */}
                  <p className="text-xs sm:text-sm text-[#E9E3D6] flex flex-wrap justify-center gap-2">
                    <span>Barbe</span>
                    <span className="font-extrabold">•</span>
                    <span>Maquillage</span>
                    <span className="font-extrabold">•</span>
                    <span>Ongles</span>
                    <span className="font-extrabold">•</span>
                    <span>Coiffure</span>
                    <span className="font-extrabold">•</span>
                    <span>Soins</span>
                  </p>
                </div>

                {/* Texte principal */}
                <div className="p-5 text-center text-sm text-zinc-300">
                  <p className="font-semibold text-base mb-2">
                    Inscris-toi & invite tes amis 🎉
                  </p>
                  <p>
                    💎 Gagne des services beauté gratuits et tente ta chance au Jackpot Afroé <strong>3 500 €</strong>.
                  </p>

                  {/* Bouton voir plus (mobile uniquement) */}
                  <button
                    className="mt-3 text-xs text-[#92D14F] underline sm:hidden"
                    onClick={() => {
                      const details = document.getElementById("mockup-details");
                      if (details) details.classList.toggle("hidden");
                    }}
                  >
                    Voir plus +
                  </button>

                  {/* Détails : cachés en mobile, visibles en desktop */}
                  <div
                    id="mockup-details"
                    className="hidden sm:block mt-3 space-y-2 text-left text-xs sm:text-sm"
                  >
                    <p>👯 Chaque ami inscrit = une chance en plus.</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>🎀 Badge VIP + -10%</li>
                      <li>✨ Services beauté gratuits</li>
                      <li>💎 Afroé Beauty Kit (80€+)</li>
                      <li>🏆 Accès au Jackpot Afroé 3 500 €</li>
                    </ul>
                    <p className="text-[#92D14F] font-semibold mt-2">
                      Plus tu parraines, plus tu montes en récompenses ✨
                    </p>
                  </div>
                </div>

                {/* Footer interne du mockup */}
                <div className="mt-auto w-full py-3 text-center text-[10px] text-zinc-500 border-t border-zinc-800">
                  © {new Date().getFullYear()} Afroé
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE + PROGRESS — même ordre, mieux espacés */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-16">
        <div className="rounded-2xl border border-zinc-900 bg-[#0f0f0f] p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h3 className="font-h2 text-lg font-semibold">🎁 Étapes de récompenses</h3>
            <span className="text-sm text-zinc-400">⏳ Fin dans {countdown}</span>
          </div>

          <div className="mt-4">
            <ProgressBar points={demoPts} breaks={[10, 25, 50, 100]} />
          </div>

          <div className="mt-6">
            <RewardsTimeline />
          </div>

          {/* Contrôles démo */}
          <div className="mt-5 flex items-center gap-3 text-sm text-zinc-400">
            <button
              onClick={() => setDemoPts((p) => Math.max(0, p - 5))}
              className="rounded-lg border border-zinc-800 px-3 py-1"
            >
              −5 pts
            </button>
            <span>Points actuels : {demoPts}</span>
            <button
              onClick={() => setDemoPts((p) => Math.min(100, p + 5))}
              className="rounded-lg border border-zinc-800 px-3 py-1"
            >
              +5 pts
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER — marge plus aérée */}
      <footer className="mx-auto w-full max-w-7xl px-6 pb-10 text-xs text-zinc-500">
        © {new Date().getFullYear()} Afroé — Tous droits réservés
      </footer>
    </div>
  );
}
