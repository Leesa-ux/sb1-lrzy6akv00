import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizePhone } from "@/lib/phone-utils";
import { getClientIp } from "@/lib/get-client-ip";

const VOIP_BURNER_PREFIXES = [
  "+3246", "+3247", "+3248", "+3249",
  "+32460", "+32461", "+32462", "+32463", "+32464", "+32465",
  "+32466", "+32467", "+32468", "+32469",
  "+32470", "+32471", "+32472", "+32473", "+32474", "+32475",
  "+32476", "+32477", "+32478", "+32479",
  "+32480", "+32481", "+32482", "+32483", "+32484", "+32485",
  "+32486", "+32487", "+32488", "+32489",
  "+32490", "+32491", "+32492", "+32493", "+32494", "+32495",
  "+32496", "+32497", "+32498", "+32499"
];

function isLikelyBurnerOrVoip(phone: string): boolean {
  for (const prefix of VOIP_BURNER_PREFIXES) {
    if (phone.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
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
        { error: "Only Belgian phone numbers are accepted" },
        { status: 400 }
      );
    }

    if (isLikelyBurnerOrVoip(normalized)) {
      return NextResponse.json(
        {
          canUse: false,
          reason: "burner_voip",
          message: "Ce numéro ne peut pas être utilisé."
        },
        { status: 200 }
      );
    }

    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("phone", normalized)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Database error:", checkError);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        {
          canUse: false,
          reason: "already_used",
          message: "Ce numéro ne peut pas être utilisé."
        },
        { status: 200 }
      );
    }

    const ipAddress = getClientIp(req);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: recentSms, error: smsCheckError } = await supabase
      .from("ip_activity")
      .select("id")
      .eq("ip_address", ipAddress)
      .eq("action_type", "sms_sent")
      .gte("created_at", oneHourAgo);

    if (smsCheckError) {
      console.error("IP activity check error:", smsCheckError);
    }

    if (recentSms && recentSms.length >= 5) {
      return NextResponse.json(
        {
          canUse: false,
          reason: "sms_abuse",
          message: "Ce numéro ne peut pas être utilisé."
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      canUse: true,
      normalized
    });
  } catch (error) {
    console.error("Phone verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
