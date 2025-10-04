"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RewardsTimeline from "./RewardsTimeline";

/** === PATHS (utilisés à la fois pour l'affichage et pour les fallbacks) === */
const HERO_IMAGE_SRC = "/images/hero-desert-beauty.jpg";
// const HERO_IMAGE_SRC = "/images/hero-desert-beauty.png";
const LOGO_IMAGE_SRC = "/images/afroe-logo.jpg";
// const LOGO_IMAGE_SRC = "/images/afroe-logo.png";

// Construit le chemin disque attendu dans Next.js (où déposer le fichier)
const HERO_DISK_PATH = `/public${HERO_IMAGE_SRC}`;
const LOGO_DISK_PATH = `/public${LOGO_IMAGE_SRC}`;

/* ---------------- Progress Bar (animée) ---------------- */
function ProgressBar({ points, breaks = [10, 25, 50, 100] }: { points: number; breaks?: number[] }) {
  const total = breaks[3];
  const pct = Math.max(0, Math.min(100, (points / total) * 100));
  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-[#0c0c0c] p-4">
      <div className="mb-3 grid grid-cols-4 text-center text-xs sm:text-sm text-zinc-300">
        <span>🌱 {breaks[0]} pts</span>
        <span>✨ {breaks[1]} pts</span>
        <span>💎 {breaks[2]} pts</span>
        <span>🔥 {breaks[3]} pts</span>
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
      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[0.75rem] sm:text-[0.85rem] text-zinc-200">
        <div>Badge VIP + Tuto</div>
        <div>Bon service / Spotlight / Fees off</div>
        <div>Afroé Pack</div>
        <div>Jackpot 3 500 €</div>
      </div>
    </div>
  );
}

type Role = "client" | "influenceur" | "pro";


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

  // (démo) points pour animer la barre
  const [demoPts, setDemoPts] = useState(12);

  // Countdown (change la date)
  useEffect(() => {
    const END = new Date("2025-10-01T23:59:59Z").getTime();
    const t = setInterval(() => {
      const now = Date.now();
      let diff = Math.max(0, END - now);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown(`${d}j ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const roleNote = useMemo(() => {
    if (role === "pro") return "Pro : 1 mois de booking fees off (après 2 mois payés) au palier 2.";
    if (role === "influenceur") return "Influenceur·e : spotlight IG/TikTok au palier 2.";
    return "Client·e : bon service gratuit (cap 30) au palier 2.";
  }, [role]);

  async function sendOTP() {
    if (!phone) return alert("Entre un numéro de téléphone.");
    // TODO: fetch('/api/send-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone }) })
    setOtpSent(true);
    alert("Code envoyé par SMS (démo).");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !phone) return alert("Email et téléphone requis.");
    if (otpSent && otp.length < 4) return alert("Entre le code de vérification SMS.");
    // TODO: fetch('/api/join', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, phone, role, otp }) })
    setSubmitted(true);
    alert("Inscription envoyée (démo). Ton lien de parrainage arrive par email.");
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center px-6 py-10">
      {/* HEADER */}
      <header className="w-full max-w-6xl mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Accueil Afroé">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-800 bg-black">
            {logoError ? (
              <div className="w-full h-full grid place-items-center text-[10px] text-zinc-300 p-1 text-center leading-tight">
                <div className="font-semibold">Logo manquant</div>
                <div className="opacity-80">
                  Place le fichier à<br />
                  <code className="text-[9px]">{LOGO_DISK_PATH}</code>
                  <br />URL : <code className="text-[9px]">{LOGO_IMAGE_SRC}</code>
                </div>
              </div>
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
            <div className="font-extrabold tracking-wide">Afroé</div>
            <div className="text-xs text-zinc-400">Hip-Hop Glam • Indie Luxe</div>
          </div>
        </Link>
        <span className="text-[10px] px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60">Private Waitlist</span>
      </header>

      {/* HERO */}
      <div className="flex flex-col md:flex-row items-center gap-10 max-w-6xl w-full">
        {/* Image (from /public). Fallback si manquante. */}
        <div className="flex-1 order-1 md:order-2 flex justify-center">
          {imgError ? (
            <div className="w-[300px] h-[400px] sm:w-[400px] sm:h-[500px] rounded-lg bg-gradient-to-br from-[#1B9AA2] via-[#8E58C7] to-[#92D14F] flex items-center justify-center text-center text-zinc-900 font-semibold">
              <div className="p-4">
                <div className="mb-1">Image manquante</div>
                <span className="block text-xs opacity-80">
                  Place le fichier à&nbsp;<code>{HERO_DISK_PATH}</code>
                  <br />URL : <code>{HERO_IMAGE_SRC}</code>
                </span>
              </div>
            </div>
          ) : (
            <Image
              src={HERO_IMAGE_SRC}
              alt="Couple Afro-descendant avec trolleys beauté Afroé"
              width={400}
              height={500}
              className="rounded-lg shadow-xl w-[300px] sm:w-[400px] h-auto"
              onError={() => setImgError(true)}
              priority
            />
          )}
        </div>

        {/* Texte + FORM global (email+tel+role+OTP) */}
        <div className="flex-1 text-center md:text-left flex flex-col order-2 md:order-1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-3 md:mb-4 bg-gradient-to-r from-[#8E58C7] via-[#1B9AA2] to-[#92D14F] bg-clip-text text-transparent">
            ON CHANGE DE GAME
          </h1>

          <p className="text-xl sm:text-2xl text-zinc-300 mb-4 md:mb-6">
            <span className="block">Le futur de la beauté afro démarre maintenant. 🔥</span>
            <span className="block">Afroé, c’est l’étincelle qui allume le game.</span>
            <span className="block">Pro ? Monte ton business d’un cran.</span>
            <span className="block">Client·e ? Connecte-toi aux meilleurs pros.</span>
            <span className="block">Ce n’est pas juste une app. C’est ta nouvelle force.</span>
          </p>

          {/* Bloc récompenses court */}
          <div className="relative mt-2 md:mt-4 p-6 rounded-2xl bg-gradient-to-r from-[#1B9AA2] via-[#8E58C7] to-[#92D14F] text-black shadow-xl inline-block">
            <div aria-hidden className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-white flex items-center justify-center font-extrabold text-sm shadow-lg animate-bounce">
              €3500
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-1">🎁 Jusqu’à 3500€ de récompenses</h2>
            <p className="text-sm text-[#0B0B0B]">
              Invite, grimpe les paliers, débloque des exclus — et vise la cagnotte <strong>3 500€</strong>.
            </p>
          </div>

          {/* FORM principal */}
          <form onSubmit={handleSubmit} className="mt-5 grid gap-3 max-w-lg">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Balance ton email"
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1B9AA2]"
            />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+32 4 12 34 56 78"
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1B9AA2]"
            />

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-full border border-zinc-800 bg-[#111] px-3 py-2 text-sm">
                <input type="radio" checked={role === "client"} onChange={() => setRole("client")} /> Client·e
              </label>
              <label className="flex items-center gap-2 rounded-full border border-zinc-800 bg-[#111] px-3 py-2 text-sm">
                <input type="radio" checked={role === "influenceur"} onChange={() => setRole("influenceur")} /> Influenceur·e
              </label>
              <label className="flex items-center gap-2 rounded-full border border-zinc-800 bg-[#111] px-3 py-2 text-sm">
                <input type="radio" checked={role === "pro"} onChange={() => setRole("pro")} /> Pro beauté
              </label>
            </div>

            {otpSent && (
              <input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Code de vérification (6 chiffres)"
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1B9AA2]"
              />
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={sendOTP}
                className="bg-gradient-to-r from-[#8E58C7] via-[#1B9AA2] to-[#92D14F] rounded-xl py-3 font-bold text-sm text-black shadow-md"
              >
                Envoyer code SMS
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-[#8E58C7] via-[#1B9AA2] to-[#92D14F] rounded-xl py-3 font-bold text-sm text-black shadow-md"
              >
                Prends ta place
              </button>
            </div>

            <p className="text-xs text-zinc-400">{roleNote} Ton lien de parrainage arrive par email après confirmation.</p>
          </form>
        </div>
      </div>

      {/* Mockup téléphone (garde ton design) */}
      <div className="relative w-[280px] sm:w-[320px] h-[550px] sm:h-[650px] rounded-[40px] border-[10px] border-[#2A2A2A] bg-black shadow-2xl overflow-hidden flex-shrink-0 mt-10 md:mt-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20" />
        <div className="absolute inset-0 overflow-y-auto">
          {/* Header mock */}
          <div className="h-36 sm:h-40 bg-gradient-to-br from-[#1B9AA2] via-[#8E58C7] to-[#92D14F] flex flex-col justify-center items-center text-center px-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold">Afroé</h1>
            <p className="text-xs sm:text-sm text-[#E9E3D6] mt-1">Barbe, Coiffure, Ongles, Maquillage, Soins Esthétiques</p>
          </div>

          <div className="p-5">
            {!submitted ? (
              <p className="text-sm text-zinc-300 text-center">Inscris-toi ci-dessus pour recevoir ton lien de parrainage.</p>
            ) : (
              <p className="text-sm text-zinc-300 text-center">✅ Merci ! Check ton email pour ton lien unique.</p>
            )}
          </div>

          {/* Référal helper */}
          <div className="px-5 mt-2">
            <div className="flex flex-col items-center gap-2 text-xs">
              <div className="bg-gradient-to-r from-[#8E58C7] via-[#1B9AA2] to-[#92D14F] p-[1px] rounded-full">
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-zinc-700 bg-[#141416]/95">
                  <span className="w-2 h-2 rounded-full bg-[#92D14F]" aria-hidden />
                  Invite tes amis → gagne des services gratuits
                </span>
              </div>
              <span className="opacity-70">Ton lien est dans l’email de confirmation.</span>
            </div>
          </div>

          <div className="absolute bottom-0 w-full py-3 text-center text-[10px] text-zinc-500 border-t border-zinc-800">
            © {new Date().getFullYear()} Afroé
          </div>
        </div>
      </div>

      {/* REWARDS + URGENCE */}
      <section className="w-full max-w-6xl mt-10 md:mt-14">
        <div className="rounded-2xl border border-zinc-900 bg-[#0f0f0f] p-5">
          <h3 className="m-0 text-lg font-semibold">🎁 Ladder des récompenses</h3>
          <p className="text-sm text-zinc-400">Invite tes amis, grimpe les paliers, débloque des cadeaux exclusifs.</p>
          <div className="mt-3">
            <ProgressBar points={demoPts} />
          </div>

          <div className="mt-6">
            <RewardsTimeline />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-dashed border-zinc-800 px-3 py-1 text-sm text-zinc-200">
              Cap : 30 bons service
            </span>
            <span className="inline-flex items-center rounded-full border border-dashed border-zinc-800 px-3 py-1 text-sm text-zinc-200">
              Cap : 50 Afroé Packs
            </span>
            <span className="inline-flex items-center rounded-full border border-dashed border-zinc-800 px-3 py-1 text-sm font-extrabold text-zinc-200">
              ⏳ Fin dans {countdown}
            </span>
          </div>

          {/* (Démo) contrôles points */}
          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
            <button onClick={() => setDemoPts((p) => Math.max(0, p - 5))} className="rounded-lg border border-zinc-800 px-3 py-1">
              −5 pts
            </button>
            <span>Points actuels : {demoPts}</span>
            <button onClick={() => setDemoPts((p) => Math.min(100, p + 5))} className="rounded-lg border border-zinc-800 px-3 py-1">
              +5 pts
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
