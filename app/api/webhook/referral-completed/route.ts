import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  updateUserPoints,
  calculatePointsForRole,
  syncUserToBrevo,
} from "@/lib/automation-service";
import { type Role } from "@/lib/brevo-types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referrerId, referralCode, isLaunchDay = false } = body;

    if (!referrerId) {
      return NextResponse.json(
        { error: "Referrer ID is required" },
        { status: 400 }
      );
    }

    const referrer = await db.user.findUnique({
      where: { id: referrerId },
    });

    if (!referrer) {
      return NextResponse.json({ error: "Referrer not found" }, { status: 404 });
    }

    const pointsToAdd = calculatePointsForRole(
      referrer.role as Role,
      isLaunchDay
    );

    await updateUserPoints(referrerId, pointsToAdd);

    const allUsers = await db.user.findMany({
      orderBy: { points: "desc" },
      select: { id: true },
    });

    for (let i = 0; i < allUsers.length; i++) {
      await db.user.update({
        where: { id: allUsers[i].id },
        data: { rank: i + 1 },
      });
    }

    const updatedReferrer = await db.user.findUnique({
      where: { id: referrerId },
    });

    if (updatedReferrer) {
      await syncUserToBrevo(updatedReferrer.id);
    }

    return NextResponse.json({
      success: true,
      pointsAdded: pointsToAdd,
      newTotal: updatedReferrer?.points || 0,
      rank: updatedReferrer?.rank || 0,
    });
  } catch (error) {
    console.error("Referral completion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
