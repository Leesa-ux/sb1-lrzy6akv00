"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Icons
import { FaRegUser, FaCrown, FaStar, FaKey } from "react-icons/fa6";
import { GiLipstick, GiDiamondRing } from "react-icons/gi";
import { MdSpa } from "react-icons/md";

// Data-driven timeline
import RewardsTimeline from "./RewardsTimeline";

// Logo
const LOGO_IMAGE_SRC = "/images/afroe-logo.jpg";

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
    const END = new Date("2025-12-31T23:59:59Z").getTime();
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
    if (role === "influenceur") return "Influenceur·e : spotlight IG/TikTok à l'étape 2.";
    return "Client·e : bon service beauté gratuit (cap 30) à l'étape 2.";
  }, [role]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !phone) return alert("Email et téléphone requis.");
    alert("Inscription envoyée (démo). Ton lien de parrainage arrive par email.");
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* LEFT */}
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
                className="bg-gradient-to-r from-[#8E58C7] via-[#1B9AA2] to-[#92D14F] rounded-2xl py-4 font-bold text-base text-black hover:opacity-90 transition-opacity"
              >
                Prends ta place
              </button>
              <p className="text-xs text-zinc-500 mt-1">{roleNote}</p>
            </form>
          </div>

          {/* RIGHT - mock phone */}
          <div className="order-1 md:order-2 flex justify-center items-center">
            <div className="relative mx-auto mt-10 w-[280px] sm:w-[320px] rounded-[2rem] bg-black text-white overflow-hidden border border-zinc-800 shadow-[0_0_30px_rgba(146,209,79,0.2)]">
              <div className="bg-gradient-to-b from-[#8E58C7] via-[#1B9AA2] to-[#92D14F] py-4 text-center flex flex-col items-center gap-2">
                <Image src={LOGO_IMAGE_SRC} alt="Logo Afroé" width={50} height={50} className="rounded-full" priority />
                <span className="text-sm font-medium tracking-wide">Barbe • Maquillage • Ongles • Coiffure • Soins</span>
              </div>
              <div className="p-5 text-xs text-zinc-300 leading-relaxed">
                <p className="text-[#92D14F] font-semibold mb-2">🎁 Jusqu'à 3500€ de récompenses</p>
                <p>Invite, monte de niveau, et débloque des cadeaux exclusifs.</p>
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
