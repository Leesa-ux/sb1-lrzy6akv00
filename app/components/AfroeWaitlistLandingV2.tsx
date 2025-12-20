"use client";

import React, { useEffect, useMemo, useState } from "react";
import HeroSectionV2 from "./HeroSectionV2";
import { PhoneInputBelgiumDark } from "./PhoneInputBelgiumDark";

function normalizeError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (typeof err === "string") return new Error(err);
  try { return new Error(JSON.stringify(err)); } catch { return new Error("Unknown error"); }
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    if (error) return { hasError: true, error: normalizeError(error) };
    return { hasError: false, error: null };
  }
  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    const safe = normalizeError(error);
    if (process.env.NODE_ENV === "development") console.error("[ErrorBoundary]", safe, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-3">
            <div className="text-3xl">⚡️</div>
            <h2 className="text-xl font-semibold">Quelque chose a planté.</h2>
            <p className="text-slate-300 text-sm">On a capté l'erreur et on la loggue. Rafraîchis la page. Si ça persiste, envoie-moi la dernière action.</p>
            <button className="mt-1 px-3 py-2 text-sm rounded-lg bg-slate-800 border border-white/10 hover:border-white/20" onClick={() => this.setState({ hasError: false, error: null })}>Réessayer</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

type ClassValue = string | number | boolean | undefined | null | ClassValue[] | { [key: string]: unknown };

export function clsx(...parts: ClassValue[]): string {
  const out: string[] = [];
  const push = (v: ClassValue): void => {
    if (!v) return;
    if (Array.isArray(v)) {
      v.forEach(push);
      return;
    }
    if (typeof v === "string") {
      out.push(v);
      return;
    }
    if (typeof v === "object") {
      if (v === null) return;
      for (const k in v) { if (Object.prototype.hasOwnProperty.call(v, k) && v[k]) out.push(k); }
    }
  };
  parts.forEach(push);
  return out.join(" ");
}

type RoleType = "client" | "pro" | "influencer" | null;
type SubmitState = "idle" | "loading" | "done" | "error";
type SmsState = "idle" | "sending" | "sent" | "verifying" | "verified" | "expired" | "error";

export default function AfroeWaitlistLandingV2(): JSX.Element {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<RoleType>(null);
  const [consentSMS, setConsentSMS] = useState<boolean>(true);
  const [submit, setSubmit] = useState<SubmitState>("idle");
  const [devSkipSms, setDevSkipSms] = useState<boolean>(false);
  const [earlyBirdSpotsLeft, setEarlyBirdSpotsLeft] = useState<number>(100);
  const [skillAnswer, setSkillAnswer] = useState<string>("");
  const [consentGDPR, setConsentGDPR] = useState<boolean>(false);

  const [smsState, setSmsState] = useState<SmsState>("idle");
  const [smsCode, setSmsCode] = useState<string>("");
  const [smsExpiresAt, setSmsExpiresAt] = useState<number | null>(null);
  const smsRemaining = useMemo(() => { if (!smsExpiresAt) return 0; return Math.max(0, smsExpiresAt - Date.now()); }, [smsExpiresAt]);
  const smsMin = Math.floor(smsRemaining / 60000);
  const smsSec = Math.floor((smsRemaining % 60000) / 1000);

  useEffect(() => {
    try { const sp = new URLSearchParams(window.location.search); setDevSkipSms(sp.get("dev") === "1"); } catch {}
  }, []);

  // Fetch early bird spots left
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/early-bird-count", { cache: "no-store" });
        if (res.ok && mounted) {
          const data = await res.json() as { spotsLeft: number };
          setEarlyBirdSpotsLeft(data.spotsLeft);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  async function sendSmsCode(): Promise<void> {
    if (!phone) return;
    setSmsState("sending");
    try {
      const r = await fetch("/api/send-sms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, email, role, ref: null }) });
      if (!r.ok) throw new Error("sms");
      setSmsState("sent");
      setSmsExpiresAt(Date.now() + 2 * 60 * 1000);
    } catch { setSmsState("error"); }
  }

  async function verifySmsCode(): Promise<void> {
    if (!phone || !smsCode) return;
    setSmsState("verifying");
    try {
      const r = await fetch("/api/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, code: smsCode }) });
      if (!r.ok) throw new Error("verify");
      setSmsState("verified");
    } catch { setSmsState(smsRemaining === 0 ? "expired" : "error"); }
  }

  const canSubmit = useMemo(() => {
    const nameOk = firstName.trim().length > 0 && lastName.trim().length > 0;
    const phoneOk = phone.trim().length > 0;
    const roleOk = !!role;
    const smsOk = !consentSMS || devSkipSms || smsState === "verified";
    return nameOk && phoneOk && roleOk && smsOk;
  }, [firstName, lastName, phone, role, consentSMS, devSkipSms, smsState]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !role || !canSubmit) return;

    if (parseInt(skillAnswer) !== 32) {
      alert('La réponse à la question d\'habileté est incorrecte. (8 × 4 = ?)');
      return;
    }

    if (!consentGDPR) {
      alert('Vous devez accepter la politique de confidentialité pour continuer.');
      return;
    }

    setSubmit("loading");
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    try {
      const res = await fetch("/api/join-waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, phone, first_name: firstName.trim(), last_name: lastName.trim(), role: role === "client" ? "client" : role === "influencer" ? "influencer" : "beautypro", skillAnswerCorrect: true }) });
      if (!res.ok) throw new Error("signup failed");

      const data = await res.json();

      try {
        await fetch("/api/save-lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ timestamp: new Date().toISOString(), email, phone, role, referralCode: data.referralCode, status: "subscribed", source: "landing_v2" }) });
      } catch {}

      if (data.success && data.referralCode) {
        window.location.href = `/success?ref=${data.referralCode}`;
      } else {
        setSubmit("done");
      }
    } catch { setSubmit("error"); }
  }

  const handleHeroCTA = () => {
    const el = document.getElementById("waitlist-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white font-sans">
        {/* HERO */}
        <HeroSectionV2 onCTAClick={handleHeroCTA} earlyBirdSpotsLeft={earlyBirdSpotsLeft} />

        {/* SECTION — Pourquoi rejoindre ? */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
            Pourquoi rejoindre la <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-amber-300">Glow List</span> Afroé ?
          </h2>
          <p className="text-base sm:text-lg text-slate-200/90 mb-8 text-center max-w-3xl mx-auto">
            T'as galéré à trouver un(e) coiffeur(se) Afro qui capte ton style ? Ou t'es pro et t'en as marre qu'on te prenne pas au sérieux ?
            Afroé comprend les deux côtés du miroir.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-sm sm:text-base">
            <div className="glassy neon-fuchsia rounded-2xl p-6">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="text-xl font-bold mb-2">Accès en avant-première</h3>
              <p className="text-slate-200/90 leading-relaxed">
                Découvre l'app Afroé avant tout le monde : services à domicile ou en salon, sélection de pros spécialisés beauté Afro.
              </p>
            </div>

            <div className="glassy neon-gold rounded-2xl p-6">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="text-xl font-bold mb-2">Récompenses exclusives</h3>
              <p className="text-slate-200/90 leading-relaxed">
                iPhone 17 Pro pour le #1, 3 500 € cash (tirage), Glow Kits, réductions et avantages VIP réservés aux membres de la waitlist.
              </p>
            </div>

            <div className="glassy neon-blue rounded-2xl p-6">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-xl font-bold mb-2">Classement Glow</h3>
              <p className="text-slate-200/90 leading-relaxed">
                Invite ton crew, monte dans le classement et débloque des statuts premium dans l'écosystème Afroé. Les vrais boss sont récompensés.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION — C'est quoi Afroé ? */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glassy rounded-2xl p-8 md:p-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Afroé, c'est quoi ?</h2>
            <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed mb-4">
              Afroé, c'est l'app qui connecte les pros et les passionné·es de la beauté Afro. Coiffure, make-up, ongles, grooming… à domicile ou en salon. Pro, stylé, sur-mesure.
            </p>
            <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed font-medium">
              Parce que notre beauté mérite l'excellence, pas des compromis.
            </p>
          </div>
        </section>

        {/* SECTION — Story fondatrice */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glassy neon-fuchsia rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Pourquoi Afroé ?</h3>
            <p className="text-base sm:text-lg text-slate-200/90 mb-4 leading-relaxed">
              « Pendant 10 ans, j'ai galéré à trouver un(e) coiffeur(se) qui capte vraiment mes cheveux 4C. J'ai créé Afroé pour que personne n'ait plus à vivre ça. La beauté Afro mérite expertise, respect et qualité premium. »
            </p>
            <p className="text-sm text-slate-300">
              — L'équipe Afroé
            </p>
          </div>
        </section>

        {/* SECTION — Comment ça marche */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center">Comment ça marche ?</h2>
          <div className="grid gap-8 sm:grid-cols-3 text-sm sm:text-base">
            <div className="glassy rounded-2xl p-6 text-center">
              <div className="text-amber-300 text-5xl font-bold mb-4">1</div>
              <h3 className="text-xl font-bold mb-3">Tu t'inscris</h3>
              <p className="text-slate-200/90 leading-relaxed">
                20 secondes, c'est fait. Tu rejoins la Glow List et tu reçois ton lien unique par SMS / email.
              </p>
            </div>

            <div className="glassy rounded-2xl p-6 text-center">
              <div className="text-fuchsia-300 text-5xl font-bold mb-4">2</div>
              <h3 className="text-xl font-bold mb-3">Tu partages ton lien</h3>
              <p className="text-slate-200/90 leading-relaxed">
                Chaque personne qui s'inscrit via ton lien te rapporte des points : clients, influenceur·euses, beauty pros.
              </p>
            </div>

            <div className="glassy rounded-2xl p-6 text-center">
              <div className="text-violet-300 text-5xl font-bold mb-4">3</div>
              <h3 className="text-xl font-bold mb-3">Tu débloques des récompenses</h3>
              <p className="text-slate-200/90 leading-relaxed">
                Badges, kits, accès VIP, coaching, tirage pour 3 500 € + iPhone 17 Pro pour le rang #1 au lancement.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION — Formulaire / module waitlist */}
        <section id="waitlist-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="glassy neon-blue rounded-2xl p-8 md:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">
              Prends ta place sur la Glow List maintenant
            </h2>
            <p className="text-sm sm:text-base text-slate-200/90 mb-6 text-center">
              Inscris-toi, reçois ton lien unique et commence à gagner des points. Chaque partage peut te rapprocher de l'iPhone 17 Pro ou des 3 500 € cash.
            </p>

            <form onSubmit={onSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="space-y-2">
                <p className="text-sm text-fuchsia-300 font-medium flex items-center gap-2">
                  💫 Ton blaze complet
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Prénom"
                    className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-400"
                  />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nom"
                    className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ton email"
                  className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-400"
                />
                <PhoneInputBelgiumDark
                  value={phone}
                  onChange={setPhone}
                  required={true}
                />
              </div>

              {phone && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConsentSMS((v) => !v)}
                      className={clsx(
                        "flex-1 rounded-xl px-4 py-2 text-sm font-medium border transition-colors",
                        consentSMS ? "bg-blue-600 border-blue-500" : "bg-slate-800 border-white/10"
                      )}
                      aria-pressed={consentSMS}
                    >
                      {consentSMS ? "✓ Recevoir un SMS de vérification" : "Sans SMS"}
                    </button>
                  </div>

                  {consentSMS && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!phone || smsState === "sending" || smsState === "sent" || smsState === "verified"}
                        onClick={sendSmsCode}
                        className={clsx(
                          "rounded-xl px-4 py-2 text-sm font-medium border",
                          !phone || smsState === "sent" || smsState === "verified"
                            ? "bg-slate-800 border-white/10 opacity-50 cursor-not-allowed"
                            : "bg-slate-900/60 border-white/10 hover:border-white/20"
                        )}
                      >
                        {smsState === "sending" ? "Envoi…" : smsState === "sent" || smsState === "verified" ? "Code envoyé ✓" : "Envoyer le code"}
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value)}
                        placeholder="Code 6 chiffres"
                        className="flex-1 bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-400"
                      />
                      <button
                        type="button"
                        disabled={!smsCode || smsState === "verifying" || (!devSkipSms && consentSMS && smsRemaining === 0)}
                        onClick={verifySmsCode}
                        className={clsx(
                          "rounded-xl px-4 py-2 text-sm font-medium border",
                          !smsCode ? "bg-slate-800 border-white/10 opacity-50" : "bg-slate-900/60 border-white/10 hover:border-white/20"
                        )}
                      >
                        {smsState === "verifying" ? "Vérif…" : "Vérifier"}
                      </button>
                    </div>
                  )}

                  {consentSMS && (
                    <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                      <span>Vérification SMS {devSkipSms ? "(mode dev)" : "(expire dans 2 min)"}.</span>
                      {!devSkipSms && smsState === "sent" && (
                        <span className="text-amber-300 font-mono">⏱ {String(smsMin).padStart(2, "0")}:{String(smsSec).padStart(2, "0")}</span>
                      )}
                      {smsState === "expired" && <span className="text-rose-300">Expiré — renvoyer le code.</span>}
                      {smsState === "error" && <span className="text-rose-300">Erreur — réessaye.</span>}
                      {smsState === "verified" && <span className="text-emerald-300 font-medium">Numéro vérifié ✅</span>}
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm text-slate-300 mb-2">Je suis :</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "client" as const, label: "Client.e", emoji: "✨" },
                    { key: "influencer" as const, label: "Influenceur.euse", emoji: "📸" },
                    { key: "pro" as const, label: "Beauty Pro", emoji: "💅" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setRole(opt.key)}
                      className={clsx(
                        "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                        role === opt.key
                          ? "border-amber-300 bg-amber-300/20 text-amber-300"
                          : "border-white/10 bg-slate-900/60 hover:border-white/20"
                      )}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <p className="text-sm text-fuchsia-300 font-medium">
                  🧮 Question d'habileté (obligatoire en Belgique)
                </p>
                <p className="text-sm text-slate-300 mb-2">
                  Combien fait <strong>8 × 4</strong> ?
                </p>
                <input
                  type="number"
                  required
                  value={skillAnswer}
                  onChange={(e) => setSkillAnswer(e.target.value)}
                  placeholder="Votre réponse"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-400"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="consent-gdpr"
                  required
                  checked={consentGDPR}
                  onChange={(e) => setConsentGDPR(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/10 bg-slate-900/60 text-fuchsia-600 focus:ring-2 focus:ring-fuchsia-400"
                />
                <label htmlFor="consent-gdpr" className="text-xs text-slate-300 cursor-pointer">
                  J'accepte la politique de confidentialité d'Afroé et confirme que mes réponses sont exactes. *
                </label>
              </div>

              <button
                type="submit"
                disabled={submit === "loading" || !canSubmit}
                className="w-full bg-gradient-to-r from-fuchsia-600 via-violet-600 to-amber-500 hover:brightness-110 rounded-xl px-6 py-4 text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)]"
              >
                {submit === "loading" ? "On te place dans la Glow List…" : submit === "done" ? "C'est validé — check ton email ✨" : "Participer au concours ✨"}
              </button>

              <p className="text-xs text-slate-400 text-center">
                On t'enverra le top départ par email{consentSMS && " / SMS"}. Tu peux te désinscrire à tout moment. Zéro spam. Tes données sont sécurisées (RGPD).
              </p>
            </form>
          </div>
        </section>

        {/* SECTION — Système de points */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Système de points</h2>
          <p className="text-base sm:text-lg text-slate-200/90 mb-10 text-center max-w-3xl mx-auto">
            Gagne des points avant et après le lancement. Les points finaux sont validés au lancement (téléchargements clients, inscriptions pros, influenceur·euses éligibles).
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="glassy neon-blue rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-blue-300">Avant le lancement (waitlist)</h3>
              <ul className="space-y-3 text-sm sm:text-base text-slate-200/90">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <span className="font-semibold">Cliente</span> : +2 pts (inscription waitlist)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📸</span>
                  <div>
                    <span className="font-semibold">Influenceur·euse</span> (&gt; 2k followers) : +15 pts
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">💅</span>
                  <div>
                    <span className="font-semibold">Beauty Pro</span> : +25 pts (inscription waitlist)
                  </div>
                </li>
              </ul>
            </div>

            <div className="glassy neon-fuchsia rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-fuchsia-300">Après le lancement (app live)</h3>
              <ul className="space-y-3 text-sm sm:text-base text-slate-200/90">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <span className="font-semibold">Cliente</span> : +10 pts (téléchargement app)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📸</span>
                  <div>
                    <span className="font-semibold">Influenceur·euse</span> (&gt; 2k followers) : +50 pts
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">💅</span>
                  <div>
                    <span className="font-semibold">Beauty Pro</span> : +100 pts (inscription validée)
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION — Récompenses par étapes */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center">Récompenses par étapes</h2>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="glassy rounded-2xl p-6 border-2 border-emerald-500/30">
              <h3 className="text-xl font-bold mb-2 text-emerald-300">Glow Starters — 10 pts</h3>
              <p className="text-slate-200/90 mb-4 text-sm">Pour tes 3 premiers parrainages.</p>
              <ul className="space-y-2 text-sm text-slate-200/90">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span> Badge Glow Starter officiel
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span> Mise en avant sur le classement
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span> -10% sur ta 1ère réservation
                </li>
              </ul>
            </div>

            <div className="glassy rounded-2xl p-6 border-2 border-sky-500/30">
              <h3 className="text-xl font-bold mb-2 text-sky-300">Glow Circle Insiders — 50 pts</h3>
              <p className="text-slate-200/90 mb-4 text-sm">Pour les gens qui rassemblent leur équipe.</p>
              <ul className="space-y-2 text-sm text-slate-200/90">
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span> Accès VIP à la bêta Afroé
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span> Shoutout IG dans "Glow Ambassadors"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span> -20% sur ta 1ère réservation
                </li>
              </ul>
            </div>

            <div className="glassy rounded-2xl p-6 border-2 border-violet-500/30">
              <h3 className="text-xl font-bold mb-2 text-violet-300">Glow Icons — 100 pts</h3>
              <p className="text-slate-200/90 mb-4 text-sm">Pour les glow-getters sérieux.</p>
              <ul className="space-y-2 text-sm text-slate-200/90">
                <li className="flex items-start gap-2">
                  <span className="text-violet-400">✓</span> Glow Kit édition limitée
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-400">✓</span> Session stratégie 1-on-1
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-400">✓</span> -20% sur ta 1ère réservation
                </li>
              </ul>
            </div>
          </div>

          {/* Tier secret */}
          <div className="glassy neon-gold rounded-2xl p-8 border-2 border-amber-500/40 text-center">
            <h3 className="text-2xl font-bold mb-3 text-amber-300">Tier Secret — 200 pts +</h3>
            <p className="text-base sm:text-lg text-slate-200/90 max-w-2xl mx-auto">
              Un tier exclusif se débloque à 200 points. Atteins 200 pts pour découvrir les récompenses ultra-premium réservées aux plus engagés. 👀
            </p>
          </div>
        </section>

        {/* SECTION — Grand Prix */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glassy neon-gold rounded-2xl p-8 md:p-10 border-2 border-amber-500/40">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Grand Prix de lancement</h2>
            <ul className="text-base sm:text-lg text-slate-200/90 space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <span className="font-bold text-amber-300">3 500 €</span> — tirage au sort pour tout·e participant·e avec <span className="font-semibold">100 pts ou plus</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <span className="font-bold text-amber-300">iPhone 17 Pro</span> — pour le <span className="font-semibold">rang #1</span> au lancement
                </div>
              </li>
            </ul>
            <p className="text-xs sm:text-sm text-slate-400 border-t border-white/10 pt-4">
              Points validés au lancement. Influenceur·euse éligible ≥ 2 000 followers. Un seul compte par personne. Fraude = exclusion définitive.
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-800 py-8 mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs sm:text-sm text-slate-400 space-y-2">
            <p className="font-medium">🔒 Cryptage SSL 256-bit — Conforme RGPD — Zéro spam garanti.</p>
            <p>© 2025 Afroé. Toutes les données sont sécurisées et protégées. Fais briller ta beauté Afro.</p>
            <p className="mt-2">
              <a href="/reglement" className="underline hover:text-white transition-colors">
                Règlement du concours
              </a>
            </p>
          </div>
        </footer>
      </main>
    </ErrorBoundary>
  );
}
