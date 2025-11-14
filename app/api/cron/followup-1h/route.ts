import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendFollowupEmail } from "@/lib/automation-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const users = await db.user.findMany({
      where: {
        createdAt: {
          gte: twoHoursAgo,
          lte: oneHourAgo,
        },
        emailSentAt: {
          not: null,
        },
      },
    });

    const results = await Promise.allSettled(
      users.map((user) => sendFollowupEmail(user.id))
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
    console.error("Follow-up check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
