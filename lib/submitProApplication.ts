export interface ProApplicationPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  postal_code?: string;
  full_address?: string;
  date_of_birth?: string;
  portfolio_url?: string;
  media_projects?: string;
  smartphone?: "ios" | "android" | "other";
  work_authorized?: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  heard_about?: string;
  services_offered: string[];
  certifications: string[];
  consent_missions: boolean;
  consent_messages: boolean;
  consent_phone_call?: boolean;
}

export async function submitProApplication(formData: ProApplicationPayload) {
  const res = await fetch(
    "https://yubmsrvzzcrubmshflpk.supabase.co/functions/v1/submit-pro-application",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    }
  );

  const data = await res.json();
  return data;
}
