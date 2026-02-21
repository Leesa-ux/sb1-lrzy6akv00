"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type Platform = "instagram" | "tiktok" | "youtube" | "other";
type Niche = "hair" | "nails" | "skincare" | "lifestyle" | "other";

type FormValues = {
  first_name: string;
  last_name: string;
  email: string;
  platform: Platform;
  handle?: string;
  profile_url: string;
  followers_count: number;

  city?: string;
  niche?: Niche;
  notes?: string;

  consent: boolean;
  media?: FileList;
};

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const ALLOWED_MIME = new Set(["application/pdf", "image/png", "image/jpeg"]);

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function AmbassadorApplicationForm() {
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      platform: "instagram",
      followers_count: 2000,
      consent: false,
      niche: "other",
    },
    mode: "onSubmit",
  });

  const consent = watch("consent");

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      if (!isValidUrl(values.profile_url)) {
        toast.error("L'URL du profil n'est pas valide.");
        return;
      }

      const file = values.media?.[0];
      if (file) {
        if (file.size > MAX_BYTES) {
          toast.error(`Fichier trop volumineux. Max ${MAX_MB} Mo.`);
          return;
        }
        if (!ALLOWED_MIME.has(file.type)) {
          toast.error("Type de fichier invalide. Utilisez PDF, PNG ou JPG.");
          return;
        }
      }

      const formData = new FormData();
      formData.append("full_name", `${values.first_name.trim()} ${values.last_name.trim()}`);
      formData.append("email", values.email.trim());
      formData.append("platform", values.platform);
      if (values.handle) formData.append("handle", values.handle.trim());
      formData.append("profile_url", values.profile_url.trim());
      formData.append("followers_count", String(values.followers_count || 0));
      if (values.city) formData.append("city", values.city.trim());
      if (values.niche) formData.append("niche", values.niche);
      if (values.notes) formData.append("notes", values.notes.trim());
      formData.append("consent", String(values.consent));
      if (file) formData.append("media", file);

      const res = await fetch("/api/ambassadors/apply", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Échec de l'envoi de la candidature");
        return;
      }

      toast.success("Candidature envoyée ✅");
      reset({
        platform: "instagram",
        followers_count: 2000,
        consent: false,
        niche: "other",
      });
    } catch (e: any) {
      toast.error(e?.message || "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Prénom</Label>
          <Input
            placeholder="Votre prénom"
            {...register("first_name", { required: "Requis" })}
          />
          {errors.first_name && (
            <p className="text-sm text-red-500">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Nom</Label>
          <Input
            placeholder="Votre nom"
            {...register("last_name", { required: "Requis" })}
          />
          {errors.last_name && (
            <p className="text-sm text-red-500">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          placeholder="vous@email.com"
          {...register("email", {
            required: "Requis",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Email invalide",
            },
          })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Plateforme</Label>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            {...register("platform", { required: "Requis" })}
          >
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="other">Autre</option>
          </select>
          {errors.platform && (
            <p className="text-sm text-red-500">{errors.platform.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Pseudo (optionnel)</Label>
          <Input placeholder="@votrepseudo" {...register("handle")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>URL du profil</Label>
        <Input
          placeholder="https://instagram.com/..."
          {...register("profile_url", {
            required: "Requis",
            validate: (v) => isValidUrl(v) || "URL invalide",
          })}
        />
        {errors.profile_url && (
          <p className="text-sm text-red-500">{errors.profile_url.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Nombre d'abonnés</Label>
          <Input
            type="number"
            placeholder="2000"
            {...register("followers_count", {
              valueAsNumber: true,
              min: { value: 0, message: "Doit être >= 0" },
              required: "Requis",
            })}
          />
          {errors.followers_count && (
            <p className="text-sm text-red-500">
              {errors.followers_count.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Niche (optionnel)</Label>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            {...register("niche")}
          >
            <option value="hair">Cheveux</option>
            <option value="nails">Ongles</option>
            <option value="skincare">Soins de la peau</option>
            <option value="lifestyle">Style de vie</option>
            <option value="other">Autre</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Ville (optionnel)</Label>
        <Input placeholder="Bruxelles / Anvers / ..." {...register("city")} />
      </div>

      <div className="space-y-2">
        <Label>Kit média / statistiques (PDF/PNG/JPG, max 5 Mo)</Label>
        <Input
          type="file"
          accept=".pdf,image/png,image/jpeg"
          {...register("media")}
        />
        <p className="text-xs text-muted-foreground">
          Optionnel. Si vous téléchargez, gardez-le sous {MAX_MB} Mo.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Notes (optionnel)</Label>
        <textarea
          className="min-h-[90px] w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Parlez-nous de votre activité, votre audience, vos collaborations passées..."
          {...register("notes")}
        />
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          checked={consent}
          onCheckedChange={(v) => setValue("consent", Boolean(v))}
        />
        <div className="text-sm">
          J'accepte d'être contacté par Afroé concernant ce partenariat ambassadeur.
          {!consent && (
            <div className="text-xs text-muted-foreground mt-1">Requis.</div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading || !consent}>
        {loading ? "Envoi en cours..." : "Postuler comme ambassadeur"}
      </Button>
    </form>
  );
}
