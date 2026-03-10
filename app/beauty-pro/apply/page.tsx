"use client";

// ─────────────────────────────────────────────────────────────────────────────
// FILE: app/beauty-pro/apply/page.tsx
// Drop this entire file at: app/beauty-pro/apply/page.tsx
// Requires: lib/submitProApplication.ts (separate file)
// Requires: npm install @phosphor-icons/react
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import {
  Layout,
  Scales,
  GraduationCap,
  CalendarCheck,
  HandCoins,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  UploadSimple,
  Images,
  X,
  Sparkle,
  User,
  Envelope,
  Phone,
  MapPin,
  IdentificationCard,
} from "@phosphor-icons/react";
import { submitProApplication, ProApplicationPayload } from "@/lib/submitProApplication";

// ── Constants ─────────────────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: <Layout size={28} weight="light" />,
    title: "Dashboard Intégré",
    desc: "Gérez votre compta et TVA en un clic.",
  },
  {
    icon: <Scales size={28} weight="light" />,
    title: "Support Juridique",
    desc: "Développez votre business en toute sécurité.",
  },
  {
    icon: <GraduationCap size={28} weight="light" />,
    title: "Formations Academy",
    desc: "Maîtrisez l'accueil de luxe et les techniques.",
  },
  {
    icon: <CalendarCheck size={28} weight="light" />,
    title: "Missions Flexibles",
    desc: "Choisissez vos missions selon vos dispos.",
  },
  {
    icon: <HandCoins size={28} weight="light" />,
    title: "Réseau & Paiement",
    desc: "Clientèle premium et paiements sécurisés.",
  },
];

const HAIR_TAGS = [
  "Nappy Specialist",
  "Loctitien.ne",
  "Braider Expert",
  "Master Barber",
  "Coloriste Texturé",
  "Trichologue",
  "Technicien.ne Extensions",
  "Perruquier.re",
];

const BEAUTY_TAGS = [
  "Esthéticien.ne",
  "Nail Artist",
  "Make-up Artist (MUA)",
  "Brow & Lash Artist",
];

const STEPS_LABELS = [
  "Identité",
  "Spécialités",
  "Documents",
  "Finalisation",
];

const HEARD_OPTIONS = [
  "Instagram",
  "TikTok",
  "Bouche à oreille",
  "Ami(e) / Collègue",
  "Google",
  "Autre",
];

// ── Belgian postal code API helper ─────────────────────────────────────────
async function getCommuneFromPostalCode(cp: string): Promise<string> {
  if (cp.length !== 4) return "";
  try {
    const res = await fetch(
      `https://api.basisregisters.vlaanderen.be/v2/postinfo/${cp}`
    );
    if (res.ok) {
      const data = await res.json();
      const name =
        data?.postnamen?.[0]?.geografischeNaam?.spelling ||
        data?.gemeente?.gemeentenaam?.geografischeNaam?.spelling;
      if (name) return name;
    }
  } catch {}
  // Fallback: common Belgian postal codes
  const fallback: Record<string, string> = {
    "1000": "Bruxelles",
    "1020": "Laeken",
    "1030": "Schaerbeek",
    "1040": "Etterbeek",
    "1050": "Ixelles",
    "1060": "Saint-Gilles",
    "1070": "Anderlecht",
    "1080": "Molenbeek",
    "1081": "Koekelberg",
    "1082": "Berchem-Sainte-Agathe",
    "1083": "Ganshoren",
    "1090": "Jette",
    "1140": "Evere",
    "1150": "Woluwe-Saint-Pierre",
    "1160": "Auderghem",
    "1170": "Watermael-Boitsfort",
    "1180": "Uccle",
    "1190": "Forest",
    "1200": "Woluwe-Saint-Lambert",
    "1210": "Saint-Josse-ten-Noode",
    "4000": "Liège",
    "4020": "Liège",
    "4030": "Liège",
    "5000": "Namur",
    "6000": "Charleroi",
    "8000": "Bruges",
    "9000": "Gand",
    "2000": "Anvers",
    "3000": "Louvain",
  };
  return fallback[cp] || "";
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormState {
  // Step 1
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  postal_code: string;
  commune: string;
  full_address: string;
  // Step 2
  hair_tags: string[];
  beauty_tags: string[];
  // Step 3
  certification_file: File | null;
  portfolio_files: File[];
  portfolio_url: string;
  media_projects: string;
  smartphone: "ios" | "android" | "other";
  // Step 4
  work_authorized: boolean;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  heard_about: string;
  consent_missions: boolean;
  consent_messages: boolean;
  consent_phone_call: boolean;
}

const initial: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  postal_code: "",
  commune: "",
  full_address: "",
  hair_tags: [],
  beauty_tags: [],
  certification_file: null,
  portfolio_files: [],
  portfolio_url: "",
  media_projects: "",
  smartphone: "other",
  work_authorized: false,
  emergency_contact_name: "",
  emergency_contact_phone: "",
  heard_about: "",
  consent_missions: false,
  consent_messages: false,
  consent_phone_call: false,
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function BeautyProApplyPage() {
  const [step, setStep] = useState(0); // 0 = landing, 1-4 = form steps
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cpLoading, setCpLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const toggleTag = (key: "hair_tags" | "beauty_tags", val: string) => {
    setForm((f) => {
      const arr = f[key];
      return { ...f, [key]: arr.includes(val) ? arr.filter((t) => t !== val) : [...arr, val] };
    });
  };

  // Auto-fill commune from postal code
  useEffect(() => {
    if (form.postal_code.length === 4) {
      setCpLoading(true);
      getCommuneFromPostalCode(form.postal_code).then((commune) => {
        if (commune) set("commune", commune);
        setCpLoading(false);
      });
    } else if (form.postal_code.length < 4) {
      set("commune", "");
    }
  }, [form.postal_code]);

  const validate = (s: number): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (s === 1) {
      if (!form.first_name.trim()) e.first_name = "Prénom requis";
      if (!form.last_name.trim()) e.last_name = "Nom requis";
      if (!form.email.trim() || !form.email.includes("@")) e.email = "Email valide requis";
      if (!form.phone.trim()) e.phone = "Téléphone requis";
      if (!form.postal_code || form.postal_code.length !== 4) e.postal_code = "Code postal belge à 4 chiffres";
    }
    if (s === 2) {
      if (form.hair_tags.length === 0 && form.beauty_tags.length === 0)
        e.hair_tags = "Sélectionnez au moins une spécialité";
    }
    if (s === 4) {
      if (!form.consent_missions) e.consent_missions = "Consentement obligatoire";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePortfolioFiles = (files: FileList | null) => {
    if (!files) return;
    const current = form.portfolio_files;
    const toAdd = Array.from(files).slice(0, 3 - current.length);
    set("portfolio_files", [...current, ...toAdd].slice(0, 3));
  };

  const removePortfolioFile = (i: number) => {
    set("portfolio_files", form.portfolio_files.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!validate(4)) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const services_offered = [...form.hair_tags, ...form.beauty_tags];

    const payload: ProApplicationPayload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.commune || form.postal_code,
      postal_code: form.postal_code,
      full_address: form.full_address || undefined,
      date_of_birth: form.date_of_birth || undefined,
      portfolio_url: form.portfolio_url || undefined,
      media_projects: form.media_projects || undefined,
      smartphone: form.smartphone,
      work_authorized: form.work_authorized,
      emergency_contact_name: form.emergency_contact_name || undefined,
      emergency_contact_phone: form.emergency_contact_phone || undefined,
      heard_about: form.heard_about || undefined,
      consent_missions: form.consent_missions,
      consent_messages: form.consent_messages,
      consent_phone_call: form.consent_phone_call,
      services_offered,
      certifications: [],
    };

    const result = await submitProApplication(payload);
    setIsSubmitting(false);

    if (result.success && result.applicationId) {
      setSubmitted({ id: result.applicationId });
    } else {
      setSubmitError(result.message ?? "Une erreur est survenue. Veuillez réessayer.");
    }
  };

  // ── Success Screen ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={S.page}>
        <div style={S.successWrap}>
          <div style={S.successIconWrap}>
            <CheckCircle size={56} weight="thin" color="#6D28D9" />
          </div>
          <h1 style={S.successTitle}>Candidature soumise !</h1>
          <p style={S.successBody}>
            Merci <strong>{form.first_name}</strong>. Votre dossier a bien été reçu.
            Un email de confirmation a été envoyé à <strong>{form.email}</strong>.
          </p>
          <p style={S.successSub}>
            Notre équipe examinera votre profil et vous recontactera sous <strong>72 heures</strong>.
          </p>
          <div style={S.successRef}>
            Référence : <code style={S.code}>{submitted.id}</code>
          </div>
          <div style={S.selectionSteps}>
            {[
              { n: "01", title: "Candidature Digitale", desc: "Remplissez votre questionnaire et soumettez votre portfolio." },
              { n: "02", title: "Entretien de Vision", desc: "Un échange de 20 minutes pour discuter de votre vision du service." },
              { n: "03", title: "Session Technique", desc: "Démontrez votre talent lors d'une session en conditions réelles à Bruxelles." },
            ].map((s) => (
              <div key={s.n} style={S.selStep}>
                <span style={S.selStepNum}>{s.n}</span>
                <div>
                  <p style={S.selStepTitle}>{s.title}</p>
                  <p style={S.selStepDesc}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Landing (step 0) ─────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div style={S.page}>
        {/* Hero */}
        <div style={S.hero}>
          <div style={S.heroEyebrow}>
            <Sparkle size={14} weight="fill" color="#6D28D9" />
            <span>Réseau Beauté Afroé</span>
          </div>
          <h1 style={S.heroTitle}>
            Rejoignez l'excellence.<br />
            <span style={S.heroPurple}>Devenez Prestataire Afroé.</span>
          </h1>
          <p style={S.heroSub}>
            Une plateforme dédiée aux professionnelles de la beauté afro-experte.
            Missions premium, outils de gestion, formation continue.
          </p>
          <button style={S.heroCta} onClick={() => setStep(1)}>
            Déposer ma candidature
            <ArrowRight size={18} weight="bold" />
          </button>
        </div>

        {/* Benefits grid */}
        <div style={S.benefitsGrid}>
          {BENEFITS.map((b) => (
            <div key={b.title} style={S.benefitCard}>
              <div style={S.benefitIcon}>{b.icon}</div>
              <p style={S.benefitTitle}>{b.title}</p>
              <p style={S.benefitDesc}>{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Selection process */}
        <div style={S.processSection}>
          <p style={S.processEyebrow}>Parcours de Sélection</p>
          {[
            { n: "01", title: "Candidature Digitale", desc: "Remplissez votre questionnaire et soumettez votre portfolio." },
            { n: "02", title: "Entretien de Vision", desc: "Un échange de 20 minutes pour discuter de votre vision du service." },
            { n: "03", title: "Session Technique", desc: "Démontrez votre talent lors d'une session en conditions réelles à Bruxelles." },
          ].map((s, i) => (
            <div key={s.n} style={{ ...S.processStep, ...(i < 2 ? S.processStepBorder : {}) }}>
              <span style={S.processNum}>{s.n}</span>
              <div>
                <p style={S.processTitle}>{s.title}</p>
                <p style={S.processDesc}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button style={{ ...S.heroCta, margin: "0 auto 80px", display: "flex" }} onClick={() => setStep(1)}>
          Commencer ma candidature
          <ArrowRight size={18} weight="bold" />
        </button>

        <Footer />
      </div>
    );
  }

  // ── Form Steps 1–4 ───────────────────────────────────────────────────────────
  const currentStep = step; // 1–4

  return (
    <div style={S.page}>
      {/* Top nav */}
      <div style={S.formNav}>
        <button style={S.navBack} onClick={step === 1 ? () => setStep(0) : back}>
          <ArrowLeft size={16} weight="bold" /> Retour
        </button>
        <span style={S.navLogo}>afroé</span>
        <span style={S.navStep}>{currentStep} / 4</span>
      </div>

      {/* Progress */}
      <div style={S.progressBar}>
        <div style={{ ...S.progressFill, width: `${(currentStep / 4) * 100}%` }} />
      </div>

      {/* Step label */}
      <div style={S.stepHeader}>
        <p style={S.stepEyebrow}>Étape {currentStep} sur 4</p>
        <h2 style={S.stepTitle}>{STEPS_LABELS[currentStep - 1]}</h2>
      </div>

      <div style={S.formCard}>
        {/* ── STEP 1: Identité & Localisation ── */}
        {currentStep === 1 && (
          <div>
            <SectionLabel icon={<User size={15} weight="bold" />} label="Identité" />
            <Row>
              <Field label="Prénom *" error={errors.first_name}>
                <input style={inp(errors.first_name)} value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)} placeholder="Marie" />
              </Field>
              <Field label="Nom *" error={errors.last_name}>
                <input style={inp(errors.last_name)} value={form.last_name}
                  onChange={(e) => set("last_name", e.target.value)} placeholder="Dupont" />
              </Field>
            </Row>

            <Field label="Email *" error={errors.email}>
              <div style={S.inputIcon}>
                <Envelope size={16} color="#9CA3AF" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input style={{ ...inp(errors.email), paddingLeft: 40 }} type="email"
                  value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="marie@exemple.com" />
              </div>
            </Field>

            <Field label="Téléphone *" error={errors.phone}>
              <div style={S.inputIcon}>
                <Phone size={16} color="#9CA3AF" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input style={{ ...inp(errors.phone), paddingLeft: 40 }} type="tel"
                  value={form.phone} onChange={(e) => set("phone", e.target.value)}
                  placeholder="+32 470 00 00 00" />
              </div>
            </Field>

            <Field label="Date de naissance">
              <div style={S.inputIcon}>
                <IdentificationCard size={16} color="#9CA3AF" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input style={{ ...inp(), paddingLeft: 40 }} type="date"
                  value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} />
              </div>
            </Field>

            <div style={S.divider} />
            <SectionLabel icon={<MapPin size={15} weight="bold" />} label="Localisation" />

            <Row>
              <Field label="Code postal *" error={errors.postal_code}>
                <input style={inp(errors.postal_code)} value={form.postal_code}
                  onChange={(e) => set("postal_code", e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1000\" maxLength={4} />
              </Field>
              <Field label="Commune">
                <div style={{ position: "relative" }}>
                  <input style={{ ...inp(), background: "#F9F9F9", color: form.commune ? "#1A1A1A" : "#9CA3AF" }}
                    value={cpLoading ? "Recherche..." : form.commune || "Remplissage automatique"}
                    readOnly />
                  {cpLoading && <div style={S.cpSpinner} />}
                </div>
              </Field>
            </Row>

            <Field label="Adresse complète (optionnel)">
              <input style={inp()} value={form.full_address}
                onChange={(e) => set("full_address", e.target.value)}
                placeholder="Rue de la Loi 12" />
            </Field>
          </div>
        )}

        {/* ── STEP 2: Spécialités ── */}
        {currentStep === 2 && (
          <div>
            <p style={S.tagIntro}>
              Sélectionnez vos expertises pour personnaliser votre profil.
            </p>

            <Field label="Expertise Capillaire" error={errors.hair_tags}>
              <div style={S.tagGrid}>
                {HAIR_TAGS.map((t) => (
                  <Tag key={t} label={t} active={form.hair_tags.includes(t)}
                    onClick={() => toggleTag("hair_tags", t)} />
                ))}
              </div>
            </Field>

            <div style={S.divider} />

            <Field label="Beauté & Esthétique">
              <div style={S.tagGrid}>
                {BEAUTY_TAGS.map((t) => (
                  <Tag key={t} label={t} active={form.beauty_tags.includes(t)}
                    onClick={() => toggleTag("beauty_tags", t)} />
                ))}
              </div>
            </Field>

            {errors.hair_tags && (
              <p style={S.errorMsg}>{errors.hair_tags}</p>
            )}

            <div style={S.selectedCount}>
              {form.hair_tags.length + form.beauty_tags.length} spécialité(s) sélectionnée(s)
            </div>
          </div>
        )}

        {/* ── STEP 3: Documents & Portfolio ── */}
        {currentStep === 3 && (
          <div>
            <SectionLabel icon={<UploadSimple size={15} weight="bold" />} label="Certification / Diplômes" />
            <p style={S.uploadHint}>PDF ou JPG acceptés — 1 fichier maximum</p>

            <div style={S.uploadBox} onClick={() => certInputRef.current?.click()}>
              <UploadSimple size={32} weight="thin" color="#6D28D9" />
              <p style={S.uploadTitle}>
                {form.certification_file ? form.certification_file.name : "Télécharger votre certificat"}
              </p>
              <p style={S.uploadSub}>PDF / JPG — cliquez pour sélectionner</p>
              <input ref={certInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={(e) => set("certification_file", e.target.files?.[0] ?? null)} />
            </div>

            {form.certification_file && (
              <div style={S.fileChip}>
                <span>{form.certification_file.name}</span>
                <button style={S.removeBtn} onClick={() => set("certification_file", null)}>
                  <X size={14} weight="bold" />
                </button>
              </div>
            )}

            <div style={{ ...S.divider, marginTop: 28 }} />
            <SectionLabel icon={<Images size={15} weight="bold" />} label="Réalisations (Portfolio)" />
            <p style={S.uploadHint}>3 images maximum — aperçu miniature après sélection</p>

            <div style={S.portfolioGrid}>
              {form.portfolio_files.map((f, i) => (
                <div key={i} style={S.portfolioThumb}>
                  <img src={URL.createObjectURL(f)} alt={`portfolio-${i}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                  <button style={S.thumbRemove} onClick={() => removePortfolioFile(i)}>
                    <X size={12} weight="bold" color="#fff" />
                  </button>
                </div>
              ))}
              {form.portfolio_files.length < 3 && (
                <div style={S.portfolioAdd} onClick={() => portfolioInputRef.current?.click()}>
                  <Images size={24} weight="thin" color="#6D28D9" />
                  <span style={S.addLabel}>Ajouter</span>
                  <input ref={portfolioInputRef} type="file" accept="image/*" multiple
                    style={{ display: "none" }}
                    onChange={(e) => handlePortfolioFiles(e.target.files)} />
                </div>
              )}
            </div>

            <div style={S.divider} />

            <Field label="Lien Instagram / Portfolio (optionnel)">
              <input style={inp()} value={form.portfolio_url}
                onChange={(e) => set("portfolio_url", e.target.value)}
                placeholder="https://instagram.com/votre_compte" />
            </Field>

            <Field label="Décrivez vos réalisations (optionnel)">
              <textarea style={S.textarea} rows={3} value={form.media_projects}
                onChange={(e) => set("media_projects", e.target.value)}
                placeholder="Ex: Spécialisée en box braids depuis 5 ans, shootings mode..." />
            </Field>

            <Field label="Votre smartphone">
              <div style={S.radioGroup}>
                {(["ios", "android", "other"] as const).map((v) => (
                  <label key={v} style={S.radioLabel}>
                    <input type="radio" name="smartphone" value={v}
                      checked={form.smartphone === v}
                      onChange={() => set("smartphone", v)}
                      style={{ accentColor: "#6D28D9" }} />
                    {v === "ios" ? "iPhone (iOS)" : v === "android" ? "Android" : "Autre"}
                  </label>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* ── STEP 4: Finalisation ── */}
        {currentStep === 4 && (
          <div>
            <Field label="Comment avez-vous entendu parler d'Afroé ?">
              <div style={S.tagGrid}>
                {HEARD_OPTIONS.map((h) => (
                  <Tag key={h} label={h} active={form.heard_about === h}
                    onClick={() => set("heard_about", h)} />
                ))}
              </div>
            </Field>

            <div style={S.divider} />

            <p style={S.consentTitle}>Consentements</p>

            <ConsentRow
              checked={form.consent_missions}
              onChange={(v) => set("consent_missions", v)}
              label="Missions & disponibilités *"
              desc="J'accepte d'être contactée pour des missions beauté correspondant à mon profil."
              error={errors.consent_missions}
              required
            />
            <ConsentRow
              checked={form.consent_messages}
              onChange={(v) => set("consent_messages", v)}
              label="Notifications & messages"
              desc="J'accepte de recevoir des SMS/email concernant les opportunités de missions."
            />
            <ConsentRow
              checked={form.consent_phone_call}
              onChange={(v) => set("consent_phone_call", v)}
              label="Appels téléphoniques"
              desc="J'accepte d'être appelée pour des entretiens ou questions relatives à ma candidature."
            />

            <div style={S.divider} />

            {/* Recap */}
            <div style={S.recap}>
              <p style={S.recapTitle}>Récapitulatif</p>
              <RecapRow k="Nom" v={`${form.first_name} ${form.last_name}`} />
              <RecapRow k="Email" v={form.email} />
              <RecapRow k="Localisation" v={`${form.commune || "—"} (${form.postal_code})`} />
              <RecapRow k="Spécialités" v={[...form.hair_tags, ...form.beauty_tags].join(", ") || "—"} />
            </div>

            {submitError && (
              <div style={S.errorBanner}>{submitError}</div>
            )}
          </div>
        )}

        {/* ── Nav buttons ── */}
        <div style={S.navBtns}>
          {currentStep > 1 && (
            <button style={S.btnOutline} onClick={back} disabled={isSubmitting}>
              <ArrowLeft size={16} weight="bold" /> Retour
            </button>
          )}
          <div style={{ flex: 1 }} />
          {currentStep < 4 ? (
            <button style={S.btnPurple} onClick={next}>
              Continuer <ArrowRight size={16} weight="bold" />
            </button>
          ) : (
            <button style={{ ...S.btnPurple, ...(isSubmitting ? { opacity: 0.6, cursor: "not-allowed" } : {}) }}
              onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours..." : <>Soumettre ma candidature <ArrowRight size={16} weight="bold" /></>}
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={S.label}>{label}</label>
      {children}
      {error && <span style={S.errorMsg}>{error}</span>}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={S.row}>{children}</div>;
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={S.sectionLabel}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function Tag({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{ ...S.tag, ...(active ? S.tagActive : {}) }}>
      {label}
    </button>
  );
}

function ConsentRow({ checked, onChange, label, desc, required, error }: {
  checked: boolean; onChange: (v: boolean) => void;
  label: string; desc: string; required?: boolean; error?: string;
}) {
  return (
    <div style={{ ...S.consentRow, ...(error ? { borderColor: "#DC2626" } : {}) }}
      onClick={() => onChange(!checked)}>
      <div style={{ ...S.checkBox, ...(checked ? S.checkBoxOn : {}) }}>
        {checked && <CheckCircle size={18} weight="fill" color="#fff" />}
      </div>
      <div style={{ flex: 1 }}>
        <p style={S.consentLabel}>
          {label}
          {required && <span style={S.requiredBadge}> requis</span>}
        </p>
        <p style={S.consentDesc}>{desc}</p>
        {error && <span style={S.errorMsg}>{error}</span>}
      </div>
    </div>
  );
}

function RecapRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={S.recapRow}>
      <span style={S.recapKey}>{k}</span>
      <span style={S.recapVal}>{v}</span>
    </div>
  );
}

function Footer() {
  return (
    <div style={S.footer}>
      <Lock size={14} weight="bold" color="#6D28D9" />
      <span>
        <strong>Confidentialité garantie</strong> — Vos données sont traitées de manière sécurisée et confidentielle.
        Nous vous contacterons sous 72 heures après examen de votre candidature.
      </span>
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const inp = (err?: string): React.CSSProperties => ({
  width: "100%",
  padding: "11px 14px",
  fontSize: 14,
  fontFamily: "'Cormorant Garamond', 'Georgia', serif",
  border: `1.5px solid ${err ? "#DC2626" : "#E5E7EB"}`,
  borderRadius: 8,
  background: "#fff",
  color: "#1A1A1A",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
});

// ── Styles ─────────────────────────────────────────────────────────────────────
const PURPLE = "#6D28D9";
const PURPLE_LIGHT = "#F5F3FF";
const TEXT = "#1A1A1A";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const BG = "#FFFFFF";

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: BG,
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    maxWidth: 700,
    margin: "0 auto",
    padding: "0 20px",
    color: TEXT,
  },
  // Hero
  hero: { paddingTop: 72, paddingBottom: 56, textAlign: "center" },
  heroEyebrow: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 11, fontWeight: 600, color: PURPLE,
    letterSpacing: "0.14em", textTransform: "uppercase",
    background: PURPLE_LIGHT, padding: "5px 14px", borderRadius: 20, marginBottom: 24,
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  heroTitle: {
    fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 700,
    lineHeight: 1.15, color: TEXT, margin: "0 0 20px",
    letterSpacing: "-0.02em",
  },
  heroPurple: { color: PURPLE },
  heroSub: { fontSize: 17, color: MUTED, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7 },
  heroCta: {
    display: "inline-flex", alignItems: "center", gap: 10,
    background: PURPLE, color: "#fff",
    padding: "15px 32px", borderRadius: 10,
    border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer",
    fontFamily: "'Helvetica Neue', sans-serif",
    letterSpacing: "0.01em",
  },
  // Benefits
  benefitsGrid: {
    display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
    gap: 16, marginBottom: 72,
  },
  benefitCard: {
    textAlign: "center", padding: "24px 12px",
    border: `1px solid ${BORDER}`, borderRadius: 12,
    transition: "box-shadow 0.2s",
  },
  benefitIcon: { color: PURPLE, marginBottom: 12 },
  benefitTitle: { fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 6px", lineHeight: 1.3 },
  benefitDesc: { fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.5 },
  // Process
  processSection: { marginBottom: 48 },
  processEyebrow: {
    fontSize: 11, fontWeight: 700, color: PURPLE,
    letterSpacing: "0.14em", textTransform: "uppercase",
    fontFamily: "'Helvetica Neue', sans-serif", marginBottom: 24,
  },
  processStep: { display: "flex", gap: 24, padding: "24px 0", alignItems: "flex-start" },
  processStepBorder: { borderBottom: `1px solid ${BORDER}` },
  processNum: {
    fontSize: 40, fontWeight: 700, color: "#F3F4F6",
    lineHeight: 1, minWidth: 60, letterSpacing: "-0.03em",
  },
  processTitle: { fontSize: 18, fontWeight: 700, color: TEXT, margin: "0 0 6px" },
  processDesc: { fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 },
  // Form nav
  formNav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 0", borderBottom: `1px solid ${BORDER}`, marginBottom: 0,
  },
  navBack: {
    display: "flex", alignItems: "center", gap: 6,
    background: "none", border: "none", color: MUTED,
    fontSize: 13, cursor: "pointer", fontFamily: "'Helvetica Neue', sans-serif",
  },
  navLogo: { fontSize: 20, fontWeight: 700, color: PURPLE, letterSpacing: "0.08em" },
  navStep: { fontSize: 13, color: MUTED, fontFamily: "'Helvetica Neue', sans-serif" },
  progressBar: { height: 3, background: "#F3F4F6", marginBottom: 40 },
  progressFill: { height: "100%", background: PURPLE, transition: "width 0.4s ease" },
  // Step header
  stepHeader: { marginBottom: 32 },
  stepEyebrow: {
    fontSize: 11, fontWeight: 700, color: PURPLE,
    letterSpacing: "0.14em", textTransform: "uppercase",
    fontFamily: "'Helvetica Neue', sans-serif", margin: "0 0 8px",
  },
  stepTitle: { fontSize: 28, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: "-0.02em" },
  // Form card
  formCard: {
    background: "#fff", borderRadius: 16,
    border: `1px solid ${BORDER}`, padding: "32px 28px",
    marginBottom: 40, boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
  },
  // Fields
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  label: {
    display: "block", fontSize: 12, fontWeight: 700, color: TEXT,
    marginBottom: 7, letterSpacing: "0.04em", textTransform: "uppercase",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  inputIcon: { position: "relative" },
  textarea: {
    width: "100%", padding: "11px 14px", fontSize: 14,
    border: `1.5px solid ${BORDER}`, borderRadius: 8,
    background: "#fff", color: TEXT, outline: "none",
    resize: "vertical", boxSizing: "border-box",
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
  },
  radioGroup: { display: "flex", gap: 24, flexWrap: "wrap", paddingTop: 6 },
  radioLabel: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 14, color: TEXT, cursor: "pointer",
  },
  divider: { height: 1, background: BORDER, margin: "24px 0" },
  sectionLabel: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 11, fontWeight: 700, color: PURPLE,
    letterSpacing: "0.12em", textTransform: "uppercase",
    fontFamily: "'Helvetica Neue', sans-serif", marginBottom: 16,
  },
  cpSpinner: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    width: 14, height: 14, border: `2px solid ${PURPLE}`,
    borderTopColor: "transparent", borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
  // Tags
  tagIntro: { fontSize: 15, color: MUTED, margin: "0 0 24px", lineHeight: 1.6 },
  tagGrid: { display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 6 },
  tag: {
    padding: "8px 16px", borderRadius: 20,
    border: `1.5px solid ${BORDER}`, background: "#fff",
    color: MUTED, fontSize: 13, cursor: "pointer",
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    fontWeight: 600, transition: "all 0.15s",
  },
  tagActive: { background: PURPLE, borderColor: PURPLE, color: "#fff" },
  selectedCount: {
    fontSize: 12, color: PURPLE, fontFamily: "'Helvetica Neue', sans-serif",
    fontWeight: 600, marginTop: 16,
  },
  // Upload
  uploadHint: { fontSize: 12, color: MUTED, margin: "0 0 12px", fontFamily: "'Helvetica Neue', sans-serif" },
  uploadBox: {
    border: `2px dashed ${BORDER}`, borderRadius: 12,
    padding: "32px 20px", textAlign: "center",
    cursor: "pointer", transition: "border-color 0.2s",
    background: "#FAFAFA",
  },
  uploadTitle: { fontSize: 14, fontWeight: 600, color: TEXT, margin: "12px 0 4px" },
  uploadSub: { fontSize: 12, color: MUTED, margin: 0, fontFamily: "'Helvetica Neue', sans-serif" },
  fileChip: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: PURPLE_LIGHT, borderRadius: 20, padding: "6px 14px",
    fontSize: 12, color: PURPLE, marginTop: 10,
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  removeBtn: {
    background: "none", border: "none", color: PURPLE, cursor: "pointer",
    display: "flex", alignItems: "center",
  },
  portfolioGrid: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  portfolioThumb: {
    width: 90, height: 90, borderRadius: 8,
    position: "relative", overflow: "hidden",
    border: `1px solid ${BORDER}`,
  },
  thumbRemove: {
    position: "absolute", top: 4, right: 4,
    background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%",
    width: 20, height: 20, display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer",
  },
  portfolioAdd: {
    width: 90, height: 90, borderRadius: 8,
    border: `2px dashed ${BORDER}`, display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 4, cursor: "pointer", background: "#FAFAFA",
  },
  addLabel: { fontSize: 11, color: PURPLE, fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 600 },
  // Consents
  consentTitle: {
    fontSize: 11, fontWeight: 700, color: MUTED,
    letterSpacing: "0.12em", textTransform: "uppercase",
    fontFamily: "'Helvetica Neue', sans-serif", margin: "0 0 16px",
  },
  consentRow: {
    display: "flex", gap: 14, padding: "16px",
    border: `1.5px solid ${BORDER}`, borderRadius: 10,
    marginBottom: 10, cursor: "pointer", background: "#FAFAFA",
    alignItems: "flex-start",
  },
  checkBox: {
    width: 24, height: 24, borderRadius: 6,
    border: `2px solid ${BORDER}`, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s",
  },
  checkBoxOn: { background: PURPLE, borderColor: PURPLE },
  consentLabel: {
    fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 4px",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  consentDesc: { fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.5 },
  requiredBadge: {
    fontSize: 10, fontWeight: 600, color: PURPLE,
    background: PURPLE_LIGHT, padding: "2px 6px", borderRadius: 4,
    marginLeft: 6, letterSpacing: "0.06em",
  },
  // Recap
  recap: {
    background: PURPLE_LIGHT, border: `1px solid #DDD6FE`,
    borderRadius: 10, padding: "16px 20px", marginTop: 20,
  },
  recapTitle: {
    fontSize: 11, fontWeight: 700, color: PURPLE,
    textTransform: "uppercase", letterSpacing: "0.1em",
    fontFamily: "'Helvetica Neue', sans-serif", margin: "0 0 12px",
  },
  recapRow: {
    display: "grid", gridTemplateColumns: "100px 1fr",
    gap: 12, fontSize: 13, marginBottom: 6,
  },
  recapKey: { color: MUTED, fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 600 },
  recapVal: { color: TEXT },
  // Nav buttons
  navBtns: { display: "flex", alignItems: "center", marginTop: 28, gap: 12 },
  btnPurple: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: PURPLE, color: "#fff",
    border: "none", borderRadius: 10, padding: "13px 28px",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  btnOutline: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "none", color: MUTED,
    border: `1.5px solid ${BORDER}`, borderRadius: 10, padding: "12px 20px",
    fontSize: 14, cursor: "pointer", fontFamily: "'Helvetica Neue', sans-serif",
  },
  // Errors
  errorMsg: {
    fontSize: 12, color: "#DC2626", display: "block",
    marginTop: 4, fontFamily: "'Helvetica Neue', sans-serif",
  },
  errorBanner: {
    background: "#FEF2F2", border: "1px solid #FECACA",
    borderRadius: 8, padding: "12px 16px",
    fontSize: 13, color: "#DC2626", marginTop: 16,
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  // Footer
  footer: {
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "20px 0 60px", fontSize: 12, color: MUTED,
    lineHeight: 1.6, fontFamily: "'Helvetica Neue', sans-serif",
    borderTop: `1px solid ${BORDER}`, marginTop: 8,
  },
  // Success
  successWrap: {
    maxWidth: 560, margin: "80px auto", textAlign: "center",
    padding: "48px 32px", border: `1px solid ${BORDER}`,
    borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
  },
  successIconWrap: { marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: 700, color: TEXT, margin: "0 0 16px" },
  successBody: { fontSize: 15, color: TEXT, lineHeight: 1.7, margin: "0 0 10px" },
  successSub: { fontSize: 14, color: MUTED, margin: "0 0 20px" },
  successRef: {
    fontSize: 12, color: MUTED, marginBottom: 40,
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  code: {
    background: "#F3F4F6", padding: "2px 8px",
    borderRadius: 4, fontSize: 11, letterSpacing: "0.05em",
  },
  selectionSteps: { textAlign: "left", marginTop: 8 },
  selStep: {
    display: "flex", gap: 20, padding: "20px 0",
    borderTop: `1px solid ${BORDER}`, alignItems: "flex-start",
  },
  selStepNum: { fontSize: 36, fontWeight: 700, color: "#E5E7EB", minWidth: 48, lineHeight: 1 },
  selStepTitle: { fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 4px" },
  selStepDesc: { fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.5 },
};
