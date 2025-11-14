import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendActivation48hEmail } from "@/lib/automation-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const fiftyHoursAgo = new Date(Date.now() - 50 * 60 * 60 * 1000);

    const users = await db.user.findMany({
      where: {
        createdAt: {
          gte: fiftyHoursAgo,
          lte: fortyEightHoursAgo,
        },
        refCount: 0,
        points: {
          lt: 10,
        },
      },
    });

    const results = await Promise.allSettled(
      users.map((user) => sendActivation48hEmail(user.id))
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      checked: users.length,
      sent: successful,
      failed,
    });
  } catch (error) {
    console.error("Activation 48h check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
