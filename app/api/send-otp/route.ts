import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBrevoSMS } from "@/lib/brevo-client";
import { generateOtp, putOTP } from "@/lib/otpStore";
import { getClientIp } from "@/lib/get-client-ip";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, userId } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
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

    const ipAddress = getClientIp(req);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, points: true, rank: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      if (user.points < 100 && user.rank > 10) {
        return NextResponse.json(
          { error: "Phone verification not required yet" },
          { status: 403 }
        );
      }
    }

    const otpCode = generateOtp();
    putOTP(phone, otpCode, 600);

    const message = `Afroé - Ton code de vérification est: ${otpCode}. Il expire dans 10 minutes.`;

    try {
      await sendBrevoSMS({
        phone,
        message,
      });
    } catch (smsError) {
      console.error("SMS send error:", smsError);
      return NextResponse.json(
        { error: "Failed to send SMS" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
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
