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
            <p className="text-slate-100 text-sm">On a capté l'erreur et on la loggue. Rafraîchis la page. Si ça persiste, envoie-moi la dernière action.</p>
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
  phoneVerified?: boolean;
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
      <div className="text-[11px] text-slate-100">{label}</div>
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
      <div className="text-[11px] text-slate-100 mb-1">{line}</div>
      <div className="w-full h-2 glassy rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-fuchsia-500 to-blue-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[11px] text-slate-100 mt-1">{value}/{goal} pts</div>
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
      <div className="flex items-center gap-2 mb-3"><span className="text-fuchsia-400" role="img" aria-label="tendance">🔥</span><h3 className="font-semibold">Classement des Glow Leaders</h3></div>
      <div className="space-y-2">
        {safeRows.map((r) => (
          <div key={`row-${r.rank}-${r.name}`} className={clsx(
            "flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10",
            r.rank <= 3 && "shadow-[0_0_16px_rgba(255,0,153,.35)]",
            r.you && "ring-1 ring-amber-300",
            !r.phoneVerified && r.invites >= 100 && "opacity-60"
          )}>
            <div className="flex items-center gap-3">
              <span className="w-7 text-center" aria-label={r.rank <= 3 ? `Top ${r.rank} position` : `Position ${r.rank}`}>{r.rank <= 3 ? <span role="img" aria-hidden="true">👑</span> : r.rank}</span>
              <div className="flex items-center gap-2">
                <span className={clsx("text-sm", r.you && "font-semibold")}>{r.name}{r.you && " (toi)"}</span>
                {r.phoneVerified && (
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30" title="Numéro vérifié">✓ Vérifié</span>
                )}
              </div>
            </div>
            <div className="text-xs text-slate-100">{r.invites} pts</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-200">Chaque nom ici fait monter la beauté Afro. Tu te places où ? <span role="img" aria-label="yeux scrutateurs">👀</span></p>
    </div>
  );
}

function PrizeBanner(): JSX.Element {
  return (
    <div className="glassy neon-gold rounded-2xl p-4 md:p-5 text-white mt-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-amber-300 text-xl">🏆</span>
          <div className="text-sm md:text-base font-semibold">Récompenses au lancement</div>
        </div>
        <div className="space-y-2 text-[12px] md:text-sm">
          <div className="flex items-start gap-2">
            <span className="text-amber-300">🥇</span>
            <div><span className="font-semibold text-amber-300">iPhone 17 Pro</span> — pour le rang #1 au lancement</div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-300">💸</span>
            <div><span className="font-semibold text-amber-300">€3,500</span> — tirage au sort parmi tous les participants ayant atteint 100 points ou plus</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Rewards(): JSX.Element {
  return (
    <div id="recompenses" className="glassy rounded-2xl p-5 text-white">
      <h3 className="font-semibold mb-1">Récompenses par étapes</h3>
      <p className="text-[12px] text-slate-100 mb-2">Chaque étape débloque une récompense exclusive — plus tu partages, plus tu montes dans le classement. Voici comment ça marche :</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mt-4">
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-100">Étape 1</div><div className="text-2xl font-bold">10 pts</div><div className="text-[11px] text-slate-200">Badge Glow Starter & mise en avant waitlist</div></div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-100">Étape 2</div><div className="text-2xl font-bold">50 pts</div><div className="text-[11px] text-slate-200">Accès anticipé (VIP) + shoutout IG</div></div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-100">Étape 3</div><div className="text-2xl font-bold">100 pts</div><div className="text-[11px] text-slate-200">Glow Kit édition limitée</div></div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 neon-gold">
          <div className="text-slate-100 mb-2">Grand Prix</div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-base">💸</span>
              <div className="text-[11px] leading-tight">
                <span className="text-amber-300 font-semibold">€3,500</span>
                <span className="text-slate-200"> — tirage au sort parmi tous les participants avec 100 pts ou plus</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base">🥇</span>
              <div className="text-[11px] leading-tight">
                <span className="text-amber-300 font-semibold">iPhone 17 Pro</span>
                <span className="text-slate-200"> — pour le rang #1 au lancement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ul className="mt-4 text-[11px] text-slate-200 space-y-1 list-disc list-inside">
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
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-slate-800 border border-white/10">Lancement dans : {d}j {String(h).padStart(2, "0")}h {String(m).padStart(2, "0")}m {String(s).padStart(2, "0")}s</span>
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
  phoneVerified?: boolean;
  userId?: string;
}

type RoleType = "client" | "pro" | "influencer" | null;
type SubmitState = "idle" | "loading" | "done" | "error";
type SmsState = "idle" | "checking" | "sending" | "sent" | "verifying" | "verified" | "expired" | "error";

export default function AfroeAlternativeLanding(): JSX.Element {
  const initialMe: MeData = { name: "Toi", refCode: "", points: 0, rank: NaN };

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneLocal, setPhoneLocal] = useState<string>("");
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
  const [smsCodeInputRef, setSmsCodeInputRef] = useState<HTMLInputElement | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [phoneError, setPhoneError] = useState<string>("");
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>("");
  const [formLoadTime] = useState<number>(Date.now());
  const [deviceFingerprint] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const nav = window.navigator;
    const screen = window.screen;
    const fp = `${nav.userAgent}-${screen.width}x${screen.height}-${screen.colorDepth}-${nav.language}`;
    return btoa(fp).substring(0, 32);
  });

  const [showVerificationBanner, setShowVerificationBanner] = useState<boolean>(false);
  const [verificationPhone, setVerificationPhone] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [verificationState, setVerificationState] = useState<"idle" | "sending" | "sent" | "verifying" | "success" | "error">("idle");
  const [verificationError, setVerificationError] = useState<string>("");

  useEffect(() => {
    if (me.userId && (me.points >= 100 || me.rank <= 10) && !me.phoneVerified) {
      setShowVerificationBanner(true);
    } else {
      setShowVerificationBanner(false);
    }
  }, [me.points, me.rank, me.phoneVerified, me.userId]);

  async function sendVerificationOtp(): Promise<void> {
    if (!verificationPhone || verificationPhone.length !== 9) {
      setVerificationError("Entre un numéro belge valide (9 chiffres)");
      return;
    }

    setVerificationState("sending");
    setVerificationError("");

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: "+32" + verificationPhone,
          userId: me.userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setVerificationState("sent");
    } catch (err: any) {
      setVerificationError(err.message || "Erreur lors de l'envoi du SMS");
      setVerificationState("error");
    }
  }

  async function verifyOtpCode(): Promise<void> {
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError("Entre le code à 6 chiffres");
      return;
    }

    setVerificationState("verifying");
    setVerificationError("");

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: "+32" + verificationPhone,
          code: verificationCode,
          userId: me.userId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Code invalide");
      }

      setVerificationState("success");
      setMe({ ...me, phoneVerified: true });
      setShowVerificationBanner(false);
    } catch (err: any) {
      setVerificationError(err.message || "Code invalide");
      setVerificationState("error");
    }
  }
  const smsRemaining = useMemo(() => { if (!smsExpiresAt) return 0; return Math.max(0, smsExpiresAt - Date.now()); }, [smsExpiresAt, smsState]);
  const smsMin = Math.floor(smsRemaining / 60000);
  const smsSec = Math.floor((smsRemaining % 60000) / 1000);

  const refLink = me.refCode ? `https://afroe.com/waitlist?ref=${me.refCode}` : "";
  const nextGoal = computeNextGoal(typeof me.points === "number" ? me.points : 0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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

  function getFullPhone(): string {
    return "+32" + phoneLocal.trim();
  }

  async function verifyPhoneAndSendCode(): Promise<void> {
    if (!phoneLocal || resendCooldown > 0) return;

    const belgianLocalRegex = /^\d{9}$/;
    const normalizedLocal = phoneLocal.trim();

    if (!belgianLocalRegex.test(normalizedLocal)) {
      setPhoneError("Numéro belge invalide. Tape 9 chiffres après +32, sans le 0.");
      return;
    }

    const normalizedPhone = getFullPhone();

    setPhoneError("");
    setGlobalError("");
    setSmsState("checking");
    setPhoneOwnerConflict(false);
    setPhoneOwnerHint(null);
    setSmsCode("");

    try {
      const res = await fetch("/api/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone }),
      });

      const body = await res.json().catch(() => ({}));

      if (!body.ok) {
        if (body.reason === "duplicate") {
          setPhoneError("Numéro déjà utilisé. Utilise un autre numéro.");
          setGlobalError("❌ Ce numéro existe déjà sur la Glow List.");
          setSmsState("idle");
          return;
        } else if (body.reason === "invalid") {
          setPhoneError("Numéro belge invalide. Format attendu : +32 suivi de 9 chiffres.");
          setGlobalError("❌ Numéro belge invalide.");
          setSmsState("idle");
          return;
        } else {
          setGlobalError("❌ Erreur lors de l'envoi du code. Réessaie.");
          setSmsState("error");
          return;
        }
      }

      setSmsRequestId(body.requestId ?? null);
      setSmsExpiresAt(body.expiresAt ? Number(body.expiresAt) : Date.now() + 2 * 60 * 1000);
      setSmsState("sent");
      setResendCooldown(60);

      setTimeout(() => {
        if (smsCodeInputRef) {
          smsCodeInputRef.focus();
        }
      }, 100);
    } catch (err) {
      console.error("verifyPhoneAndSendCode error", err);
      setGlobalError("❌ Erreur serveur. Réessaie plus tard.");
      setSmsState("error");
    }
  }

  async function verifySmsCode(code?: string): Promise<void> {
    const codeToVerify = code || smsCode;
    const fullPhone = getFullPhone();
    if (!fullPhone || !codeToVerify) return;
    setSmsState("verifying");
    try {
      const payload = { phone: fullPhone, code: codeToVerify.trim(), requestId: smsRequestId ?? undefined };
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
      setPhoneVerified(true);
      setPhoneOwnerConflict(false);
      setPhoneOwnerHint(body.ownerHint ?? null);
    } catch (err) {
      console.error("verifySmsCode error", err);
      setSmsState("error");
    }
  }

  function resetPhoneVerification(): void {
    setPhoneLocal("");
    setSmsCode("");
    setSmsState("idle");
    setPhoneVerified(false);
    setPhoneError("");
    setGlobalError("");
    setPhoneOwnerConflict(false);
    setPhoneOwnerHint(null);
    setSmsRequestId(null);
    setSmsExpiresAt(null);
    setResendCooldown(0);
  }

  function handleSmsCodeChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    setSmsCode(value);
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      verifySmsCode(value);
    }
  }

  const canSubmit = useMemo(() => {
    const firstNameOk = firstName.trim().length > 0;
    const lastNameOk = lastName.trim().length > 0;
    const emailOk = email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const roleOk = !!role;
    const phoneOk = !consentSMS || (phoneLocal.trim().length > 0 && phoneVerified);
    const smsOk = !consentSMS || devSkipSms || phoneVerified;
    const noConflict = !phoneOwnerConflict;
    return firstNameOk && lastNameOk && emailOk && roleOk && phoneOk && smsOk && noConflict;
  }, [firstName, lastName, email, role, phoneLocal, consentSMS, devSkipSms, phoneVerified, phoneOwnerConflict]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmit("loading");
    try {
      const fullPhone = getFullPhone();
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const formSubmitTime = Date.now();

      const signupPayload = {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: fullPhone,
        role,
        deviceFingerprint,
        formLoadTime,
        formSubmitTime,
      };

      const res = await fetch("/api/signup-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setGlobalError("❌ Inscription bloquée. Utilise une adresse email valide.");
        }
        throw new Error(data.error || "signup failed");
      }

      try {
        const sp = new URLSearchParams(window.location.search);
        const refCode = sp.get("ref");
        if (refCode && data.userId) {
          await fetch("/api/referral-track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              referralCode: refCode,
              userId: data.userId,
              deviceFingerprint,
            }),
          });
        }
      } catch (refError) {
        console.error("Referral tracking error:", refError);
      }

      try {
        await fetch("/api/save-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            email: email.trim(),
            name: fullName,
            phone: fullPhone,
            role,
            referralCode: data.referralCode || null,
            status: "subscribed",
            source: "landing",
          }),
        });
      } catch {}

      if (data.userId) {
        setMe({
          ...me,
          userId: data.userId,
          refCode: data.referralCode || "",
          phoneVerified: false,
        });
      }

      setSubmit("done");
    } catch (err) {
      console.error("Signup error:", err);
      setSubmit("error");
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white vignette-bg">
        <header className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="inline-flex items-center gap-3 glassy rounded-2xl px-4 py-3 border border-white/10">
            <span className="text-xl font-bold bg-gradient-to-r from-white via-fuchsia-200 to-fuchsia-400 bg-clip-text text-transparent">Afroé</span>
          </div>
        </header>

        {showVerificationBanner && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6">
            <div className="glassy border-2 border-amber-400/50 rounded-2xl p-4 md:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl" role="img" aria-label="Alerte importante">🚨</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Vérifie ton numéro pour rester éligible aux récompenses</h3>
                  <p className="text-sm text-slate-200 mb-4">Tu as atteint {me.points >= 100 ? "100+ points" : "le Top 10"} ! Pour participer au concours, vérifie ton numéro maintenant.</p>

                  {verificationState === "idle" && (
                    <div className="space-y-3">
                      <div className="flex">
                        <div className="flex items-center bg-slate-800 border border-white/10 border-r-0 rounded-l-xl px-3 py-2 text-sm text-slate-300">+32</div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={verificationPhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length <= 9) setVerificationPhone(val);
                          }}
                          placeholder="9 chiffres (sans le 0)"
                          className="flex-1 bg-slate-900/60 border border-white/10 rounded-r-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={sendVerificationOtp}
                        className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl px-6 py-2.5 text-sm"
                      >
                        Vérifier par SMS
                      </button>
                      {verificationError && (
                        <p className="text-rose-400 text-sm">{verificationError}</p>
                      )}
                    </div>
                  )}

                  {verificationState === "sending" && (
                    <p className="text-sm text-blue-300">Envoi du code...</p>
                  )}

                  {verificationState === "sent" && (
                    <div className="space-y-3">
                      <p className="text-sm text-green-300 mb-2">✓ Code envoyé par SMS !</p>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={verificationCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 6) setVerificationCode(val);
                        }}
                        placeholder="Code à 6 chiffres"
                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-amber-400"
                      />
                      <button
                        type="button"
                        onClick={verifyOtpCode}
                        className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl px-6 py-2.5 text-sm"
                      >
                        Valider le code
                      </button>
                      {verificationError && (
                        <p className="text-rose-400 text-sm">{verificationError}</p>
                      )}
                    </div>
                  )}

                  {verificationState === "verifying" && (
                    <p className="text-sm text-blue-300">Vérification...</p>
                  )}

                  {verificationState === "success" && (
                    <div className="bg-green-900/30 border border-green-500/40 rounded-xl p-3">
                      <p className="text-green-300 text-sm font-medium">✓ Numéro vérifié avec succès !</p>
                    </div>
                  )}

                  {verificationState === "error" && verificationError && (
                    <div className="space-y-3">
                      <p className="text-rose-400 text-sm">{verificationError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setVerificationState("idle");
                          setVerificationError("");
                          setVerificationCode("");
                        }}
                        className="text-sm text-blue-400 hover:text-blue-300 underline"
                      >
                        Réessayer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
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
                <div className="w-full">
                  <Image src="/images/Lucid_Origin_Core_Description_for_all_versionsA_cinematic_phot_1.jpg" alt="Visuel Afroé Glow — beauté Afro moderne" width={600} height={600} className="rounded-2xl shadow-[0_0_30px_rgba(255,0,153,.25)] mx-auto object-cover aspect-square" />
                </div>
              </div>

              <div className="space-y-2 text-slate-200">
                <p className="font-bold">T'as galéré à trouver un coiffeur.se Afro qui capte ton style ?</p>
                <p>Ou t'es pro — <span className="text-slate-100">coiffeur.se, barbier, maquilleur.se, ongliste, esthéticien.ne</span> — et t'en as marre qu'on te prenne pas au sérieux ?</p>
                <p>Afroé comprend les deux côtés du miroir 💅🏾💈</p>
              </div>

              <div className="text-slate-100">
                <p className="font-medium">Et si la beauté Afro devenait enfin visible, pro et stylée ?</p>
                <p>Et si c'était toi, le/la prochain.e <span className="text-amber-300">Glow Leader</span> ? 👑</p>
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h2 className="text-xl md:text-2xl font-bold text-amber-300">Inscris-toi sur la liste d'attente exclusive</h2>
                      <span className="text-[11px] inline-flex items-center gap-1 text-amber-300 bg-amber-400/10 border border-amber-300/30 px-2 py-0.5 rounded-md">🎁 2 prix à gagner</span>
                    </div>
                    <p className="text-slate-200 text-sm md:text-base">Rejoins la waitlist Afroé et participe au concours de lancement. Partage ton lien unique, grimpe dans le classement et gagne un <span className="font-bold text-amber-300">iPhone 17 Pro</span> (rang #1) ou <span className="font-bold text-amber-300">€3,500 cash</span> (tirage au sort ≥100 pts) + des récompenses exclusives !</p>
                  </div>
                </div>
              </div>

              <form onSubmit={onSubmit} className="glassy neon-blue rounded-2xl p-4 md:p-5 space-y-4">
              {globalError && (
                <div className="bg-rose-900/30 border border-rose-500/40 rounded-xl p-3 text-rose-300 text-sm font-medium">
                  {globalError}
                </div>
              )}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Prénom <span className="text-slate-400">· Ton blaze</span></label>
                    <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ex: Aïcha" className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-fuchsia-400" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Nom</label>
                    <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Ex: Diop" className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-fuchsia-400" />
                  </div>
                </div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-fuchsia-400" />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] text-slate-300">Numéro de téléphone <span className="text-slate-400">· Numéro belge uniquement</span></label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex">
                    <div className="flex items-center bg-slate-800 border border-white/10 border-r-0 rounded-l-xl px-3 py-3 text-sm text-slate-300">+32</div>
                    <input type="tel" inputMode="numeric" pattern="[0-9]*" required={consentSMS} value={phoneLocal} onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); if (val.length <= 9) { setPhoneLocal(val); setPhoneError(""); setGlobalError(""); } }} placeholder="9 chiffres (sans le 0)" className={clsx("flex-1 rounded-r-xl px-3 py-3 text-sm outline-none focus:ring-1", phoneError ? "bg-slate-900/60 border-2 border-rose-500 focus:ring-rose-400" : "bg-slate-900/60 border border-white/10 focus:ring-fuchsia-400")} disabled={phoneVerified} />
                  </div>
                  {!phoneVerified ? (
                    smsState === "idle" || smsState === "error" || smsState === "expired" || smsState === "checking" ? (
                      <button type="button" disabled={!phoneLocal || resendCooldown > 0 || smsState === "checking"} onClick={verifyPhoneAndSendCode} className={clsx("rounded-xl px-4 py-3 text-sm font-medium border flex items-center justify-center gap-2", consentSMS && phoneLocal && !phoneError ? "bg-blue-600 border-blue-500 hover:bg-blue-500" : "bg-slate-800 border-white/10 opacity-50")}>
                        {smsState === "checking" ? (
                          <>
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                            <span>Vérification…</span>
                          </>
                        ) : resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Vérifier par SMS"}
                      </button>
                    ) : (
                      <button type="button" onClick={() => setConsentSMS(false)} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium hover:border-white/20">Sans SMS</button>
                    )
                  ) : (
                    <button type="button" onClick={resetPhoneVerification} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium hover:border-white/20 text-fuchsia-400">Changer de numéro</button>
                  )}
                </div>
                {phoneError && (
                  <p className="text-rose-300 text-xs">{phoneError}</p>
                )}
              </div>
              {consentSMS && (smsState === "sent" || smsState === "verifying" || smsState === "verified") && (
                <div className="space-y-2">
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={smsCode} onChange={handleSmsCodeChange} ref={setSmsCodeInputRef} placeholder="Code SMS (6 chiffres)" disabled={smsState === "verified"} className={clsx("w-full rounded-xl px-3 py-3 text-sm outline-none focus:ring-2", smsState === "verified" ? "bg-emerald-900/20 border-2 border-emerald-500 text-emerald-300" : smsState === "verifying" ? "bg-slate-900/60 border border-blue-400 focus:ring-blue-400" : "bg-slate-900/60 border border-white/10 focus:ring-fuchsia-400")} />
                  <p className="text-[11px] text-slate-400">On vérifie ton numéro pour éviter les faux comptes. Code valable 2 min.</p>
                  {smsState === "verified" && (
                    <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-3">
                      <div className="text-emerald-300 text-sm font-medium flex items-center gap-2">
                        <span>✅</span>
                        <span>Numéro vérifié. Tu peux prendre ta place.</span>
                      </div>
                    </div>
                  )}
                  {smsState === "verifying" && (
                    <div className="text-blue-300 text-xs flex items-center gap-2">
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-blue-300 border-t-transparent rounded-full"></span>
                      <span>Vérification en cours…</span>
                    </div>
                  )}
                  {smsState === "sent" && !devSkipSms && (
                    <div className="text-[11px] text-amber-300 flex items-center gap-2">
                      <span>⏱</span>
                      <span>Expire dans {String(smsMin).padStart(2, "0")}:{String(smsSec).padStart(2, "0")}</span>
                    </div>
                  )}
                </div>
              )}
              {consentSMS && smsState === "error" && !phoneOwnerConflict && (
                <p className="text-rose-300 text-xs">Code incorrect ou expiré. Réessaie.</p>
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
              <div className="space-y-2">
                <button type="submit" disabled={submit === "loading" || !canSubmit} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60 transition-colors">{submit === "loading" ? "On te place…" : submit === "done" ? "C'est validé ✨" : "Prends ta place ✨"}</button>
                {consentSMS && !phoneVerified && (
                  <p className="text-[11px] text-slate-400 text-center">Valide d'abord ton numéro par SMS.</p>
                )}
              </div>
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
                <h3 className="text-xl md:text-2xl font-bold text-white">Invite tes amis, grimpe dans le classement et tente de gagner un iPhone 17 Pro ou €3,500 !</h3>
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
                <p className="text-xs text-slate-300 pt-2">100 pts = accès au tirage €3,500 + chance de gagner l'iPhone 17 Pro si tu es #1.</p>
              </div>
            </div>

            <div className="mt-5 text-slate-200"><p className="font-medium">🔥 20+ Afro beauty lovers ont déjà rejoint la Glow List. Rejoins le crew avant le top départ.</p></div>

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
                      <li className="font-bold italic ml-3">Avant le lancement :</li>
                      <li className="ml-6">+2 pts pour un·e client·e</li>
                      <li className="ml-6">+15 pts pour un·e influenceur·euse</li>
                      <li className="ml-6">+25 pts pour un·e Beauty Pro</li>
                      <li className="font-bold italic ml-3">Après le lancement :</li>
                      <li className="ml-6">+10 pts si un·e client·e télécharge l'appli.</li>
                      <li className="ml-6">+50 pts si un·e influenceur·euse (&gt;2k followers) rejoint.</li>
                      <li className="ml-6">+100 pts si un·e Beauty Pro s'inscrit (min. 2 mois).</li>
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
                  <div className="text-xs text-slate-200/90 bg-amber-400/10 border border-amber-300/30 text-amber-300 px-2 py-1 rounded-lg">🥇 iPhone 17 Pro + 💸 €3,500</div>
                  <Countdown />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-amber-300 mb-2">Avant le lancement</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-300">Client·e</div><div className="text-2xl font-bold">+2</div><div className="text-[11px] text-slate-400">Inscription waitlist</div></div>
                    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-300">Influenceur·euse</div><div className="text-2xl font-bold">+15</div><div className="text-[11px] text-slate-400">&ge; 2k followers</div></div>
                    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-300">Beauty Pro</div><div className="text-2xl font-bold">+25</div><div className="text-[11px] text-slate-400">Inscription waitlist</div></div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-blue-300 mb-2">Après le lancement</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-300">Client·e</div><div className="text-2xl font-bold">+10</div><div className="text-[11px] text-slate-400">Téléchargement app</div></div>
                    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-300">Influenceur·euse</div><div className="text-2xl font-bold">+50</div><div className="text-[11px] text-slate-400">&ge; 2k followers validé</div></div>
                    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3"><div className="text-slate-300">Beauty Pro</div><div className="text-2xl font-bold">+100</div><div className="text-[11px] text-slate-400">Inscription validée</div></div>
                  </div>
                </div>
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
