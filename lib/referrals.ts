import { db } from "@/lib/db";
import { calculateProvisionalPoints, getNextMilestone, POINTS_CONFIG } from "./points";

/**
 * Generate a unique referral code for a user
 */
export function genReferralCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "af-";
  for (let i = 0; i < 5; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return s;
}

/**
 * Resolve the direct referrer based on a referral code
 */
export async function resolveReferrer(refCode?: string) {
  if (!refCode) return null;

  const referrer = await db.user.findUnique({
    where: { referralCode: refCode }
  });

  return referrer;
}

/**
 * Handle a successful referral event when a new user signs up using a referral code.
 * Updates the referrer's waitlist counters and recalculates their points.
 *
 * @param referrerId - ID of the user who referred
 * @param newUserRole - Role of the newly signed up user ("client", "influencer", or "beauty_pro")
 */
export async function handleReferralEvent(referrerId: string, newUserRole: string) {
  // Get the current referrer data
  const referrer = await db.user.findUnique({
    where: { id: referrerId }
  });

  if (!referrer) {
    console.error(`Referrer with ID ${referrerId} not found`);
    return;
  }

  // Determine which counter to increment based on the new user's role
  const updates: any = {
    refCount: referrer.refCount + 1,
    lastRefAt: new Date()
  };

  // Increment the appropriate waitlist counter
  if (newUserRole === "client") {
    updates.waitlistClients = referrer.waitlistClients + 1;
  } else if (newUserRole === "influencer") {
    updates.waitlistInfluencers = referrer.waitlistInfluencers + 1;
  } else if (newUserRole === "beauty_pro" || newUserRole === "pro") {
    updates.waitlistPros = referrer.waitlistPros + 1;
  }

  // Recalculate provisional points
  const updatedData = {
    waitlistClients: updates.waitlistClients ?? referrer.waitlistClients,
    waitlistInfluencers: updates.waitlistInfluencers ?? referrer.waitlistInfluencers,
    waitlistPros: updates.waitlistPros ?? referrer.waitlistPros,
    appDownloads: referrer.appDownloads,
    validatedInfluencers: referrer.validatedInfluencers,
    validatedPros: referrer.validatedPros,
    earlyBirdBonus: referrer.earlyBirdBonus
  };

  const provisionalPoints = calculateProvisionalPoints(updatedData);
  updates.provisionalPoints = provisionalPoints;
  updates.points = provisionalPoints; // Keep legacy points field in sync
  updates.nextMilestone = getNextMilestone(provisionalPoints);

  // Update the referrer
  await db.user.update({
    where: { id: referrerId },
    data: updates
  });

  // Recalculate rank for this user
  await recalculateUserRank(referrerId);

  console.log(`✅ Referral processed: ${newUserRole} referred by user ${referrerId}, new provisional points: ${provisionalPoints}`);
}

/**
 * Recalculate the rank of a specific user based on provisional points.
 * Rank = 1 + number of users with strictly more provisionalPoints.
 *
 * @param userId - ID of the user to recalculate rank for
 */
export async function recalculateUserRank(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId }
  });

  if (!user) return;

  // Count users with more points
  const usersWithMorePoints = await db.user.count({
    where: {
      provisionalPoints: {
        gt: user.provisionalPoints
      }
    }
  });

  const newRank = usersWithMorePoints + 1;

  await db.user.update({
    where: { id: userId },
    data: { rank: newRank }
  });
}

/**
 * Recalculate ranks for ALL users based on provisional points.
 * This is useful for periodic updates or after bulk operations.
 */
export async function recalculateAllRanks() {
  const users = await db.user.findMany({
    orderBy: [
      { provisionalPoints: 'desc' },
      { createdAt: 'asc' } // Tie-breaker: earlier signup wins
    ]
  });

  // Update ranks in batch
  for (let i = 0; i < users.length; i++) {
    await db.user.update({
      where: { id: users[i].id },
      data: { rank: i + 1 }
    });
  }

  console.log(`✅ Recalculated ranks for ${users.length} users`);
}

/**
 * Get points breakdown for a user (for display/debugging)
 */
export async function getUserPointsBreakdown(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId }
  });

  if (!user) return null;

  return {
    // Waitlist phase
    waitlistClients: user.waitlistClients,
    waitlistInfluencers: user.waitlistInfluencers,
    waitlistPros: user.waitlistPros,
    // Launch phase
    appDownloads: user.appDownloads,
    validatedInfluencers: user.validatedInfluencers,
    validatedPros: user.validatedPros,
    // Bonus
    earlyBirdBonus: user.earlyBirdBonus,
    // Totals
    provisionalPoints: user.provisionalPoints,
    finalPoints: user.finalPoints,
    // Status
    rank: user.rank,
    nextMilestone: user.nextMilestone
  };
}