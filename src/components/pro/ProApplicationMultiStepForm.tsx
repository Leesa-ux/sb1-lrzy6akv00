"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BELGIAN_COMMUNES } from "@/lib/belgian-communes";
import { ShieldCheck } from "phosphor-react";

type FormValues = {
  // Section 1
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  postal_code: string;
  address?: string; // Optional
  date_of_birth: string;

  // Section 2
  work_authorized: "yes" | "no";
  certifications: string[];
  certification_files: FileList;
  portfolio_url: string;
  portfolio: FileList;
  media_projects: string;
  heard_about: string;

  // Section 3
  smartphone_os: "ios" | "android";
  consent_missions: boolean;
  consent_messages: boolean;
  consent_phone: boolean;
};

// Nouveaux tags de profession
const EXPERTISE_CAPILLAIRE = [
  "Nappy Specialist",
  "Loctitien.ne",
  "Braider Expert",
  "Master Barber",
  "Coloriste Texturé",
  "Trichologue",
  "Technicien.ne Extensions",
  "Perruquier.re"
];

const BEAUTE_ESTHETIQUE = [
  "Esthéticien.ne",
  "Nail Artist",
  "Make-up Artist (MUA)",
  "Brow & Lash Artist"
];

const ALL_PROFESSIONS = [...EXPERTISE_CAPILLAIRE, ...BEAUTE_ESTHETIQUE];

export function ProApplicationMultiStepForm() {
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [portfolioPreview, setPortfolioPreview] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      certifications: [],
      work_authorized: "yes",
      smartphone_os: "android",
      consent_missions: false,
      consent_messages: false,
      consent_phone: false,
      city: "",
      postal_code: "",
    },
  });

  const certs = watch("certifications");
  const postalCode = watch("postal_code");
  const consentAll = watch("consent_missions") && watch("consent_messages") && watch("consent_phone");

  // Auto-complétion du code postal
  React.useEffect(() => {
    if (postalCode && postalCode.length === 4) {
      const commune = BELGIAN_COMMUNES[postalCode];
      if (commune) {
        setValue("city", commune);
      } else {
        setValue("city", "");
      }
    }
  }, [postalCode, setValue]);

  const validateStep = async (s: number) => {
    if (s === 1) {
      return trigger([
        "first_name","last_name","email","phone","city","postal_code",
        "date_of_birth",
      ]);
    }
    if (s === 2) {
      return trigger([
        "work_authorized","certifications","portfolio_url","portfolio"
      ]);
    }
    if (s === 3) {
      return trigger(["smartphone_os","consent_missions","consent_messages","consent_phone"]);
    }
    return true;
  };

  const next = async () => {
    if (await validateStep(step)) {
      setStep((p) => Math.min(3, p + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const back = () => setStep((p) => Math.max(1, p - 1));

  const onSubmit = async (values: FormValues) => {
    try {
      const ok = await validateStep(3);
      if (!ok) return;

      const files = values.portfolio?.length ? Array.from(values.portfolio) : [];
      if (files.length < 1 || files.length > 3) {
        toast.error("Téléchargez 1 à 3 photos de portfolio.");
        return;
      }

      const maxMb = 5;
      const maxBytes = maxMb * 1024 * 1024;
      for (const f of files) {
        if (f.size > maxBytes) {
          toast.error(`Chaque photo doit être <= ${maxMb}Mo.`);
          return;
        }
      }

      setLoading(true);

      const fd = new FormData();

      fd.append("first_name", values.first_name);
      fd.append("last_name", values.last_name);
      fd.append("email", values.email);
      fd.append("phone", values.phone);
      fd.append("city", values.city);
      fd.append("postal_code", values.postal_code);
      if (values.address) fd.append("address", values.address);
      fd.append("date_of_birth", values.date_of_birth);

      fd.append("work_authorized", values.work_authorized === "yes" ? "true" : "false");
      (values.certifications || []).forEach((c) => fd.append("certifications", c));
      fd.append("portfolio_url", values.portfolio_url);
      fd.append("media_projects", values.media_projects || "");
      fd.append("heard_about", values.heard_about || "");

      files.forEach((f) => fd.append("portfolio", f));

      fd.append("smartphone_os", values.smartphone_os);
      fd.append("consent_missions", values.consent_missions ? "true" : "false");
      fd.append("consent_messages", values.consent_messages ? "true" : "false");
      fd.append("consent_phone", values.consent_phone ? "true" : "false");

      const res = await fetch("/api/pro/apply", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error || "Échec de l'envoi de la candidature");
        return;
      }

      toast.success("Candidature envoyée. Afroé vous contactera bientôt.");
      setStep(1);
    } catch (e: any) {
      toast.error(e?.message || "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  const toggleCert = (label: string) => {
    const current = new Set(certs || []);
    if (current.has(label)) {
      current.delete(label);
    } else {
      current.add(label);
    }
    setValue("certifications", Array.from(current));
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setPortfolioPreview([]);
      return;
    }

    if (files.length > 3) {
      toast.error("Maximum 3 images autorisées");
      return;
    }

    const previews: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setPortfolioPreview(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-[#1A1A1A]">Afroé PRO – Formulaire de Candidature</h1>
      <p className="mt-1 text-sm text-gray-600">Formulaire multi-étapes. 3 photos max. Données sécurisées.</p>

      <div className="mt-6 flex items-center gap-2">
        {[1,2,3].map(n => (
          <div key={n} className={`h-2 flex-1 rounded-full ${n <= step ? "bg-[#6D28D9]" : "bg-gray-200"}`} />
        ))}
      </div>
      <div className="mt-2 text-xs text-[#1A1A1A]">Étape {step}/3</div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-sm font-semibold">1) Informations Personnelles</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Prénom</label>
                <input className="mt-1 w-full rounded-md border p-2"
                  {...register("first_name", { required: "Requis" })}
                />
                {errors.first_name && <p className="text-xs text-red-600">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Nom</label>
                <input className="mt-1 w-full rounded-md border p-2"
                  {...register("last_name", { required: "Requis" })}
                />
                {errors.last_name && <p className="text-xs text-red-600">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input className="mt-1 w-full rounded-md border p-2" type="email"
                  {...register("email", { required: "Requis" })}
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <input className="mt-1 w-full rounded-md border p-2" placeholder="+32 487 123 456"
                  {...register("phone", { required: "Requis" })}
                />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[#1A1A1A]">Code Postal</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-200 p-3 focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9] outline-none transition-all"
                  placeholder="1000"
                  maxLength={4}
                  {...register("postal_code", {
                    required: "Requis",
                    pattern: { value: /^[0-9]{4}$/, message: "4 chiffres requis" }
                  })}
                />
                {errors.postal_code && <p className="text-xs text-red-600">{errors.postal_code.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-[#1A1A1A]">Commune</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-100 bg-gray-50 p-3 text-gray-600 cursor-not-allowed outline-none"
                  placeholder="Se remplit automatiquement..."
                  readOnly
                  {...register("city", { required: "Requis" })}
                />
                {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Date de naissance</label>
              <input className="mt-1 w-full rounded-md border p-3" type="date"
                {...register("date_of_birth", { required: "Requis" })}
              />
              {errors.date_of_birth && <p className="text-xs text-red-600">{errors.date_of_birth.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Adresse complète (optionnel)</label>
              <input className="mt-1 w-full rounded-md border p-3"
                {...register("address")}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-sm font-semibold">2) Informations Professionnelles</h2>

            <div>
              <label className="text-sm font-medium">Autorisé(e) à travailler en Belgique/Europe ?</label>
              <div className="mt-2 flex gap-6 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" value="yes" {...register("work_authorized", { required: true })} />
                  Oui
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="no" {...register("work_authorized", { required: true })} />
                  Non
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Votre Expertise</label>
              <p className="text-xs text-gray-500 mb-3">Sélectionnez une ou plusieurs spécialités</p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Expertise Capillaire</h4>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {EXPERTISE_CAPILLAIRE.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCert(c)}
                        className={`rounded-md border px-3 py-2.5 text-xs text-left transition-all ${
                          (certs || []).includes(c)
                            ? "border-[#6D28D9] bg-[#6D28D9] text-white shadow-sm"
                            : "border-gray-200 bg-white hover:border-[#6D28D9] hover:bg-violet-50"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Beauté & Esthétique</h4>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {BEAUTE_ESTHETIQUE.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCert(c)}
                        className={`rounded-md border px-3 py-2.5 text-xs text-left transition-all ${
                          (certs || []).includes(c)
                            ? "border-[#6D28D9] bg-[#6D28D9] text-white shadow-sm"
                            : "border-gray-200 bg-white hover:border-[#6D28D9] hover:bg-violet-50"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <input type="hidden" {...register("certifications", { validate: (v) => (v && v.length ? true : "Choisissez au moins une expertise") })} />
              {errors.certifications && <p className="text-xs text-red-600 mt-2">{String(errors.certifications.message)}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Upload Certifications/Diplômes (optionnel)</label>
              <p className="text-xs text-gray-500 mb-2">Formats acceptés : PDF, JPG, PNG (5MB max chacun)</p>
              <input
                className="mt-1 w-full rounded-md border p-2 text-sm"
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                multiple
                {...register("certification_files")}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Portfolio (Instagram / site web)</label>
              <input className="mt-1 w-full rounded-md border p-2" placeholder="https://instagram.com/..."
                {...register("portfolio_url", { required: "Requis" })}
              />
              {errors.portfolio_url && <p className="text-xs text-red-600">{errors.portfolio_url.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Upload Portfolio (1 à 3 photos max)</label>
              <p className="text-xs text-gray-500 mb-2">Formats : JPG, PNG, WEBP (5MB max chacune)</p>
              <input
                className="mt-1 w-full rounded-md border p-2 text-sm"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                {...register("portfolio", {
                  required: "Requis",
                  validate: (files) => {
                    const count = files?.length || 0;
                    if (count < 1 || count > 3) return "Téléchargez 1 à 3 photos";
                    return true;
                  }
                })}
                onChange={(e) => {
                  handlePortfolioChange(e);
                  register("portfolio").onChange(e);
                }}
              />
              {errors.portfolio && <p className="text-xs text-red-600 mt-1">{String(errors.portfolio.message)}</p>}

              {portfolioPreview.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {portfolioPreview.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={src} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-[#6D28D9] text-white text-xs px-2 py-0.5 rounded-full">
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Projets médias ? (optionnel)</label>
              <textarea className="mt-1 w-full rounded-md border p-2" rows={3} {...register("media_projects")} />
            </div>

            <div>
              <label className="text-sm font-medium">Comment avez-vous connu Afroé ? (optionnel)</label>
              <input className="mt-1 w-full rounded-md border p-2" {...register("heard_about")} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-sm font-semibold">3) Appareils & Consentements</h2>

            <div>
              <label className="text-sm font-medium">Smartphone</label>
              <div className="mt-2 flex gap-6 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" value="ios" {...register("smartphone_os", { required: true })} />
                  iOS
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="android" {...register("smartphone_os", { required: true })} />
                  Android
                </label>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" {...register("consent_missions", { required: true })} />
                <span>Je comprends que ce travail est basé sur des missions ponctuelles selon la demande client.</span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" {...register("consent_messages", { required: true })} />
                <span>J'accepte de recevoir des messages liés à ma candidature.</span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" {...register("consent_phone", { required: true })} />
                <span>J'accepte d'être contacté(e) par téléphone concernant ma candidature.</span>
              </label>

              {!consentAll && (
                <p className="text-xs text-red-600">Les trois consentements sont requis.</p>
              )}
            </div>
          </div>
        )}

        <div className="sticky bottom-0 z-10 mt-8 flex items-center justify-between border-t bg-white py-4">
          <button
            type="button"
            onClick={back}
            disabled={step === 1 || loading}
            className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Retour
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              disabled={loading}
              className="rounded-md bg-[#6D28D9] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#5B21B6]"
            >
              Continuer
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !consentAll}
              className="rounded-md bg-[#6D28D9] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#5B21B6]"
            >
              {loading ? "Envoi..." : "Soumettre"}
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <ShieldCheck weight="fill" className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
          <p>
            <span className="font-bold text-[#1A1A1A]">Confidentialité garantie.</span><br />
            Vos données sont traitées de manière sécurisée. Nous vous contacterons sous 72 heures après examen.
          </p>
        </div>
      </div>
    </div>
  );
}
