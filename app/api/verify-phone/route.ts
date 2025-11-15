import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBrevoSMS } from "@/lib/brevo-client";
import crypto from "crypto";

const BELGIAN_PHONE_REGEX = /^\+32\d{9}$/;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashPhone(phone: string): string {
  return crypto.createHash("sha256").update(phone.trim()).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { ok: false, reason: "invalid" },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.trim();

    if (!BELGIAN_PHONE_REGEX.test(normalizedPhone)) {
      return NextResponse.json(
        { ok: false, reason: "invalid" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findFirst({
      where: { phone: normalizedPhone },
      select: { id: true, email: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, reason: "duplicate" },
        { status: 200 }
      );
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 2 * 60 * 1000;
    const requestId = crypto.randomBytes(16).toString("hex");

    const smsMessage = `Afroé — Ton code de vérification : ${otp}. Valable 2 min.`;

    try {
      await sendBrevoSMS({
        phone: normalizedPhone,
        message: smsMessage,
      });
    } catch (smsError) {
      console.error("SMS send error:", smsError);
      return NextResponse.json(
        { ok: false, reason: "sms_failed" },
        { status: 500 }
      );
    }

    const { putOTP } = await import("@/lib/otpStore");
    putOTP(normalizedPhone, otp, 120);

    return NextResponse.json({
      ok: true,
      requestId,
      expiresAt,
    });
  } catch (error) {
    console.error("verify-phone error:", error);
    return NextResponse.json(
      { ok: false, reason: "server_error" },
      { status: 500 }
    );
  }
}
