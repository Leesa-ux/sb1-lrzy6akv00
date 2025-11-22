/**
 * ADMIN ENDPOINT: Recalculate Final Points at Launch
 *
 * This endpoint should be called at launch time to:
 * 1. Recalculate finalPoints for all users based on validation counters
 * 2. Update ranks based on finalPoints
 * 3. Mark prize eligibility (jackpot and rank #1)
 *
 * IMPORTANT: This endpoint should be protected by authentication in production!
 * For now, it requires an admin secret key in the Authorization header.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateFinalPoints, isEligibleForJackpot } from "@/lib/points";

export async function POST(req: NextRequest) {
  try {
    // SIMPLE AUTH: Check for admin secret
    const authHeader = req.headers.get("authorization");
    const adminSecret = process.env.ADMIN_SECRET_KEY;

    if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized - invalid admin key" },
        { status: 401 }
      );
    }

    console.log("🚀 Starting final points recalculation at launch...");

    // STEP 1: Get all users
    const users = await db.user.findMany();
    console.log(`📊 Found ${users.length} users to process`);

    // STEP 2: Recalculate finalPoints for each user
    const updates = [];
    for (const user of users) {
      const userData = {
        waitlistClients: user.waitlistClients,
        waitlistInfluencers: user.waitlistInfluencers,
        waitlistPros: user.waitlistPros,
        appDownloads: user.appDownloads,
        validatedInfluencers: user.validatedInfluencers,
        validatedPros: user.validatedPros,
        earlyBirdBonus: user.earlyBirdBonus
      };

      const finalPoints = calculateFinalPoints(userData);
      const eligible = isEligibleForJackpot(finalPoints);

      updates.push({
        id: user.id,
        finalPoints,
        eligibleForJackpot: eligible
      });
    }

    console.log(`✅ Calculated final points for all users`);

    // STEP 3: Sort users by finalPoints (desc) and createdAt (asc) for tie-breaking
    updates.sort((a, b) => {
      if (b.finalPoints !== a.finalPoints) {
        return b.finalPoints - a.finalPoints;
      }
      // Tie-breaker: find original user to compare createdAt
      const userA = users.find(u => u.id === a.id);
      const userB = users.find(u => u.id === b.id);
      if (userA && userB) {
        return userA.createdAt.getTime() - userB.createdAt.getTime();
      }
      return 0;
    });

    // STEP 4: Assign ranks and mark top rank
    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      const rank = i + 1;
      const isTopRank = rank === 1;

      await db.user.update({
        where: { id: update.id },
        data: {
          finalPoints: update.finalPoints,
          rank: rank,
          eligibleForJackpot: update.eligibleForJackpot,
          isTopRank: isTopRank
        }
      });
    }

    console.log(`✅ Updated ranks for all users`);

    // STEP 5: Get statistics
    const topUser = await db.user.findFirst({
      where: { isTopRank: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        finalPoints: true,
        rank: true
      }
    });

    const jackpotEligibleCount = await db.user.count({
      where: { eligibleForJackpot: true }
    });

    const stats = {
      totalUsers: users.length,
      topUser: topUser ? {
        email: topUser.email,
        firstName: topUser.firstName,
        finalPoints: topUser.finalPoints
      } : null,
      jackpotEligibleCount,
      timestamp: new Date().toISOString()
    };

    console.log("🎉 Final points recalculation complete!");
    console.log(`🏆 Top user: ${topUser?.email} with ${topUser?.finalPoints} points`);
    console.log(`💰 ${jackpotEligibleCount} users eligible for €3,500 jackpot`);

    return NextResponse.json({
      success: true,
      message: "Final points recalculated successfully",
      stats
    });

  } catch (error) {
    console.error("Final points recalculation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to view current launch statistics without recalculating
 */
export async function GET(req: NextRequest) {
  try {
    // SIMPLE AUTH: Check for admin secret
    const authHeader = req.headers.get("authorization");
    const adminSecret = process.env.ADMIN_SECRET_KEY;

    if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized - invalid admin key" },
        { status: 401 }
      );
    }

    const topUser = await db.user.findFirst({
      where: { isTopRank: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        finalPoints: true,
        provisionalPoints: true,
        rank: true,
        earlyBird: true
      }
    });

    const jackpotEligible = await db.user.findMany({
      where: { eligibleForJackpot: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        finalPoints: true,
        rank: true
      },
      orderBy: { finalPoints: 'desc' },
      take: 20 // Top 20 eligible users
    });

    const totalUsers = await db.user.count();
    const earlyBirds = await db.user.count({
      where: { earlyBird: true }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        earlyBirds,
        jackpotEligibleCount: jackpotEligible.length,
        topUser,
        top20JackpotEligible: jackpotEligible
      }
    });

  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
