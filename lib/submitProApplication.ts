export async function submitProApplication(formData: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  services_offered: string[];
  consent_missions: boolean;
  consent_messages: boolean;
  consent_phone_call?: boolean;
}) {
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
