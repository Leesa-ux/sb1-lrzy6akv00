import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/get-client-ip";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referralCode, userId, deviceFingerprint } = body;

    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      );
    }

    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "unknown";
    const fraudFlags: string[] = [];
    let isBlocked = false;

    const referrer = await db.user.findUnique({
      where: { referralCode },
      select: { id: true, referralCode: true },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      if (userId === referrer.id) {
        isBlocked = true;
        fraudFlags.push("self_referral");
        console.warn("Self-referral blocked:", userId);
      }
    }

    const recentSignups = await db.user.count({
      where: {
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentSignups >= 1) {
      fraudFlags.push("multiple_referrals_per_hour");
    }

    const shouldGrantPoints = !isBlocked && fraudFlags.length === 0;

    return NextResponse.json({
      success: true,
      referrerId: referrer.id,
      pointsGranted: shouldGrantPoints,
      fraudFlags: fraudFlags.length > 0 ? fraudFlags : undefined,
      delayPoints: fraudFlags.includes("multiple_referrals_per_hour"),
    });
  } catch (error) {
    console.error("Referral track error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
