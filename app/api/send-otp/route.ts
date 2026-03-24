import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_FUNCTION_URL =
  "https://yubmsrvzzcrubmshflpk.supabase.co/functions/v1/send-sms-code";

export async function POST(request: Request) {
  console.log("[SEND-OTP] route hit");

  try {
    const body = await request.json();
    console.log("[SEND-OTP] body received:", JSON.stringify(body));

    const { phone, email, role } = body;

    if (!phone) {
      console.log("[SEND-OTP] missing phone");
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    console.log("[SEND-OTP] calling Supabase send-sms-code for", phone);

    const res = await fetch(SUPABASE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, email, role }),
    });

    const rawText = await res.text();
    console.log("[SEND-OTP] Supabase status:", res.status);
    console.log("[SEND-OTP] Supabase response:", rawText);

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("[SEND-OTP] Supabase returned non-JSON");
      return NextResponse.json(
        { error: "Invalid response from SMS service" },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[SEND-OTP] route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
