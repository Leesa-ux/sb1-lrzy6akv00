"use client";
import { useEffect, useMemo, useState } from "react";
import { CAMPAIGN_CONFIG } from "@/config/campaign";
import Image from "next/image";
import Link from "next/link";

// Icons
import { FaRegUser, FaCrown, FaStar, FaKey } from "react-icons/fa6";
import { GiLipstick, GiDiamondRing } from "react-icons/gi";
import { MdSpa } from "react-icons/md";

// Data-driven timeline
import RewardsTimeline from "./RewardsTimeline";

// Logo
const LOGO_IMAGE_SRC = "/images/bg-afroe.jpg";
const HERO_IMAGE_SRC = "/images/hero-crew-v2.jpg";

function ProgressBar({ points, breaks = [10, 25, 50, 100] }: { points: number; breaks?: number[] }) {
  const pct = Math.min(100, (points / breaks[3]) * 100);
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
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg,#FF2D95,#7B2FFF,#00E5FF)",
          }}
        />
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
  const [logoError, setLogoError] = useState(false);
  const [countdown, setCountdown] = useState("—");
  const [demoPts, setDemoPts] = useState(12);

  // Countdown
  useEffect(() => {
    const END = CAMPAIGN_CONFIG.endDate.getTime();
    const t = setInterval(() => {
      const diff = Math.max(0, END - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown(`${d}j ${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const roleNote = useMemo(() => {
    if (role === "pro") return "Pro : 1 mois de booking fees off (après 2 mois payés) à l'étape 2.";
    if (role === "influenceur") return "Influenceur.euse : spotlight IG/TikTok à l'étape 2.";
    return "Client.e : bon service beauté gratuit (cap 30) à l'étape 2.";
  }, [role]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !phone) return alert("Email et téléphone requis.");
    alert("Inscription envoyée (démo). Ton lien de parrainage arrive par email.");
  }

  return (
    <div className="min-h-screen bg-black text-white vignette-bg">
      {/* HEADER */}
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
            <div className="text-xs text-zinc-400 font-sans">Ton Style • Ton Impact • Ton Futur</div>
          </div>
        </Link>
        <span className="text-[10px] px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60">Private Waitlist</span>
      </header>

      {/* HERO */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-12">
        {/* HERO IMAGE + HEADLINE */}
        <div className="flex flex-col items-center justify-center mb-12 md:mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight">
            Ton Style, Ton Impact, <span className="bg-gradient-to-r from-blue-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Ton Futur</span>.
          </h1>
          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed mb-8 max-w-3xl">
            Le futur de la beauté afro démarre maintenant. 🔥 Afroé, c'est l'étincelle qui allume le game.
          </p>
          <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(217,70,239,0.25)] border border-white/10 mb-4">
            <Image
              src={HERO_IMAGE_SRC}
              alt="La communauté Afroé – style et beauté afro"
              width={900}
              height={900}
              className="w-full h-auto object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* LEFT */}
          <div>

            <div className="space-y-4 text-zinc-300 mb-6">
              <p className="text-base">Pro ? Monte ton business d'un cran. 💼</p>
              <p className="text-base">Client.e ? Connecte-toi aux meilleurs pros. ✨</p>
              <p className="text-base font-semibold text-white">Ce n'est pas juste une app. C'est ta nouvelle force.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 max-w-md">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Balance ton email"
                className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:ring-2 focus:ring-[#1B9AA2] focus:border-transparent"
              />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+32 4 12 34 56 78"
                className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:ring-2 focus:ring-[#1B9AA2] focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 via-fuchsia-500 to-pink-500 rounded-2xl py-4 font-bold text-base text-white hover:opacity-90 transition-opacity shadow-lg"
              >
                Prends ta place ✨
              </button>
              <p className="text-xs text-zinc-500 mt-1">{roleNote}</p>
            </form>
          </div>

          {/* RIGHT - mock phone */}
          <div className="flex justify-center items-center">
            <div className="relative mx-auto w-[280px] sm:w-[320px] rounded-[2rem] bg-black text-white overflow-hidden border border-zinc-800 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
              <div className="bg-gradient-to-br from-blue-500 via-fuchsia-500 to-pink-500 py-4 text-center flex flex-col items-center gap-2">
                <Image src={LOGO_IMAGE_SRC} alt="Logo Afroé" width={50} height={50} className="rounded-full shadow-lg" priority />
                <span className="text-sm font-medium tracking-wide">Barbe • Maquillage • Ongles • Coiffure • Soins</span>
              </div>
              <div className="p-5 text-xs text-zinc-300 leading-relaxed space-y-3">
                <p className="text-fuchsia-400 font-semibold">🎁 Jusqu'à 2000€ de récompenses</p>
                <p>Invite, monte de niveau, et débloque des cadeaux exclusifs.</p>
                <p className="text-amber-300 text-[10px]">Partage ton lien unique • Grimpe dans le classement • Gagne des prix</p>
              </div>
            </div>
          </div>
        </div>

        {/* REWARDS */}
        <section className="w-full mt-12">
          <div className="rounded-2xl border border-zinc-900 bg-[#0f0f0f] p-5 max-w-7xl mx-auto">
            <h3 className="m-0 text-lg font-semibold">🎁 Étapes des récompenses</h3>
            <p className="text-sm text-zinc-400">Fin dans {countdown}</p>
            <div className="mt-3">
              <ProgressBar points={demoPts} />
            </div>
            <div className="mt-6">
              <RewardsTimeline />
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
