import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  sendWelcomeEmail,
  syncUserToBrevo,
} from "@/lib/automation-service";
import { getClientIp } from "@/lib/get-client-ip";
import { isTempEmail } from "@/lib/temp-email-domains";
import { genReferralCode, resolveReferrer, handleReferralEvent, recalculateUserRank } from "@/lib/referrals";
import { calculateProvisionalPoints, getNextMilestone, POINTS_CONFIG } from "@/lib/points";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      phone,
      firstName,
      lastName,
      role,
      referredBy, // Referral code of the person who referred this user
      deviceFingerprint,
      formLoadTime,
      formSubmitTime,
    } = body;

    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: "Email, first name, last name, and role are required" },
        { status: 400 }
      );
    }

    // Normalize role names (handle "pro" as "beauty_pro")
    const normalizedRole = role === "pro" ? "beauty_pro" : role;

    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "unknown";
    const fraudFlags: string[] = [];
    let isBlocked = false;

    if (isTempEmail(email)) {
      console.warn("Blocked temp email:", email);
      return NextResponse.json(
        { error: "Temporary email addresses are not allowed" },
        { status: 403 }
      );
    }

    if (formLoadTime && formSubmitTime) {
      const timeToSubmit = (formSubmitTime - formLoadTime) / 1000;
      if (timeToSubmit < 3) {
        fraudFlags.push("fast_submit");
      }
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentSignupsFromIp = await db.user.count({
      where: {
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentSignupsFromIp >= 3) {
      fraudFlags.push("repeated_ip");
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // EARLY-BIRD LOGIC: Check if user is among first 100 signups
    const totalUsers = await db.user.count();
    const isEarlyBird = totalUsers < POINTS_CONFIG.EARLY_BIRD_LIMIT;
    const earlyBirdBonus = isEarlyBird ? POINTS_CONFIG.EARLY_BIRD_BONUS : 0;

    // Generate unique referral code
    let referralCode = genReferralCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.user.findUnique({
        where: { referralCode }
      });
      if (!existing) break;
      referralCode = genReferralCode();
      attempts++;
    }

    // Initialize all counters to 0
    const initialData = {
      waitlistClients: 0,
      waitlistInfluencers: 0,
      waitlistPros: 0,
      appDownloads: 0,
      validatedInfluencers: 0,
      validatedPros: 0,
      earlyBirdBonus
    };

    // Calculate initial provisional points (will be just the early bird bonus, if applicable)
    const provisionalPoints = calculateProvisionalPoints(initialData);
    const nextMilestone = getNextMilestone(provisionalPoints);

    // Create the user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        phone: phone || null,
        firstName: firstName || null,
        role: normalizedRole,
        referralCode,
        referredBy: referredBy || null,

        // Points system fields
        points: provisionalPoints, // Legacy field
        provisionalPoints,
        finalPoints: 0,
        nextMilestone,
        rank: 0, // Will be calculated after creation
        refCount: 0,

        // Referral counters
        waitlistClients: 0,
        waitlistInfluencers: 0,
        waitlistPros: 0,
        appDownloads: 0,
        validatedInfluencers: 0,
        validatedPros: 0,

        // Early-bird tracking
        earlyBird: isEarlyBird,
        earlyBirdBonus,

        // Prize eligibility (will be updated at launch)
        eligibleForJackpot: false,
        isTopRank: false,
      },
    });

    // Calculate initial rank
    await recalculateUserRank(user.id);

    // If user was referred, handle the referral event
    if (referredBy) {
      const referrer = await resolveReferrer(referredBy);
      if (referrer) {
        await handleReferralEvent(referrer.id, normalizedRole);
        console.log(`🎯 Referral: ${email} (${normalizedRole}) referred by ${referrer.email}`);
      }
    }

    // Sync to Brevo and send welcome email
    await syncUserToBrevo(user.id);
    await sendWelcomeEmail(user.id);

    const refLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://afroe.com"}/waitlist?ref=${user.referralCode}`;

    console.log(`✅ New user signup: ${email} | Role: ${normalizedRole} | Early bird: ${isEarlyBird} | Points: ${provisionalPoints}`);

    return NextResponse.json({
      success: true,
      userId: user.id,
      referralCode: user.referralCode,
      refLink,
      earlyBird: isEarlyBird,
      earlyBirdBonus,
      provisionalPoints,
      nextMilestone,
      fraudFlags: fraudFlags.length > 0 ? fraudFlags : undefined,
    });
  } catch (error) {
    console.error("Signup complete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
