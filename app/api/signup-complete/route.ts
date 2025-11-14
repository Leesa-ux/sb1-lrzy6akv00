import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  sendWelcomeEmail,
  syncUserToBrevo,
} from "@/lib/automation-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, firstName, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const user = await db.user.create({
      data: {
        email,
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
    });
  } catch (error) {
    console.error("Signup complete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
