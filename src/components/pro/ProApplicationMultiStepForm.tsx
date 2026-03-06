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
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    console.log('ProApplicationMultiStepForm rendered, step:', step, 'loading:', loading);
  }, [step, loading]);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    getValues,
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
  const consentAll = watch("consent_missions") && watch("consent_messages") && watch("consent_phone");
  const postalCode = watch("postal_code");
  const city = watch("city");

  // Watch all fields for real-time validation feedback
  const firstName = watch("first_name");
  const lastName = watch("last_name");
  const email = watch("email");
  const phone = watch("phone");
  const dateOfBirth = watch("date_of_birth");
  const workAuthorized = watch("work_authorized");
  const portfolioUrl = watch("portfolio_url");
  const portfolio = watch("portfolio");

  // Update validation errors in real-time
  React.useEffect(() => {
    const errList: string[] = [];

    if (step === 1) {
      if (!firstName?.trim()) errList.push("Prénom manquant");
      if (!lastName?.trim()) errList.push("Nom manquant");
      if (!email?.trim()) errList.push("Email manquant");
      if (!phone?.trim()) errList.push("Téléphone manquant");
      if (!postalCode?.trim() || !/^\d{4}$/.test(postalCode)) errList.push("Code postal invalide");
      if (!city?.trim()) errList.push("Commune manquante");
      if (!dateOfBirth?.trim()) errList.push("Date de naissance manquante");
    } else if (step === 2) {
      if (!certs || certs.length === 0) errList.push("Aucune certification sélectionnée");
      if (!portfolioUrl?.trim()) errList.push("Portfolio URL manquante");
      if (!portfolio || portfolio.length === 0) errList.push("Photos portfolio manquantes");
    }

    setValidationErrors(errList);
  }, [step, firstName, lastName, email, phone, postalCode, city, dateOfBirth, certs, portfolioUrl, portfolio]);

  React.useEffect(() => {
    const normalizedPostalCode = (postalCode || "").trim();
    if (!/^\d{4}$/.test(normalizedPostalCode)) return;

    const matchedCommune = BELGIAN_COMMUNES[normalizedPostalCode];
    if (!matchedCommune) return;

    if (!city?.trim()) {
      setValue("city", matchedCommune, { shouldValidate: true, shouldDirty: true });
    }
  }, [postalCode, city, setValue]);

  const validateStep = async (s: number) => {
    if (s === 1) {
      return trigger([
        "first_name","last_name","email","phone","postal_code",
        "date_of_birth",
        "city","date_of_birth",
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

  const nextStep = () => {
    setStep((p) => Math.min(3, p + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setStep((p) => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

      const dataToSend = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        city: values.city,
        postal_code: values.postal_code,
        address: values.address || "",
        date_of_birth: values.date_of_birth,
        work_authorized: values.work_authorized === "yes",
        certifications: values.certifications,
        portfolio_url: values.portfolio_url,
        media_projects: values.media_projects || "",
        heard_about: values.heard_about || "",
        smartphone_os: values.smartphone_os,
        consent_missions: values.consent_missions,
        consent_messages: values.consent_messages,
        consent_phone: values.consent_phone,
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(dataToSend));

      files.forEach((file) => {
        formData.append("portfolio", file);
      });

      const res = await fetch("/api/pro/apply", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Échec de l'envoi" }));
        toast.error(err.error || "Erreur lors de la soumission");
        return;
      }

      toast.success("Candidature envoyée avec succès !");
      window.location.href = "/success";
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

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
    <div className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm relative">
      <h1 className="text-xl font-semibold text-[#1A1A1A]">Afroé PRO – Formulaire de Candidature</h1>
      <p className="mt-1 text-sm text-gray-600">Formulaire multi-étapes. 3 photos max. Données sécurisées.</p>

      <div className="mt-6 flex items-center gap-2">
        {[1,2,3].map(n => (
          <div key={n} className={`h-2 flex-1 rounded-full ${n <= step ? "bg-[#6D28D9]" : "bg-gray-200"}`} />
        ))}
      </div>
      <div className="mt-2 text-xs text-[#1A1A1A]">Étape {step}/3</div>

      <form className="mt-6 space-y-6 overflow-visible" onSubmit={handleSubmit(onSubmit)}>
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
                <input className="mt-1 w-full rounded-md border p-2"
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
                <label className="text-sm font-medium text-[#1A1A1A]">Commune / Ville</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-200 p-3 focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9] outline-none transition-all"
                  placeholder="Bruxelles, Liège, etc."
                  {...register("city", {
                    required: "Requis"
                  })}
                />
                {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
                <p className="mt-1 text-xs text-gray-500">La commune sera auto-remplie selon votre code postal</p>
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
              <label className="text-sm font-medium">Autorisé(e) à travailler en Belgique?</label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" value="yes" {...register("work_authorized", { required: true })} />
                  <span>Oui</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="no" {...register("work_authorized", { required: true })} />
                  <span>Non</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Certifications / Diplômes (sélection multiple)</label>
              <div className="mt-2 grid grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-md p-3">
                {ALL_PROFESSIONS.map((prof) => (
                  <label key={prof} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      value={prof}
                      {...register("certifications", { required: "Sélectionnez au moins un" })}
                    />
                    <span>{prof}</span>
                  </label>
                ))}
              </div>
              {errors.certifications && <p className="text-xs text-red-600">{errors.certifications.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Portfolio URL (Instagram, site web, etc.)</label>
              <input className="mt-1 w-full rounded-md border p-2"
                {...register("portfolio_url", { required: "Requis" })}
              />
              {errors.portfolio_url && <p className="text-xs text-red-600">{errors.portfolio_url.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Portfolio (1 à 3 photos max, 5Mo chacune)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="mt-1 w-full"
                {...register("portfolio", { required: "Requis" })}
                onChange={handlePortfolioChange}
              />
              {errors.portfolio && <p className="text-xs text-red-600">{errors.portfolio.message}</p>}
              {portfolioPreview.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {portfolioPreview.map((src, i) => (
                    <img key={i} src={src} alt={`Preview ${i+1}`} className="w-24 h-24 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Projets média (optionnel)</label>
              <textarea className="mt-1 w-full rounded-md border p-2" rows={3}
                {...register("media_projects")}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Comment avez-vous entendu parler d'Afroé?</label>
              <input className="mt-1 w-full rounded-md border p-2"
                {...register("heard_about")}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-sm font-semibold">3) Confirmations & Consentements</h2>

            <div>
              <label className="text-sm font-medium">Système d'exploitation de votre smartphone?</label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" value="ios" {...register("smartphone_os", { required: true })} />
                  <span>iOS</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="android" {...register("smartphone_os", { required: true })} />
                  <span>Android</span>
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

        {/* Validation Error Display */}
        {validationErrors.length > 0 && (
          <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs font-semibold text-red-800 mb-1">Erreurs de validation:</p>
            <ul className="text-xs text-red-700 list-disc list-inside space-y-0.5">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-4 flex justify-between border-t">
          <button
            type="button"
            onClick={prevStep}
            className="rounded-md border-2 border-gray-400 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Retour
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={validationErrors.length > 0}
              className="rounded-md bg-[#6D28D9] px-8 py-3 text-base font-bold text-white hover:bg-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[140px]"
            >
              Continuer
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !consentAll}
              className="rounded-md bg-[#6D28D9] px-8 py-3 text-base font-bold text-white hover:bg-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[140px]"
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