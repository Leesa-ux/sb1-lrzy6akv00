import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOTP } from "@/lib/otpStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code, userId } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone number and code are required" },
        { status: 400 }
      );
    }

    const belgianPhoneRegex = /^\+32\d{9}$/;
    if (!belgianPhoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Invalid Belgian phone number format" },
        { status: 400 }
      );
    }

    const result = verifyOTP(phone, code);

    if (!result.ok) {
      let errorMessage = "Invalid verification code";

      switch (result.reason) {
        case "not-found":
          errorMessage = "No verification code found. Please request a new one.";
          break;
        case "expired":
          errorMessage = "Verification code has expired. Please request a new one.";
          break;
        case "too-many-attempts":
          errorMessage = "Too many failed attempts. Please request a new code.";
          break;
        case "mismatch":
          errorMessage = "Invalid verification code. Please try again.";
          break;
      }

      return NextResponse.json(
        { ok: false, error: errorMessage },
        { status: 400 }
      );
    }

    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: {
          phone: phone,
          phoneVerified: true,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Phone number verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
