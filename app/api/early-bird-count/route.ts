import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const EARLY_BIRD_LIMIT = 100;

export async function GET(req: NextRequest) {
  try {
    const count = await db.user.count({
      where: {
        earlyBird: true
      }
    });

    const spotsLeft = Math.max(0, EARLY_BIRD_LIMIT - count);

    return NextResponse.json({
      total: EARLY_BIRD_LIMIT,
      taken: count,
      spotsLeft: spotsLeft,
    });
  } catch (error) {
    console.error("[early-bird-count] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch early bird count", spotsLeft: 0 },
      { status: 500 }
    );
  }
}
