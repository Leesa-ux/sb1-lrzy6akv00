import { NextRequest, NextResponse } from "next/server";

const BELGIAN_PHONE_REGEX = /^\+32\d{9}$/;

function normalizePhone(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('32') && cleaned.length === 11) return `+${cleaned}`;
  if (cleaned.startsWith('04') && cleaned.length === 10) return `+32${cleaned.substring(1)}`;
  if (cleaned.startsWith('4') && cleaned.length === 9) return `+32${cleaned}`;
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone.trim());
    if (!normalizedPhone || !BELGIAN_PHONE_REGEX.test(normalizedPhone)) {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }

    // Delegate to the Supabase edge function which stores the code in the DB
    // so that /api/verify-code (which calls verify-sms-code edge fn) can find it.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yubmsrvzzcrubmshflpk.supabase.co";
    const res = await fetch(`${supabaseUrl}/functions/v1/send-sms-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: normalizedPhone }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      return NextResponse.json({ ok: false, reason: data.error || "sms_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, expiresAt: data.expiresAt });
  } catch (error) {
    console.error("verify-phone error:", error);
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}
