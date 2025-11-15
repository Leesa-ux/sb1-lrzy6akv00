import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  sendWelcomeEmail,
  syncUserToBrevo,
} from "@/lib/automation-service";
import { getClientIp } from "@/lib/get-client-ip";
import { isTempEmail } from "@/lib/temp-email-domains";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      phone,
      firstName,
      lastName,
      role,
      deviceFingerprint,
      formLoadTime,
      formSubmitTime,
    } = body;

    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: "Email, first name, last name, and role are required" },
        { status: 400 }
      );
    }

    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "unknown";
    const fraudFlags: string[] = [];
    let isBlocked = false;

    if (isTempEmail(email)) {
      console.warn("Blocked temp email:", email);
      return NextResponse.json(
        { error: "Temporary email addresses are not allowed" },
        { status: 403 }
      );
    }

    if (formLoadTime && formSubmitTime) {
      const timeToSubmit = (formSubmitTime - formLoadTime) / 1000;
      if (timeToSubmit < 3) {
        fraudFlags.push("fast_submit");
      }
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentSignupsFromIp = await db.user.count({
      where: {
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentSignupsFromIp >= 3) {
      fraudFlags.push("repeated_ip");
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        phone: phone || null,
        firstName: firstName || null,
        role,
        referralCode,
        points: 0,
        rank: 0,
        refCount: 0,
      },
    });

    await syncUserToBrevo(user.id);
    await sendWelcomeEmail(user.id);

    return NextResponse.json({
      success: true,
      userId: user.id,
      referralCode: user.referralCode,
      refLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://afroe.com"}/waitlist?ref=${user.referralCode}`,
      fraudFlags: fraudFlags.length > 0 ? fraudFlags : undefined,
    });
  } catch (error) {
    console.error("Signup complete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
