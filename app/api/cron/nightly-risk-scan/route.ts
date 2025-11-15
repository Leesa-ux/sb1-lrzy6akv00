import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  calculateRiskScore,
  buildCounts,
  getRiskLevel,
  type UserRiskData,
} from "@/lib/risk-scoring";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting nightly risk scan...");

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        emailOpenedAt: true,
        fraudScore: true,
      },
    });

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users to process",
        processed: 0,
      });
    }

    const { ipCounts, userAgentCounts, deviceCounts } = buildCounts([]);

    let processed = 0;
    let updated = 0;

    for (const user of users) {
      const userRiskData: UserRiskData = {
        userId: user.id,
        email: user.email,
        createdAt: user.createdAt,
        emailOpenedAt: user.emailOpenedAt,
      };

      const { score, factors } = calculateRiskScore(
        userRiskData,
        ipCounts,
        userAgentCounts,
        deviceCounts,
        new Map()
      );

      if (score !== user.fraudScore) {
        await db.user.update({
          where: { id: user.id },
          data: { fraudScore: score },
        });
        updated++;

        const riskLevel = getRiskLevel(score);
        if (riskLevel === "high" || riskLevel === "critical") {
          console.log(
            `High risk user detected: ${user.email} - Score: ${score} - Level: ${riskLevel}`,
            factors
          );
        }
      }

      processed++;
    }

    console.log(
      `Risk scan complete. Processed: ${processed}, Updated: ${updated}`
    );

    return NextResponse.json({
      success: true,
      processed,
      updated,
      message: `Risk scan complete. ${updated} users updated.`,
    });
  } catch (error) {
    console.error("Nightly risk scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
