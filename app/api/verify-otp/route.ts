import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOTP } from "@/lib/otpStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code, userId } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone number and code are required" },
        { status: 400 }
      );
    }

    const belgianPhoneRegex = /^\+32\d{9}$/;
    if (!belgianPhoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Invalid Belgian phone number format" },
        { status: 400 }
      );
    }

    const result = verifyOTP(phone, code);

    if (!result.ok) {
      let errorMessage = "Invalid verification code";

      switch (result.reason) {
        case "not-found":
          errorMessage = "No verification code found. Please request a new one.";
          break;
        case "expired":
          errorMessage = "Verification code has expired. Please request a new one.";
          break;
        case "too-many-attempts":
          errorMessage = "Too many failed attempts. Please request a new code.";
          break;
        case "mismatch":
          errorMessage = "Invalid verification code. Please try again.";
          break;
      }

      return NextResponse.json(
        { ok: false, error: errorMessage },
        { status: 400 }
      );
    }

    if (userId) {
      const user = await db.user.update({
        where: { id: userId },
        data: {
          phone: phone,
          phoneVerified: true,
        },
      });

      // CRITICAL: Award referral points ONLY after phone verification
      if (user.referredBy && user.phoneVerified) {
        const referrer = await db.user.findUnique({
          where: { referralCode: user.referredBy }
        });

        if (referrer) {
          const { POINTS_CONFIG, calculateProvisionalPoints } = await import('@/lib/points');

          let pointsAwarded = 0;
          let counterField: 'waitlistClients' | 'waitlistInfluencers' | 'waitlistPros' = 'waitlistClients';

          switch (user.role) {
            case 'client':
              pointsAwarded = POINTS_CONFIG.WAITLIST.CLIENT;
              counterField = 'waitlistClients';
              break;
            case 'influencer':
              pointsAwarded = POINTS_CONFIG.WAITLIST.INFLUENCER;
              counterField = 'waitlistInfluencers';
              break;
            case 'beautypro':
            case 'pro':
              pointsAwarded = POINTS_CONFIG.WAITLIST.BEAUTY_PRO;
              counterField = 'waitlistPros';
              break;
          }

          const updatedReferrer = await db.user.update({
            where: { id: referrer.id },
            data: {
              refCount: { increment: 1 },
              [counterField]: { increment: 1 },
              lastRefAt: new Date()
            }
          });

          const newProvisionalPoints = calculateProvisionalPoints({
            waitlistClients: updatedReferrer.waitlistClients,
            waitlistInfluencers: updatedReferrer.waitlistInfluencers,
            waitlistPros: updatedReferrer.waitlistPros,
            appDownloads: updatedReferrer.appDownloads,
            validatedInfluencers: updatedReferrer.validatedInfluencers,
            validatedPros: updatedReferrer.validatedPros,
            earlyBirdBonus: updatedReferrer.earlyBirdBonus
          });

          await db.user.update({
            where: { id: referrer.id },
            data: {
              provisionalPoints: newProvisionalPoints,
              points: newProvisionalPoints
            }
          });

          // Create referral event (with idempotency)
          const idempotencyKey = `${referrer.id}_${user.id}_waitlist_signup`;

          try {
            await db.referralEvent.create({
              data: {
                id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                actorL1Id: referrer.id,
                actorL2Id: user.id,
                type: 'waitlist_signup',
                roleAtSignup: user.role,
                pointsAwarded: pointsAwarded,
                idempotencyKey: idempotencyKey,
                createdAt: new Date()
              }
            });

            console.log(`✅ Referral points awarded: ${pointsAwarded} pts to ${referrer.id} for referring ${user.role} user ${user.id}`);
          } catch (err: any) {
            // Idempotency key violation - already processed
            if (err.code === 'P2002') {
              console.log(`⚠️ Referral already processed: ${idempotencyKey}`);
            } else {
              throw err;
            }
          }

          // Sync to Brevo with updated points
          try {
            const { syncUserToBrevo, checkAndSendMilestoneEmails } = await import('@/lib/automation-service');
            await syncUserToBrevo(referrer.id);

            // Check and send milestone emails/SMS if thresholds crossed
            const oldPoints = referrer.provisionalPoints;
            await checkAndSendMilestoneEmails(referrer.id, oldPoints, newProvisionalPoints);
          } catch (error) {
            console.error('Error syncing to Brevo or sending milestone emails:', error);
            // Don't fail the verification if automation fails
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Phone number verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
