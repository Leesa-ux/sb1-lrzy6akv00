import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const SUPABASE_FUNCTION_URL =
  "https://yubmsrvzzcrubmshflpk.supabase.co/functions/v1/verify-sms-code";

export async function POST(request: Request) {
  console.log("[VERIFY-OTP] route hit");

  try {
    const body = await request.json();
    console.log("[VERIFY-OTP] body received:", JSON.stringify(body));

    const { phone, code, userId } = body;

    if (!phone || !code) {
      console.log("[VERIFY-OTP] missing phone or code");
      return NextResponse.json(
        { ok: false, error: "Phone and code are required" },
        { status: 400 }
      );
    }

    console.log("[VERIFY-OTP] calling Supabase verify-sms-code for", phone);

    const res = await fetch(SUPABASE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });

    const rawText = await res.text();
    console.log("[VERIFY-OTP] Supabase status:", res.status);
    console.log("[VERIFY-OTP] Supabase response:", rawText);

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("[VERIFY-OTP] Supabase returned non-JSON");
      return NextResponse.json(
        { ok: false, error: "Invalid response from verification service" },
        { status: 502 }
      );
    }

    if (!data.verified) {
      console.log("[VERIFY-OTP] code not verified:", data.error);
      return NextResponse.json(
        { ok: false, error: (data.error as string) || "Code invalide" },
        { status: res.status >= 400 ? res.status : 400 }
      );
    }

    // Code is verified — update DB and award referral points if userId provided
    if (userId) {
      const existingUser = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, referredBy: true, phoneVerified: true, role: true },
      });

      if (!existingUser) {
        console.warn("[VERIFY-OTP] userId not found:", userId);
        return NextResponse.json(
          { ok: false, error: "User not found" },
          { status: 404 }
        );
      }

      const user = await db.user.update({
        where: { id: userId },
        data: { phone, phoneVerified: true },
      });

      console.log("[VERIFY-OTP] phone verified for user", userId);

      // Award referral points only after phone verification
      if (user.referredBy && !existingUser.phoneVerified) {
        const referrer = await db.user.findUnique({
          where: { referralCode: user.referredBy },
        });

        if (referrer) {
          const { POINTS_CONFIG } = await import("@/lib/points");

          let pointsAwarded = 0;
          let counterField: "waitlistClients" | "waitlistInfluencers" | "waitlistPros" =
            "waitlistClients";

          switch (user.role) {
            case "client":
              pointsAwarded = POINTS_CONFIG.WAITLIST.CLIENT;
              counterField = "waitlistClients";
              break;
            case "influencer":
              pointsAwarded = POINTS_CONFIG.WAITLIST.INFLUENCER;
              counterField = "waitlistInfluencers";
              break;
            case "beautypro":
            case "beauty_pro":
            case "pro":
              pointsAwarded = POINTS_CONFIG.WAITLIST.BEAUTY_PRO;
              counterField = "waitlistPros";
              break;
          }

          const idempotencyKey = `${referrer.id}_${user.id}_waitlist_signup`;

          try {
            const updatedReferrer = await db.$transaction(async (tx) => {
              await tx.referralEvent.create({
                data: {
                  id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  actorL1Id: referrer.id,
                  actorL2Id: user.id,
                  type: "waitlist_signup",
                  roleAtSignup: user.role,
                  pointsAwarded,
                  idempotencyKey,
                  createdAt: new Date(),
                },
              });

              return tx.user.update({
                where: { id: referrer.id },
                data: {
                  refCount: { increment: 1 },
                  [counterField]: { increment: 1 },
                  provisionalPoints: { increment: pointsAwarded },
                  points: { increment: pointsAwarded },
                  lastRefAt: new Date(),
                },
              });
            });

            console.log(
              `[VERIFY-OTP] referral awarded: ${pointsAwarded} pts to ${referrer.id}`,
              `totals: ${updatedReferrer.refCount} refs, ${updatedReferrer.provisionalPoints} pts`
            );

            try {
              const { syncUserToBrevo, checkAndSendMilestoneEmails } = await import(
                "@/lib/automation-service"
              );
              const oldPoints = referrer.provisionalPoints;
              await syncUserToBrevo(referrer.id);
              await checkAndSendMilestoneEmails(referrer.id, oldPoints, updatedReferrer.provisionalPoints);
            } catch (err) {
              console.error("[VERIFY-OTP] Brevo sync error (non-blocking):", err);
            }
          } catch (err: any) {
            if (err.code === "P2002") {
              console.log("[VERIFY-OTP] referral already processed:", idempotencyKey);
            } else {
              console.error("[VERIFY-OTP] referral transaction failed:", err);
            }
          }
        }
      }
    }

    return NextResponse.json({ ok: true, message: "Phone number verified successfully" });
  } catch (error) {
    console.error("[VERIFY-OTP] route error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
