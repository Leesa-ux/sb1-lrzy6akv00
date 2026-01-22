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
      const existingUser = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, referredBy: true, phoneVerified: true, role: true }
      });

      if (!existingUser) {
        return NextResponse.json(
          { ok: false, error: "User not found" },
          { status: 404 }
        );
      }

      const user = await db.user.update({
        where: { id: userId },
        data: {
          phone: phone,
          phoneVerified: true,
        },
      });

      // CRITICAL: Award referral points ONLY after phone verification
      // IDEMPOTENCY: Create ReferralEvent FIRST before incrementing points
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

          const idempotencyKey = `${referrer.id}_${user.id}_waitlist_signup`;

          try {
            // ATOMIC TRANSACTION: Create event + increment points in single transaction
            // If any step fails, entire transaction rolls back (no partial credit)
            const updatedReferrer = await db.$transaction(async (tx) => {
              // Step 1: Create ReferralEvent (idempotency check via unique constraint)
              await tx.referralEvent.create({
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

              // Step 2: Atomically increment all counters + points in ONE update
              // This prevents race conditions and ensures consistency
              const updated = await tx.user.update({
                where: { id: referrer.id },
                data: {
                  refCount: { increment: 1 },
                  [counterField]: { increment: 1 },
                  provisionalPoints: { increment: pointsAwarded },
                  points: { increment: pointsAwarded },
                  lastRefAt: new Date()
                }
              });

              return updated;
            });

            console.log(`✅ Referral transaction complete: ${pointsAwarded} pts awarded to ${referrer.id} for referring ${user.role} user ${user.id}`);
            console.log(`   New totals: ${updatedReferrer.refCount} referrals, ${updatedReferrer.provisionalPoints} points`);

            // Non-blocking automation (outside transaction)
            try {
              const { syncUserToBrevo, checkAndSendMilestoneEmails } = await import('@/lib/automation-service');
              await syncUserToBrevo(referrer.id);

              const oldPoints = referrer.provisionalPoints;
              const newPoints = updatedReferrer.provisionalPoints;
              await checkAndSendMilestoneEmails(referrer.id, oldPoints, newPoints);
            } catch (error) {
              console.error('⚠️ Error syncing to Brevo or sending milestone emails:', error);
            }

          } catch (err: any) {
            if (err.code === 'P2002') {
              console.log(`⚠️ Referral already processed (duplicate detected): ${idempotencyKey}`);
            } else {
              console.error('❌ Referral transaction failed:', err);
              throw err;
            }
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
