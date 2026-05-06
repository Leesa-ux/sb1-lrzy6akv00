import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone-utils";
import { getClientIp } from "@/lib/get-client-ip";
import { getSupabaseClient } from "@/lib/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yubmsrvzzcrubmshflpk.supabase.co";
const SUPABASE_KEY = process.env.SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const normalized = normalizePhone(phone);
    if (!normalized) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    const belgianPhoneRegex = /^\+32\d{9}$/;
    if (!belgianPhoneRegex.test(normalized)) {
      return NextResponse.json({ error: "Invalid Belgian phone number format" }, { status: 400 });
    }

    // Delegate to the edge function — stores code in sms_verification_codes table,
    // stable across all serverless instances (no in-memory store).
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-sms-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ phone: normalized }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      console.error("send-sms-code edge fn error:", data);
      return NextResponse.json({ error: data.error || "Failed to send SMS" }, { status: 500 });
    }

    // Log IP activity (non-blocking)
    try {
      const supabase = getSupabaseClient();
      const ipAddress = getClientIp(req);
      await supabase.from("ip_activity").insert({
        ip_address: ipAddress,
        action_type: "sms_sent",
        metadata: { phone: normalized },
      });
    } catch (dbError) {
      console.error("ip_activity insert error:", dbError);
    }

    return NextResponse.json({
      success: true,
      message: "Code SMS envoyé",
      expiresAt: data.expiresAt,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
