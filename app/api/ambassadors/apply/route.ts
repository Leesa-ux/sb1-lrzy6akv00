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

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const full_name = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const platform = formData.get("platform") as string;
    const handle = formData.get("handle") as string | null;
    const profile_url = formData.get("profile_url") as string;
    const followers_count = parseInt(formData.get("followers_count") as string, 10);
    const city = formData.get("city") as string | null;
    const niche = formData.get("niche") as string | null;
    const notes = formData.get("notes") as string | null;
    const consent = formData.get("consent") === "true";
    const mediaFile = formData.get("media") as File | null;

    if (!full_name || !email || !platform || !profile_url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Consent is required" },
        { status: 400 }
      );
    }

    // Split full_name into first and last name for Brevo
    const nameParts = full_name.trim().split(" ");
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    const supabase = supabaseAdmin();
    let media_path: string | null = null;

    if (mediaFile && mediaFile.size > 0) {
      if (mediaFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large. Maximum 5MB allowed." },
          { status: 400 }
        );
      }

      if (!ALLOWED_TYPES.has(mediaFile.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Use PDF, PNG, or JPG." },
          { status: 400 }
        );
      }

      const timestamp = Date.now();
      const sanitizedName = mediaFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `ambassador-media/${timestamp}-${sanitizedName}`;

      const arrayBuffer = await mediaFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("applications")
        .upload(fileName, buffer, {
          contentType: mediaFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("File upload error:", uploadError);
        console.warn("Continuing without file upload - storage bucket may not exist");
        media_path = null;
      } else {
        media_path = fileName;
      }
    }

    const { data, error } = await supabase
      .from("ambassador_applications")
      .insert({
        full_name,
        email,
        platform,
        handle: handle || null,
        profile_url,
        followers_count: followers_count || 0,
        city: city || null,
        niche: niche || null,
        notes: notes || null,
        media_path,
        consent,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to save application" },
        { status: 500 }
      );
    }

    // Add to Brevo with FIRSTNAME and LASTNAME attributes
    try {
      const BREVO_API_KEY = process.env.BREVO_API_KEY;
      const BREVO_API_URL = "https://api.brevo.com/v3";

      if (BREVO_API_KEY) {
        const response = await fetch(`${BREVO_API_URL}/contacts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": BREVO_API_KEY,
          },
          body: JSON.stringify({
            email,
            attributes: {
              FIRSTNAME: first_name,
              LASTNAME: last_name,
              PLATFORM: platform,
              HANDLE: handle || "",
              PROFILE_URL: profile_url,
              FOLLOWERS: followers_count,
              CITY: city || "",
              NICHE: niche || "",
              APP_TYPE: "ambassador",
            },
            listIds: [10], // Ambassador list ID - adjust as needed
            updateEnabled: true,
          }),
        });

        if (!response.ok && response.status !== 400) {
          const error = await response.text();
          console.error("Brevo API error:", error);
        }
      }
    } catch (brevoError) {
      console.error("Brevo integration failed (non-critical):", brevoError);
      // Continue even if Brevo fails - the application is already saved
    }

    return NextResponse.json({
      success: true,
      data: { id: data.id },
    });
  } catch (error: any) {
    console.error("Ambassador application error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
