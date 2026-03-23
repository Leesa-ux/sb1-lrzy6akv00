import { NextRequest, NextResponse } from "next/server";
import { sendBrevoSMS } from "@/lib/brevo-client";
import { generateOtp, putOTP } from "@/lib/otpStore";
import { normalizePhone } from "@/lib/phone-utils";
import { getClientIp } from "@/lib/get-client-ip";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const normalized = normalizePhone(phone);
    if (!normalized) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const belgianPhoneRegex = /^\+32\d{9}$/;
    if (!belgianPhoneRegex.test(normalized)) {
      return NextResponse.json(
        { error: "Invalid Belgian phone number format" },
        { status: 400 }
      );
    }

    const otpCode = generateOtp();
    putOTP(normalized, otpCode, 600);

    const message = `Afroé - Ton code de vérification est: ${otpCode}. Il expire dans 10 minutes.`;

    try {
      await sendBrevoSMS({
        phone: normalized,
        message,
      });
    } catch (smsError) {
      console.error("SMS send error:", smsError);
      return NextResponse.json(
        { error: "Failed to send SMS" },
        { status: 500 }
      );
    }

    const ipAddress = getClientIp(req);

    try {
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
      expiresIn: 600,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
