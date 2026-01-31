"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormValues = {
  // Section 1
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  postal_code: string;
  address: string;
  date_of_birth: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;

  // Section 2
  work_authorized: "yes" | "no";
  certifications: string[];
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

const CITIES = ["Bruxelles", "Anvers", "Liège", "Gand", "Charleroi", "Autre"];
const CERTS = ["Coiffure", "Esthétique", "Onglerie", "Massage", "Maquillage", "Aucun"];

export function ProApplicationMultiStepForm() {
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

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
      city: "Bruxelles",
    },
  });

  const certs = watch("certifications");
  const consentAll = watch("consent_missions") && watch("consent_messages") && watch("consent_phone");

  const validateStep = async (s: number) => {
    if (s === 1) {
      return trigger([
        "first_name","last_name","email","phone","city","postal_code","address",
        "date_of_birth","emergency_contact_name","emergency_contact_phone",
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
    const ok = await validateStep(step);
    if (!ok) return;
    setStep((p) => Math.min(3, p + 1));
  };

  const back = () => setStep((p) => Math.max(1, p - 1));

  const onSubmit = async (values: FormValues) => {
    try {
      const ok = await validateStep(3);
      if (!ok) return;

      const files = values.portfolio?.length ? Array.from(values.portfolio) : [];
      if (files.length < 1 || files.length > 3) {
        toast.error("Upload 1 to 3 portfolio photos.");
        return;
      }

      const maxMb = 5;
      const maxBytes = maxMb * 1024 * 1024;
      for (const f of files) {
        if (f.size > maxBytes) {
          toast.error(`Each photo must be <= ${maxMb}MB (MVP limit).`);
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
      fd.append("address", values.address);
      fd.append("date_of_birth", values.date_of_birth);
      fd.append("emergency_contact_name", values.emergency_contact_name);
      fd.append("emergency_contact_phone", values.emergency_contact_phone);

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
        toast.error(json?.error || "Submission failed");
        return;
      }

      toast.success("Candidature envoyée. Afroé vous contactera bientôt.");
      setStep(1);
    } catch (e: any) {
      toast.error(e?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const toggleCert = (label: string) => {
    const current = new Set(certs || []);
    if (label === "Aucun") {
      setValue("certifications", ["Aucun"]);
      return;
    }
    if (current.has("Aucun")) current.delete("Aucun");
    if (current.has(label)) current.delete(label);
    else current.add(label);
    setValue("certifications", Array.from(current));
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Afroé PRO – Formulaire de Candidature</h1>
      <p className="mt-1 text-sm text-gray-600">Formulaire multi-étapes. 3 photos max. Données sécurisées.</p>

      <div className="mt-6 flex items-center gap-2">
        {[1,2,3].map(n => (
          <div key={n} className={`h-2 flex-1 rounded-full ${n <= step ? "bg-black" : "bg-gray-200"}`} />
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">Étape {step}/3</div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-sm font-semibold">1) Informations Personnelles</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Prénom</label>
                <input className="mt-1 w-full rounded-md border p-2"
                  {...register("first_name", { required: "Required" })}
                />
                {errors.first_name && <p className="text-xs text-red-600">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Nom</label>
                <input className="mt-1 w-full rounded-md border p-2"
                  {...register("last_name", { required: "Required" })}
                />
                {errors.last_name && <p className="text-xs text-red-600">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input className="mt-1 w-full rounded-md border p-2" type="email"
                  {...register("email", { required: "Required" })}
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <input className="mt-1 w-full rounded-md border p-2" placeholder="+32 487 123 456"
                  {...register("phone", { required: "Required" })}
                />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Ville</label>
                <select className="mt-1 w-full rounded-md border p-2" {...register("city", { required: "Required" })}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Code postal</label>
                <input className="mt-1 w-full rounded-md border p-2" placeholder="1000"
                  {...register("postal_code", { required: "Required", pattern: { value: /^[0-9]{4}$/, message: "4 digits" } })}
                />
                {errors.postal_code && <p className="text-xs text-red-600">{errors.postal_code.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Date de naissance</label>
                <input className="mt-1 w-full rounded-md border p-2" type="date"
                  {...register("date_of_birth", { required: "Required" })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Adresse complète</label>
              <input className="mt-1 w-full rounded-md border p-2"
                {...register("address", { required: "Required" })}
              />
              {errors.address && <p className="text-xs text-red-600">{errors.address.message}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Contact d'urgence (nom)</label>
                <input className="mt-1 w-full rounded-md border p-2"
                  {...register("emergency_contact_name", { required: "Required" })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact d'urgence (téléphone)</label>
                <input className="mt-1 w-full rounded-md border p-2"
                  {...register("emergency_contact_phone", { required: "Required" })}
                />
              </div>
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
              <label className="text-sm font-medium">Certification/Diplôme</label>
              <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                {CERTS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCert(c)}
                    className={`rounded-md border px-3 py-2 text-sm text-left ${
                      (certs || []).includes(c) ? "border-black bg-black text-white" : "bg-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input type="hidden" {...register("certifications", { validate: (v) => (v && v.length ? true : "Pick at least one") })} />
              {errors.certifications && <p className="text-xs text-red-600">{String(errors.certifications.message)}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Portfolio (Instagram / site web)</label>
              <input className="mt-1 w-full rounded-md border p-2" placeholder="https://instagram.com/..."
                {...register("portfolio_url", { required: "Required" })}
              />
              {errors.portfolio_url && <p className="text-xs text-red-600">{errors.portfolio_url.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Upload 1–3 photos (MVP: 5MB max chacune)</label>
              <input
                className="mt-1 w-full rounded-md border p-2"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                {...register("portfolio", {
                  required: "Required",
                  validate: (files) => {
                    const count = files?.length || 0;
                    if (count < 1 || count > 3) return "Upload 1 to 3 photos";
                    return true;
                  }
                })}
              />
              {errors.portfolio && <p className="text-xs text-red-600">{String(errors.portfolio.message)}</p>}
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
                <p className="text-xs text-red-600">All three consents are required.</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={back}
            disabled={step === 1 || loading}
            className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
          >
            Retour
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              disabled={loading}
              className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              Continuer
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !consentAll}
              className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Soumettre ma candidature"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
