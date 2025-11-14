"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";

// ---- Global Error Boundary ----
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
            <pre className="text-[11px] bg-slate-900/80 border border-white/10 rounded p-3 overflow-auto">{String(this.state?.error?.message ?? this.state?.error ?? "")}</pre>
            <button className="mt-1 px-3 py-2 text-sm rounded-lg bg-slate-800 border border-white/10 hover:border-white/20" onClick={() => this.setState({ hasError: false, error: null })}>Réessayer</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// -------------------------------------------------
// Runtime-safe JS utilities
// -------------------------------------------------

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

interface Row {
  rank: number;
  name: string;
  invites: number;
  you?: boolean;
}

export function isRow(x: unknown): x is Row {
  return !!x && typeof x === "object" && "rank" in x && typeof (x as Row).rank === "number" && "name" in x && typeof (x as Row).name === "string" && "invites" in x && typeof (x as Row).invites === "number";
}

export function computeNextGoal(points: number): number {
  if (points < 50) return 50;
  if (points < 100) return 100;
  return points + 50;
}

export function markYou(rows: unknown[], myRank?: number): Row[] {
  if (!Array.isArray(rows)) return [];
  const clean = rows.filter(isRow);
  const isNum = typeof myRank === "number" && !Number.isNaN(myRank);
  return clean.map((r) => ({ ...r, you: isNum && r.rank === myRank }));
}

interface StatProps {
  label: string;
  value: string | number;
}

function Stat({ label, value }: StatProps): JSX.Element {
  return (
    <div className="glassy rounded-xl p-3 min-w-[120px] text-center">
      <div className="text-[11px] text-slate-300">{label}</div>
      <div className="text-xl font-semibold text-white mt-0.5">{value}</div>
    </div>
  );
}

interface ProgressProps {
  value: number;
  goal: number;
}

function Progress({ value, goal }: ProgressProps): JSX.Element {
  const pct = Math.min(100, Math.round((value / Math.max(1, goal)) * 100));
  const line = value === 0
    ? "Chaque glow commence par un partage."
    : pct < 50
    ? "On chauffe… continue."
    : pct < 80
    ? "Tu y es presque — ça brille."
    : pct < 100
    ? "Dernière ligne droite ✨"
    : "Objectif validé — respect.";
  return (
    <div>
      <div className="text-[11px] text-slate-300 mb-1">{line}</div>
      <div className="w-full h-2 glassy rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-fuchsia-500 to-blue-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[11px] text-slate-400 mt-1">{value}/{goal} pts</div>
    </div>
  );
}

interface LeaderboardProps {
  rows: Row[];
}

function Leaderboard({ rows }: LeaderboardProps): JSX.Element {
  const safeRows = Array.isArray(rows) ? rows.filter(isRow) : [];
  return (
    <div className="glassy rounded-2xl p-4 text-white">
      <div className="flex items-center gap-2 mb-3"><span className="text-fuchsia-400">🔥</span><h3 className="font-semibold">Classement des Glow Leaders</h3></div>
      <div className="space-y-2">
        {safeRows.map((r) => (
          <div key={`row-${r.rank}-${r.name}`} className={clsx(
            "flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10",
            r.rank <= 3 && "shadow-[0_0_16px_rgba(255,0,153,.35)]",
            r.you && "ring-1 ring-amber-300"
          )}>
            <div className="flex items-center gap-3">
              <span className="w-7 text-center">{r.rank <= 3 ? "👑" : r.rank}</span>
              <span className={clsx("text-sm", r.you && "font-semibold")}>{r.name}{r.you && " (toi)"}</span>
            </div>
            <div className="text-xs text-slate-300">{r.invites} pts</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-400">Chaque nom ici fait monter la beauté Afro. Tu te places où ? 👀</p>
    </div>
  );
}

function PrizeBanner(): JSX.Element {
  return (
    <div className="glassy neon-gold rounded-2xl p-4 md:p-5 text-white mt-4">
      <div className="flex items-center gap-3">
        <span className="text-amber-300 text-xl">🏆</span>
        <div>
          <div className="text-sm md:text-base font-semibold">Jusqu'à <span className="text-amber-300">3 500 €</span> à gagner</div>
          <div className="text-[12px] text-slate-200/90">Le/La #1 du classement remporte 3 500 €. Des récompenses sont débloquées à chaque étape.</div>
        </div>
      </div>
    </div>
  );
}

function Rewards(): JSX.Element {
  return (
    <div id="recompenses" className="glassy rounded-2xl p-5 text-white">
      <h3 className="font-semibold mb-1">Récompenses par étapes</h3>
      <p className="text-[12px] text-slate-300 mb-2">Chaque étape débloque une récompense exclusive — plus tu partages, plus tu montes dans le classement. Voici comment ça marche :</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mt-4">
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-300">Étape 1</div><div className="text-2xl font-bold">10 pts</div><div className="text-[11px] text-slate-400">Badge Glow Starter & mise en avant waitlist</div></div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-300">Étape 2</div><div className="text-2xl font-bold">50 pts</div><div className="text-[11px] text-slate-400">Accès anticipé (VIP) + shoutout IG</div></div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-300">Étape 3</div><div className="text-2xl font-bold">100 pts</div><div className="text-[11px] text-slate-400">Glow Kit édition limitée</div></div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 neon-gold"><div className="text-slate-300">Grand Prix</div><div className="text-2xl font-bold text-amber-300">3 500 €</div><div className="text-[11px] text-slate-200">#1 du classement au lancement</div></div>
      </div>
      <ul className="mt-4 text-[11px] text-slate-400 space-y-1 list-disc list-inside">
        <li>Points validés au lancement (téléchargements clients, inscriptions pros, influenceurs éligibles).</li>
        <li>Influenceur.euse éligible : &ge; 2 000 followers.</li>
        <li>Un seul compte par personne. Fraude = exclusion.</li>
      </ul>
    </div>
  );
}

const LAUNCH_TARGET = new Date("2025-12-15T12:00:00+01:00").toISOString();

interface CountdownProps {
  target?: string;
}

function Countdown({ target = LAUNCH_TARGET }: CountdownProps): JSX.Element {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const end = new Date(target).getTime();
    const tick = () => setDiff(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-slate-800 border border-white/10">⏳ J-{d} {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</span>
  );
}

// -------------------------------------------------
// Main Component (null-safe) + SMS verification + Sheets hook
// -------------------------------------------------

interface MeData {
  name: string;
  refCode: string;
  points: number;
  rank: number;
}

type RoleType = "client" | "pro" | "influencer" | null;
type SubmitState = "idle" | "loading" | "done" | "error";
type SmsState = "idle" | "sending" | "sent" | "verifying" | "verified" | "expired" | "error";

export default function AfroeAlternativeLanding(): JSX.Element {
  const initialMe: MeData = { name: "Toi", refCode: "", points: 0, rank: NaN };

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<RoleType>(null);
  const [consentSMS, setConsentSMS] = useState<boolean>(true);
  const [me, setMe] = useState<MeData>(initialMe);
  const [rows, setRows] = useState<Row[]>([]);
  const [submit, setSubmit] = useState<SubmitState>("idle");

  const [devSkipSms, setDevSkipSms] = useState<boolean>(false);
  useEffect(() => {
    try { const sp = new URLSearchParams(window.location.search); setDevSkipSms(sp.get("dev") === "1"); } catch {}
  }, []);

  const [smsState, setSmsState] = useState<SmsState>("idle");
  const [smsCode, setSmsCode] = useState<string>("");
  const [smsExpiresAt, setSmsExpiresAt] = useState<number | null>(null);
  const [smsRequestId, setSmsRequestId] = useState<string | null>(null);
  const [phoneOwnerConflict, setPhoneOwnerConflict] = useState<boolean>(false);
  const [phoneOwnerHint, setPhoneOwnerHint] = useState<string | null>(null);
  const smsRemaining = useMemo(() => { if (!smsExpiresAt) return 0; return Math.max(0, smsExpiresAt - Date.now()); }, [smsExpiresAt, smsState]);
  const smsMin = Math.floor(smsRemaining / 60000);
  const smsSec = Math.floor((smsRemaining % 60000) / 1000);

  const refLink = me.refCode ? `https://afroe.com/waitlist?ref=${me.refCode}` : "";
  const nextGoal = computeNextGoal(typeof me.points === "number" ? me.points : 0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const meRes = await fetch("/api/referral/me", { cache: "no-store" });
        if (meRes.ok) {
          const d = await meRes.json() as { userName?: string; refCode?: string; invites?: number; rank?: number };
          if (mounted && d) {
            setMe({ name: d.userName || "Toi", refCode: d.refCode || "", points: Number(d.invites ?? 0), rank: Number(d.rank ?? 9999) });
          }
        }
      } catch {}
      try {
        const lb = await fetch("/api/leaderboard", { cache: "no-store" });
        if (lb.ok) { const d = await lb.json() as { rows?: Row[] }; if (mounted && Array.isArray(d?.rows)) setRows(d.rows); }
      } catch {}
    })();
    const id = setInterval(async () => {
      try { const lb = await fetch("/api/leaderboard", { cache: "no-store" }); if (lb.ok) { const d = await lb.json() as { rows?: Row[] }; if (mounted && Array.isArray(d?.rows)) setRows(d.rows); } } catch {}
    }, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const boardRows = useMemo(() => markYou(rows, Number.isFinite(me.rank) ? me.rank : undefined), [rows, me.rank]);

  const shareMessage = "Rejoins Afroé, la plateforme beauté afro qui change le game ! 🔥";
  const shareLinks = useMemo(() => {
    const msg = encodeURIComponent(shareMessage);
    const link = encodeURIComponent(refLink || "https://afroe.com/waitlist");
    const full = encodeURIComponent(`${shareMessage} ${refLink || "https://afroe.com/waitlist"}`);
    return {
      whatsapp: `https://wa.me/?text=${full}`,
      email: `mailto:?subject=${encodeURIComponent("Rejoins Afroé")}&body=${full}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${link}`,
    };
  }, [refLink]);

  function shareToInstagram(): void {
    alert("Instagram ne supporte pas le partage direct de liens. Copie ton lien et partage-le dans ta story ou bio !");
    if (refLink && navigator.clipboard) {
      navigator.clipboard.writeText(refLink).catch(() => {});
    }
  }

  function shareToTikTok(): void {
    alert("TikTok ne supporte pas le partage direct de liens. Copie ton lien et ajoute-le à ta bio ou vidéo !");
    if (refLink && navigator.clipboard) {
      navigator.clipboard.writeText(refLink).catch(() => {});
    }
  }

  async function sendSmsCode(): Promise<void> {
    if (!phone) return;
    setSmsState("sending");
    setPhoneOwnerConflict(false);
    setPhoneOwnerHint(null);

    try {
      const payload = { phone: phone.trim(), email: email.trim() || null, role, ref: me?.refCode || null };
      const res = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.warn("send-sms failed", body);
        setSmsState("error");
        return;
      }

      setSmsRequestId(body.requestId ?? null);
      setSmsExpiresAt(body.expiresAt ? Number(body.expiresAt) : Date.now() + 2 * 60 * 1000);
      setSmsState("sent");

      if (body.linkedElsewhere) {
        setPhoneOwnerConflict(true);
        setPhoneOwnerHint(body.ownerHint ?? null);
      }
    } catch (err) {
      console.error("sendSmsCode error", err);
      setSmsState("error");
    }
  }

  async function verifySmsCode(): Promise<void> {
    if (!phone || !smsCode) return;
    setSmsState("verifying");
    try {
      const payload = { phone: phone.trim(), code: smsCode.trim(), requestId: smsRequestId ?? undefined };
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body.verified) {
        console.warn("verify failed", body);
        setSmsState(body.expired ? "expired" : "error");
        return;
      }

      if (body.ownerMatch === "different") {
        setSmsState("error");
        setPhoneOwnerConflict(true);
        setPhoneOwnerHint(body.ownerHint ?? null);
        return;
      }

      setSmsState("verified");
      setPhoneOwnerConflict(false);
      setPhoneOwnerHint(body.ownerHint ?? null);
    } catch (err) {
      console.error("verifySmsCode error", err);
      setSmsState("error");
    }
  }

  const canSubmit = useMemo(() => {
    const nameOk = fullName.trim().length > 0;
    const emailOk = email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const roleOk = !!role;
    const phoneOk = !consentSMS || phone.trim().length > 0;
    const smsOk = !consentSMS || devSkipSms || smsState === "verified";
    const noConflict = !phoneOwnerConflict;
    return nameOk && emailOk && roleOk && phoneOk && smsOk && noConflict;
  }, [fullName, email, role, phone, consentSMS, devSkipSms, smsState, phoneOwnerConflict]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmit("loading");
    try {
      const res = await fetch("/api/waitlist/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), name: fullName.trim(), phone: phone.trim(), role, sms: consentSMS, smsVerified: smsState === "verified" }) });
      if (!res.ok) throw new Error("signup failed");
      try {
        await fetch("/api/save-lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ timestamp: new Date().toISOString(), email: email.trim(), name: fullName.trim(), phone: phone.trim(), role, referralCode: me.refCode || null, status: "subscribed", source: "landing" }) });
      } catch {}
      setSubmit("done");
    } catch { setSubmit("error"); }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white vignette-bg">
        <header className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="inline-flex items-center gap-3 glassy rounded-2xl px-4 py-3 border border-white/10">
            <Image src="/images/Afroé-1760191941241.jpg" alt="Afroé Logo" width={50} height={50} className="rounded-lg" priority />
            <span className="text-xl font-bold bg-gradient-to-r from-white via-fuchsia-200 to-fuchsia-400 bg-clip-text text-transparent">Afroé</span>
          </div>
        </header>
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          <div className="flex flex-col items-center justify-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-center mb-4">
              Ton Style, Ton Impact, <span className="bg-gradient-to-r from-blue-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Ton Futur</span>.
            </h1>
            <p className="text-lg md:text-xl text-center mb-6 max-w-3xl mx-auto px-4" style={{ color: '#E5E5E5' }}>
              Afroé, l'app qui connecte les pros et les passionné·es de la beauté Afro, à domicile ou en salon.
            </p>
            <PrizeBanner />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start max-w-7xl mx-auto">
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-6 md:gap-8">
                <div className="pt-2">
                  <Image
                    src="/images/LOGOAfroé (1).jpg"
                    alt="Logo Afroé – beauté et culture afro-européenne"
                    width={100}
                    height={100}
                    className="rounded-2xl w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-cover shadow-[0_0_25px_rgba(59,130,246,0.4),0_0_50px_rgba(217,70,239,0.25),0_4px_15px_rgba(0,0,0,0.5)]"
                    priority
                  />
                </div>
                <div className="w-full">
                  <Image src="/images/Lucid_Origin_Core_Description_for_all_versionsA_cinematic_phot_1.jpg" alt="Visuel Afroé Glow — beauté Afro moderne" width={600} height={600} className="rounded-2xl shadow-[0_0_30px_rgba(255,0,153,.25)] mx-auto object-cover aspect-square" />
                </div>
              </div>

              <div className="space-y-2 text-slate-200">
                <p>T'as galéré à trouver un coiffeur.se Afro qui capte ton style ?</p>
                <p>Ou t'es pro — <span className="text-slate-100">coiffeur.se, barbier, maquilleur.se, ongliste, esthéticien.ne</span> — et t'en as marre qu'on te prenne pas au sérieux ?</p>
                <p>Afroé comprend les deux côtés du miroir 💅🏾💈</p>
              </div>

              <div className="text-slate-100">
                <p className="font-medium">Et si la beauté Afro devenait enfin visible, pro et stylée ?</p>
                <p>Et si c'était toi, le/la prochain <span className="text-amber-300">Glow Leader</span> ? 👑</p>
              </div>

              <div className="text-slate-300">
                <p>Afroé, c'est la vibe et la structure qu'il manquait.</p>
                <p>Parce que la beauté Afro, c'est pas une tendance. C'est notre héritage, notre fierté, notre excellence.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glassy neon-gold rounded-2xl p-5 md:p-6 border-2 border-amber-300/30">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🎯</div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-amber-300 mb-2">Inscris-toi sur la liste d'attente exclusive</h2>
                    <p className="text-slate-200 text-sm md:text-base">Rejoins la waitlist Afroé et participe au concours de lancement. Partage ton lien unique, grimpe dans le classement et gagne jusqu'à <span className="font-bold text-amber-300">3 500 €</span> + des récompenses exclusives !</p>
                  </div>
                </div>
              </div>

              <form onSubmit={onSubmit} className="glassy neon-blue rounded-2xl p-4 md:p-5 space-y-4">
              <div className="space-y-2">
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ton blaze complet 💫 (prénom + nom)" className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-fuchsia-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-fuchsia-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input type="tel" required={consentSMS} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={consentSMS ? "Numéro de téléphone" : "Numéro de téléphone (optionnel)"} className="bg-slate-900/60 border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-fuchsia-400" />
                <button type="button" onClick={() => setConsentSMS((v) => !v)} className={clsx("rounded-xl px-4 py-3 text-sm font-medium border", consentSMS ? "bg-blue-600 border-blue-500" : "bg-slate-800 border-white/10")} aria-pressed={consentSMS}>{consentSMS ? "Vérifier par SMS" : "Sans SMS"}</button>
              </div>
              {consentSMS && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <button type="button" disabled={!phone || smsState === "sending" || smsState === "sent" || smsState === "verified"} onClick={sendSmsCode} className={clsx("rounded-xl px-3 py-3 text-sm font-medium border", !phone ? "bg-slate-800 border-white/10 opacity-50" : "bg-slate-900/60 border-white/10 hover:border-white/20")}>{smsState === "sending" ? "Envoi…" : smsState === "sent" ? "Code envoyé" : smsState === "verified" ? "Vérifié ✅" : "Recevoir code"}</button>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={smsCode} onChange={(e) => setSmsCode(e.target.value)} placeholder="Code SMS" className="bg-slate-900/60 border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-fuchsia-400" />
                  <button type="button" disabled={!smsCode || smsState === "verifying" || (!devSkipSms && smsRemaining === 0)} onClick={verifySmsCode} className={clsx("rounded-xl px-3 py-3 text-sm font-medium border", !smsCode ? "bg-slate-800 border-white/10 opacity-50" : "bg-slate-900/60 border-white/10 hover:border-white/20")}>{smsState === "verifying" ? "Vérif…" : "Vérifier"}</button>
                </div>
              )}
              {consentSMS && (
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                    <span>Vérification SMS requise {devSkipSms ? "(mode dev)" : "(2 min)"}.</span>
                    {!devSkipSms && smsState === "sent" && (<span className="text-amber-300">⏱ {String(smsMin).padStart(2, "0")}:{String(smsSec).padStart(2, "0")}</span>)}
                    {smsState === "expired" && <span className="text-rose-300">Expiré — renvoyer le code.</span>}
                    {smsState === "error" && !phoneOwnerConflict && <span className="text-rose-300">Erreur — réessaye.</span>}
                    {smsState === "verified" && <span className="text-emerald-300">Numéro vérifié ✅</span>}
                  </div>
                  {phoneOwnerConflict && (
                    <div className="bg-rose-900/20 border border-rose-500/30 rounded-xl p-3">
                      <div className="text-rose-300 text-sm font-medium mb-1">⚠️ Numéro déjà utilisé</div>
                      <p className="text-[11px] text-rose-200">Ce numéro est déjà lié à un autre compte. Si c'est votre numéro, contactez support@afroe.com pour assistance.</p>
                      {phoneOwnerHint && <p className="text-[11px] text-rose-300 mt-1">Numéro lié à : {phoneOwnerHint}</p>}
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="text-[11px] text-slate-300 mb-2">Je suis :</div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: "client" as const, label: "Client.e" },
                    { key: "influencer" as const, label: "Influenceur.euse" },
                    { key: "pro" as const, label: "Beauty Pro" },
                  ] as const).map((opt) => (
                    <button key={opt.key} type="button" onClick={() => setRole(opt.key)} className={clsx("px-4 py-2 rounded-xl border text-sm font-medium", role === opt.key ? "border-amber-300 bg-amber-300/10 text-amber-300" : "border-white/10 bg-slate-900/60 hover:border-white/20")}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={submit === "loading" || !canSubmit} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60 transition-colors">{submit === "loading" ? "On te place…" : submit === "done" ? "C'est validé ✨" : "Prends ta place ✨"}</button>
              {submit === "error" && <p className="text-rose-300 text-sm text-center">Une erreur s'est produite. Réessaye dans quelques secondes.</p>}
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400 text-center">On t'enverra le top départ par email {consentSMS && "et SMS"}. Tu peux te désinscrire à tout moment.</p>
                {consentSMS && (
                  <div className="bg-slate-900/40 border border-white/10 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      🔒 <span className="font-medium text-slate-300">Confidentialité & RGPD</span> : Ton numéro est hashé et stocké de manière sécurisée. On l'utilise uniquement pour la vérification SMS et la prévention de fraude. Tu peux demander sa suppression à tout moment via <a href="mailto:privacy@afroe.com" className="text-fuchsia-400 hover:underline">privacy@afroe.com</a>. En validant, tu acceptes notre traitement de tes données conformément au RGPD.
                    </p>
                  </div>
                )}
              </div>
            </form>

            <div className="mt-6 glassy neon-fuchsia rounded-2xl p-5 md:p-6 border-2 border-fuchsia-400/30">
              <div className="text-center space-y-4">
                <h3 className="text-xl md:text-2xl font-bold text-white">Invite tes amis, grimpe dans le classement et tente ta chance de gagner 3 500 € CASH!</h3>
                <p className="text-slate-200 text-sm md:text-base">Dès que tu t'inscris, tu reçois ton lien unique. Partage-le pour gagner des points et débloquer des récompenses exclusives.</p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button onClick={() => window.open(shareLinks.whatsapp, "_blank")} className="glassy rounded-xl px-5 py-3 font-medium text-sm hover:scale-105 transition-transform border border-white/20 flex items-center gap-2">
                    <span>💬</span> WhatsApp
                  </button>
                  <button onClick={() => window.location.href = shareLinks.email} className="glassy rounded-xl px-5 py-3 font-medium text-sm hover:scale-105 transition-transform border border-white/20 flex items-center gap-2">
                    <span>📧</span> Email
                  </button>
                  <button onClick={shareToInstagram} className="glassy rounded-xl px-5 py-3 font-medium text-sm hover:scale-105 transition-transform border border-white/20 flex items-center gap-2">
                    <span>📷</span> Instagram
                  </button>
                  <button onClick={shareToTikTok} className="glassy rounded-xl px-5 py-3 font-medium text-sm hover:scale-105 transition-transform border border-white/20 flex items-center gap-2">
                    <span>🎵</span> TikTok
                  </button>
                  <button onClick={() => window.open(shareLinks.linkedin, "_blank")} className="glassy rounded-xl px-5 py-3 font-medium text-sm hover:scale-105 transition-transform border border-white/20 flex items-center gap-2">
                    <span>💼</span> LinkedIn
                  </button>
                </div>
                <p className="text-xs text-slate-300 pt-2">⚡ Partage dès maintenant et prends de l'avance sur le classement</p>
              </div>
            </div>

            <div className="mt-5 text-slate-200"><p className="font-medium">🔥 200+ Afro lovers ont déjà rejoint la Glow List. Rejoins le crew avant le top départ.</p></div>

            <div className="mt-6 flex flex-wrap gap-2 items-center">
              <Stat label="Ton rang" value={Number.isFinite(me.rank) ? `#${me.rank}` : "—"} />
              <Stat label="Tes points" value={typeof me.points === "number" ? me.points : 0} />
              <div className="min-w-[220px] grow"><Progress value={typeof me.points === "number" ? me.points : 0} goal={nextGoal} /></div>
            </div>
            </div>
          </div>

          <div className="relative w-full lg:justify-self-end mt-10 lg:mt-0">
            <div className="mx-auto lg:mx-0 w-[320px] h-[640px] rounded-[36px] border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_0_40px_rgba(59,130,246,.25)] p-2">
              <div className="w-full h-full rounded-[28px] overflow-hidden bg-slate-950">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <span className="text-sm font-semibold">Afroé</span>
                  <span className="text-[11px] text-slate-400">Glow Hub</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-xs text-slate-300">Ton lien</div>
                  <div className="text-[11px] bg-slate-900/70 border border-white/10 rounded-lg px-2 py-2 break-all select-all">{refLink || "https://afroe.com/waitlist?ref=ton-code"}</div>
                  <div className="grid grid-cols-5 gap-2 text-[11px]">
                    <button onClick={() => window.open(shareLinks.whatsapp, "_blank")} className="glassy rounded-lg py-2 hover:bg-white/10 transition-colors">WhatsApp</button>
                    <button onClick={() => window.location.href = shareLinks.email} className="glassy rounded-lg py-2 hover:bg-white/10 transition-colors">Email</button>
                    <button onClick={shareToInstagram} className="glassy rounded-lg py-2 hover:bg-white/10 transition-colors">Insta</button>
                    <button onClick={shareToTikTok} className="glassy rounded-lg py-2 hover:bg-white/10 transition-colors">TikTok</button>
                    <button onClick={() => window.open(shareLinks.linkedin, "_blank")} className="glassy rounded-lg py-2 hover:bg-white/10 transition-colors">LinkedIn</button>
                  </div>

                  <div className="mt-2 text-xs text-slate-300">Classement</div>
                  <div className="space-y-2">
                    {(boardRows.length ? boardRows.slice(0, 4) : [
                      { rank: 1, name: "Aïcha", invites: 63 },
                      { rank: 2, name: "Malik", invites: 49 },
                      { rank: 3, name: "Kenya", invites: 41 },
                      { rank: 12, name: me.name, invites: typeof me.points === "number" ? me.points : 3, you: true },
                    ]).filter(isRow).map((r) => (
                      <div key={`mrow-${r.rank}-${r.name}`} className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-lg px-2 py-1.5">
                        <span className="text-[11px]">{r.rank <= 3 ? "👑" : r.rank} {r.name}{r.you && " (toi)"}</span>
                        <span className="text-[11px] text-slate-300">{r.invites} pts</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3">
                    <div className="text-xs font-medium">Comment ça marche</div>
                    <ul className="mt-1 text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                      <li>Partage ton lien unique.</li>
                      <li>+10 pts si un client télécharge l'app.</li>
                      <li>+50 pts si un Beauty Pro s'inscrit.</li>
                      <li>+100 pts si un influenceur (&gt;2k followers) rejoint.</li>
                    </ul>
                  </div>

                  <p className="mt-2 text-sm md:text-base text-center opacity-90" style={{ color: '#E5E5E5' }}>
                    Chaque nom ici fait monter la beauté Afro. Tu te places où ? 👀
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -inset-6 -z-10 blur-3xl opacity-40 bg-gradient-to-br from-fuchsia-600/40 to-blue-600/30 rounded-full" />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
          <div className="space-y-3">
            <div className="glassy rounded-2xl p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Système de points</h3>
                  <span className="text-[11px] inline-flex items-center gap-1 text-amber-300 bg-amber-400/10 border border-amber-300/30 px-2 py-0.5 rounded-md">⚠️ dès le lancement prévu mi‑décembre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-200/90 bg-amber-400/10 border border-amber-300/30 text-amber-300 px-2 py-1 rounded-lg">Objectif : 3 500 €</div>
                  <Countdown />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-300">Client.e</div><div className="text-2xl font-bold">+10</div><div className="text-[11px] text-slate-400">Téléchargement de l'app</div></div>
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-300">Beauty Pro</div><div className="text-2xl font-bold">+50</div><div className="text-[11px] text-slate-400">Inscription validée</div></div>
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-300">Influenceur.euse</div><div className="text-2xl font-bold">+100</div><div className="text-[11px] text-slate-400">&ge; 2 000 followers</div></div>
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-300">Bonus Lancement</div><div className="text-2xl font-bold">x2</div><div className="text-[11px] text-slate-400">Téléchargements & inscriptions le jour J</div></div>
              </div>
              <p className="text-[12px] text-slate-400 mt-3">Les points finaux sont validés au lancement (téléchargements clients, inscriptions pros, influenceurs éligibles).</p>
            </div>

            <Rewards />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
          <div className="glassy neon-fuchsia rounded-2xl p-6 md:p-8 text-white text-center">
            <p className="text-lg md:text-xl font-semibold">Tu ne vends pas. Tu rayonnes.</p>
            <p className="text-slate-200 mt-2">Afroé — ton art, ta réussite, ton indépendance. Ton cercle = ton pouvoir. Let's glow. ✨</p>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}

if (process.env.NODE_ENV === "development") {
  const tests = [ { in: 0, exp: 50 }, { in: 10, exp: 50 }, { in: 49, exp: 50 }, { in: 50, exp: 100 }, { in: 80, exp: 100 }, { in: 100, exp: 150 }, { in: 130, exp: 180 } ];
  tests.forEach((t) => { const got = computeNextGoal(t.in); if (got !== t.exp) console.warn("computeNextGoal test failed", t, "got=", got); });

  const neCases = [undefined, null, "boom", { a: 1 }, new Error("x")];
  neCases.forEach((c) => { const e = normalizeError(c); if (!(e instanceof Error)) console.warn("normalizeError failed for", c); });

  const ebNull = ErrorBoundary.getDerivedStateFromError && ErrorBoundary.getDerivedStateFromError(null);
  if (!ebNull || ebNull.hasError !== false || ebNull.error !== null) console.warn("EB derive (null) failed", ebNull);
  const ebStr = ErrorBoundary.getDerivedStateFromError && ErrorBoundary.getDerivedStateFromError("kaput");
  if (!ebStr || ebStr.hasError !== true || !(ebStr.error instanceof Error)) console.warn("EB derive (string) failed", ebStr);

  const clsxOut = clsx("a", null, false, "b", ["c", [null, "d"]], { e: 1, f: 0 }, { g: true });
  if (clsxOut !== "a b c d e g") console.warn("clsx test failed", clsxOut);

  const bads = [null, undefined, {}, { rank: "1" }, { rank: 1, name: 2, invites: 0 }];
  if (bads.some(isRow)) console.warn("isRow incorrectly accepting bad rows");
  const good = { rank: 1, name: "X", invites: 10 };
  if (!isRow(good)) console.warn("isRow failed on good row");

  const sampleRows = [ { rank: 1, name: "A", invites: 10 }, null, { rank: 2, name: "B", invites: 9 }, undefined ];
  const marked = markYou(sampleRows, 2);
  if (marked.length !== 2 || !marked[1].you || marked[0].you) console.warn("markYou test failed", marked);
  const markedNone = markYou(sampleRows, undefined);
  if (markedNone.some((r) => r.you)) console.warn("markYou test (undefined) failed", markedNone);

  const initialMe = { name: "Toi", refCode: "", points: 0, rank: NaN };
  if (initialMe == null || typeof initialMe !== "object") console.warn("initialMe not object");
  if (typeof initialMe.points !== "number") console.warn("initialMe.points not number");
}
