import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendInactivityReminder } from "@/lib/automation-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const inactiveUsers = await db.user.findMany({
      where: {
        lastRefAt: {
          lte: fiveDaysAgo,
        },
        refCount: {
          gt: 0,
        },
      },
    });

    const results = await Promise.allSettled(
      inactiveUsers.map((user) => sendInactivityReminder(user.id))
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      checked: inactiveUsers.length,
      sent: successful,
      failed,
    });
  } catch (error) {
    console.error("Inactivity check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
