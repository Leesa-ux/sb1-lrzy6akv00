import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone-utils";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yubmsrvzzcrubmshflpk.supabase.co";
const SUPABASE_KEY = process.env.SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code are required" }, { status: 400 });
    }

    const normalized = normalizePhone(phone);
    if (!normalized) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    // Verify against the DB-backed sms_verification_codes table via edge function.
    const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-sms-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ phone: normalized, code: String(code).trim() }),
    });

    const data = await res.json();

    if (!res.ok || !data.verified) {
      return NextResponse.json(
        { error: data.error || "Code incorrect ou expiré", expired: data.expired ?? false },
        { status: res.ok ? 400 : res.status }
      );
    }

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
