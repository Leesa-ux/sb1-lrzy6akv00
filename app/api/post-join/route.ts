import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncUserToBrevo, sendWelcomeEmail } from "@/lib/automation-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    if (user.emailSentAt) {
      return NextResponse.json({ skipped: true });
    }

    const listId = parseInt(process.env.BREVO_GLOW_LIST_ID || "5", 10);
    await syncUserToBrevo(user.id, [listId]);
    await sendWelcomeEmail(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[post-join] error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
