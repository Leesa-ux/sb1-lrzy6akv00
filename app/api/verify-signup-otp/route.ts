import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otpStore";
import { normalizePhone } from "@/lib/phone-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone and code are required" },
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

    const isValid = verifyOTP(normalized, code);

    if (!isValid) {
      return NextResponse.json(
        { error: "Code incorrect ou expiré" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
