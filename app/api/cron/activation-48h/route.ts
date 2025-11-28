import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendActivation48hEmail, sendActivationProIRLEmail } from "@/lib/automation-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const fiftyHoursAgo = new Date(Date.now() - 50 * 60 * 60 * 1000);

    const regularUsers = await db.user.findMany({
      where: {
        createdAt: {
          gte: fiftyHoursAgo,
          lte: fortyEightHoursAgo,
        },
        refCount: 0,
        points: {
          lt: 10,
        },
        role: {
          not: "pro",
        },
      },
    });

    const proUsers = await db.user.findMany({
      where: {
        createdAt: {
          gte: fiftyHoursAgo,
          lte: fortyEightHoursAgo,
        },
        refCount: 0,
        role: "pro",
      },
    });

    const regularResults = await Promise.allSettled(
      regularUsers.map((user) => sendActivation48hEmail(user.id))
    );

    const proResults = await Promise.allSettled(
      proUsers.map((user) => sendActivationProIRLEmail(user.id))
    );

    const regularSuccessful = regularResults.filter((r) => r.status === "fulfilled").length;
    const regularFailed = regularResults.filter((r) => r.status === "rejected").length;

    const proSuccessful = proResults.filter((r) => r.status === "fulfilled").length;
    const proFailed = proResults.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      regular: {
        checked: regularUsers.length,
        sent: regularSuccessful,
        failed: regularFailed,
      },
      beautyPros: {
        checked: proUsers.length,
        sent: proSuccessful,
        failed: proFailed,
      },
      total: {
        checked: regularUsers.length + proUsers.length,
        sent: regularSuccessful + proSuccessful,
        failed: regularFailed + proFailed,
      },
    });
  } catch (error) {
    console.error("Activation 48h check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
