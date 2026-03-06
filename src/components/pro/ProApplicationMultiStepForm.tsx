"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BELGIAN_COMMUNES } from "@/lib/belgian-communes";
import { ShieldCheck } from "phosphor-react";

type FormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  postal_code: string;
  date_of_birth: string;
  certifications: string[];
  portfolio_url: string;
  portfolio: FileList;
  consent_missions: boolean;
  consent_messages: boolean;
};

const ALL_PROFESSIONS = [
  "Nappy Specialist",
  "Loctitien.ne",
  "Braider Expert",
  "Master Barber",
  "Coloriste Texturé",
  "Trichologue",
  "Technicien.ne Extensions",
  "Perruquier.re",
  "Esthéticien.ne",
  "Nail Artist",
  "Make-up Artist (MUA)",
  "Brow & Lash Artist",
];

export function ProApplicationMultiStepForm() {

  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [portfolioPreview, setPortfolioPreview] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
  } = useForm<FormValues>({
    defaultValues: {
      certifications: [],
      city: "",
      postal_code: "",
    },
  });

  const postalCode = watch("postal_code");
  const city = watch("city");

  React.useEffect(() => {
    const code = (postalCode || "").trim();
    if (/^\d{4}$/.test(code) && BELGIAN_COMMUNES[code] && !city) {
      setValue("city", BELGIAN_COMMUNES[code]);
    }
  }, [postalCode, city, setValue]);

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const files = e.target.files;
    if (!files) return;

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

  const nextStep = async () => {

    const valid = await trigger();

    if (!valid) {
      toast.error("Veuillez compléter les champs obligatoires.");
      return;
    }

    setStep((s) => s + 1);

  };

  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (values: FormValues) => {

    setLoading(true);

    console.log(values);

    toast.success("Candidature envoyée !");

    setLoading(false);

  };

  return (

    <div className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">

      <h1 className="text-xl font-semibold text-[#1A1A1A]">
        Afroé PRO – Formulaire de Candidature
      </h1>

      <p className="mt-1 text-sm text-gray-600">
        Étape {step}/3 – Données sécurisées
      </p>

      <div className="mt-6 flex gap-2">
        {[1,2,3].map(n => (
          <div
            key={n}
            className={`h-2 flex-1 rounded-full ${n <= step ? "bg-purple-700" : "bg-gray-200"}`}
          />
        ))}
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>

        {step === 1 && (

          <div className="space-y-4">

            <h2 className="font-bold">
              1) Informations Personnelles
            </h2>

            <div className="grid grid-cols-2 gap-4">

              <input
                {...register("first_name",{required:true})}
                placeholder="Prénom"
                className="border p-2 rounded"
              />

              <input
                {...register("last_name",{required:true})}
                placeholder="Nom"
                className="border p-2 rounded"
              />

            </div>

            <input
              {...register("email",{required:true})}
              placeholder="Email"
              className="w-full border p-2 rounded"
            />

            <input
              {...register("phone",{required:true})}
              placeholder="Téléphone"
              className="w-full border p-2 rounded"
            />

            <div className="grid grid-cols-2 gap-4">

              <input
                {...register("postal_code")}
                placeholder="Code Postal"
                className="border p-2 rounded"
              />

              <input
                {...register("city")}
                placeholder="Ville"
                className="border p-2 rounded"
              />

            </div>

            <input
              type="date"
              {...register("date_of_birth")}
              className="w-full border p-2 rounded"
            />

          </div>
        )}

        {step === 2 && (

          <div className="space-y-4">

            <h2 className="font-bold">
              2) Informations Professionnelles
            </h2>

            <label className="text-sm">
              Certifications
            </label>

            <div className="grid grid-cols-2 gap-2 border p-3 rounded max-h-40 overflow-y-auto">

              {ALL_PROFESSIONS.map(p => (

                <label key={p} className="flex gap-2 text-xs">

                  <input
                    type="checkbox"
                    value={p}
                    {...register("certifications")}
                  />

                  {p}

                </label>

              ))}

            </div>

            <input
              {...register("portfolio_url")}
              placeholder="Lien Instagram / Portfolio"
              className="w-full border p-2 rounded"
            />

            <input
              type="file"
              multiple
              onChange={handlePortfolioChange}
              className="w-full text-sm"
            />

            {portfolioPreview.length > 0 && (

              <div className="grid grid-cols-3 gap-2">

                {portfolioPreview.map((img,i)=>(
                  <img
                    key={i}
                    src={img}
                    className="rounded object-cover h-20 w-full"
                  />
                ))}

              </div>

            )}

          </div>
        )}

        {step === 3 && (

          <div className="space-y-4">

            <h2 className="font-bold">
              3) Finalisation
            </h2>

            <div className="space-y-2 border p-4 rounded bg-gray-50">

              <label className="flex gap-2 text-sm">
                <input {...register("consent_missions")} type="checkbox"/>
                Missions ponctuelles
              </label>

              <label className="flex gap-2 text-sm">
                <input {...register("consent_messages")} type="checkbox"/>
                Contact par message
              </label>

            </div>

          </div>
        )}

        <div className="flex flex-col gap-3 pt-6">

          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="w-full py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold"
            >
              Retour
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="w-full py-4 rounded-xl bg-purple-700 text-white font-bold"
            >
              Continuer
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-green-600 text-white font-bold"
            >
              Soumettre ma candidature
            </button>
          )}

        </div>

      </form>

      <div className="mt-8 pt-4 border-t flex gap-3 text-xs text-gray-500">

        <ShieldCheck size={20} className="text-green-600"/>

        <p>
          <b>Confidentialité garantie.</b> Vos données sont sécurisées.
        </p>

      </div>

    </div>
  );
}