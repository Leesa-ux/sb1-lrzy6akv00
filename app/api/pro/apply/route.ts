import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const city = formData.get("city") as string;
    const postal_code = formData.get("postal_code") as string;
    const address = formData.get("address") as string;
    const date_of_birth = formData.get("date_of_birth") as string;
    const emergency_contact_name = formData.get("emergency_contact_name") as string;
    const emergency_contact_phone = formData.get("emergency_contact_phone") as string;

    const work_authorized = formData.get("work_authorized") === "true";
    const certifications = formData.getAll("certifications") as string[];
    const portfolio_url = formData.get("portfolio_url") as string;
    const media_projects = formData.get("media_projects") as string;
    const heard_about = formData.get("heard_about") as string;

    const smartphone_os = formData.get("smartphone_os") as string;
    const consent_missions = formData.get("consent_missions") === "true";
    const consent_messages = formData.get("consent_messages") === "true";
    const consent_phone = formData.get("consent_phone") === "true";

    if (!consent_missions || !consent_messages || !consent_phone) {
      return NextResponse.json(
        { error: "Tous les consentements sont requis" },
        { status: 400 }
      );
    }

    const portfolioFiles = formData.getAll("portfolio") as File[];
    if (portfolioFiles.length < 1 || portfolioFiles.length > 3) {
      return NextResponse.json(
        { error: "Téléchargez 1 à 3 photos de portfolio" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();
    const portfolio_paths: string[] = [];

    for (const file of portfolioFiles) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `pro-portfolios/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("applications")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: `Échec du téléchargement: ${uploadError.message}` },
          { status: 500 }
        );
      }

      portfolio_paths.push(filePath);
    }

    const { data, error } = await supabase
      .from("pro_applications")
      .insert({
        first_name,
        last_name,
        email,
        phone,
        city,
        postal_code,
        address,
        date_of_birth,
        emergency_contact_name,
        emergency_contact_phone,
        work_authorized,
        certifications,
        portfolio_url,
        portfolio_paths,
        media_projects,
        heard_about,
        smartphone_os,
        consent_missions,
        consent_messages,
        consent_phone,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add to Brevo with FIRSTNAME attribute
    if (process.env.BREVO_API_KEY) {
      try {
        await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.BREVO_API_KEY,
          },
          body: JSON.stringify({
            email,
            attributes: {
              FIRSTNAME: first_name,
              LASTNAME: last_name,
              PHONE: phone,
              ROLE: "beautypro",
            },
            listIds: [parseInt(process.env.BREVO_BEAUTY_PRO_LIST_ID || "0")],
            updateEnabled: true,
          }),
        });
      } catch (brevoError) {
        console.error("Brevo contact creation failed:", brevoError);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
