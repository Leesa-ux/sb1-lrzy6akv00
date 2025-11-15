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
    const { referrerId, referredUserId, milestoneType, isLaunchDay = false } = body;

    if (!referrerId || !referredUserId) {
      return NextResponse.json(
        { error: "Referrer ID and referred user ID are required" },
        { status: 400 }
      );
    }

    const referrer = await db.user.findUnique({
      where: { id: referrerId },
    });

    const referredUser = await db.user.findUnique({
      where: { id: referredUserId },
    });

    if (!referrer) {
      return NextResponse.json({ error: "Referrer not found" }, { status: 404 });
    }

    if (!referredUser) {
      return NextResponse.json({ error: "Referred user not found" }, { status: 404 });
    }

    const pointsToAdd = calculatePointsForRole(
      referrer.role as Role,
      isLaunchDay
    );

    await updateUserPoints(referrerId, pointsToAdd);

    await db.user.update({
      where: { id: referrerId },
      data: { referralValidated: true },
    });

    await db.user.update({
      where: { id: referredUserId },
      data: { referralValidated: true },
    });

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
      milestoneType: milestoneType || "unknown",
      referralValidated: true,
    });
  } catch (error) {
    console.error("Referral completion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
