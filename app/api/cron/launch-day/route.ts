import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBrevoEmail, sendBrevoSMS } from "@/lib/brevo-client";
import { EMAIL_TEMPLATE_IDS } from "@/lib/brevo-types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        phone: true,
        role: true,
        points: true,
        rank: true,
        referralCode: true,
      },
    });

    const emailPromises = users.map((user) =>
      sendBrevoEmail({
        to: [{ email: user.email, name: user.firstName || undefined }],
        templateId: EMAIL_TEMPLATE_IDS.LAUNCH_DAY,
        params: {
          FIRSTNAME: user.firstName || "Glow Star",
          POINTS: user.points,
          RANK: user.rank,
          ROLE: user.role,
        },
      })
    );

    const smsPromises = users
      .filter((user) => user.phone)
      .map((user) =>
        sendBrevoSMS({
          phone: user.phone!,
          message: `🚀 C'est le JOUR J ! Afroé est lancée ! Tous les points gagnés aujourd'hui sont DOUBLÉS ! Partage ton lien maintenant ! 🔥`,
        })
      );

    await Promise.allSettled([...emailPromises, ...smsPromises]);

    return NextResponse.json({
      success: true,
      emailsSent: users.length,
      smsSent: users.filter((u) => u.phone).length,
    });
  } catch (error) {
    console.error("Launch day error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
