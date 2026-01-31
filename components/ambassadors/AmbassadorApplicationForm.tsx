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
  full_name: string;
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
        toast.error("Profile URL is not valid.");
        return;
      }

      const file = values.media?.[0];
      if (file) {
        if (file.size > MAX_BYTES) {
          toast.error(`File too large. Max ${MAX_MB}MB.`);
          return;
        }
        if (!ALLOWED_MIME.has(file.type)) {
          toast.error("Invalid file type. Use PDF, PNG, or JPG.");
          return;
        }
      }

      const formData = new FormData();
      formData.append("full_name", values.full_name.trim());
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
        toast.error(json.error || "Failed to submit application");
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
      toast.error(e?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label>Full name</Label>
        <Input
          placeholder="Your name"
          {...register("full_name", { required: "Required" })}
        />
        {errors.full_name && (
          <p className="text-sm text-red-500">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          placeholder="you@email.com"
          {...register("email", {
            required: "Required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email",
            },
          })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Platform</Label>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            {...register("platform", { required: "Required" })}
          >
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="other">Other</option>
          </select>
          {errors.platform && (
            <p className="text-sm text-red-500">{errors.platform.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Handle (optional)</Label>
          <Input placeholder="@yourhandle" {...register("handle")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Profile URL</Label>
        <Input
          placeholder="https://instagram.com/..."
          {...register("profile_url", {
            required: "Required",
            validate: (v) => isValidUrl(v) || "Invalid URL",
          })}
        />
        {errors.profile_url && (
          <p className="text-sm text-red-500">{errors.profile_url.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Followers count</Label>
          <Input
            type="number"
            placeholder="2000"
            {...register("followers_count", {
              valueAsNumber: true,
              min: { value: 0, message: "Must be >= 0" },
              required: "Required",
            })}
          />
          {errors.followers_count && (
            <p className="text-sm text-red-500">
              {errors.followers_count.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Niche (optional)</Label>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            {...register("niche")}
          >
            <option value="hair">Hair</option>
            <option value="nails">Nails</option>
            <option value="skincare">Skincare</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>City (optional)</Label>
        <Input placeholder="Brussels / Antwerp / ..." {...register("city")} />
      </div>

      <div className="space-y-2">
        <Label>Media kit / analytics (PDF/PNG/JPG, max 5MB)</Label>
        <Input
          type="file"
          accept=".pdf,image/png,image/jpeg"
          {...register("media")}
        />
        <p className="text-xs text-muted-foreground">
          Optional. If you upload, keep it under {MAX_MB}MB.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <textarea
          className="min-h-[90px] w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Tell us what you do, your audience, past collabs..."
          {...register("notes")}
        />
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          checked={consent}
          onCheckedChange={(v) => setValue("consent", Boolean(v))}
        />
        <div className="text-sm">
          I agree to be contacted by Afroé about this ambassador partnership.
          {!consent && (
            <div className="text-xs text-muted-foreground mt-1">Required.</div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading || !consent}>
        {loading ? "Submitting..." : "Apply as Ambassador"}
      </Button>
    </form>
  );
}
