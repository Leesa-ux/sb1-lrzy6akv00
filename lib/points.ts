/**
 * Points Calculation Helpers for Afroé Glow List Waitlist
 *
 * This module contains the business logic for calculating referral points
 * in both the pre-launch (waitlist) and post-launch (validation) phases.
 *
 * POINTS SYSTEM:
 *
 * BEFORE LAUNCH (Waitlist Phase):
 * - Client           → +5 pts  (inscription waitlist via referral)
 * - Influencer       → +15 pts (inscription waitlist, ≥ 2k followers)
 * - Beauty Pro       → +25 pts (inscription waitlist)
 *
 * AFTER LAUNCH (Validation Phase):
 * - Client           → +10 pts  (téléchargement app)
 * - Influencer       → +30 pts  (influenceur validé, ≥ 2k followers)
 * - Beauty Pro       → +50 pts  (inscription pro validée)
 *
 * EARLY-BIRD BONUS:
 * - First 100 validated waitlist signups get an extra +50 points
 * - This is a one-time bonus per user
 */

/**
 * User type representing the fields needed for points calculation
 */
export interface UserPointsData {
  // Pre-launch counters (waitlist phase)
  waitlistClients: number;
  waitlistInfluencers: number;
  waitlistPros: number;

  // Post-launch counters (validation phase)
  appDownloads: number;
  validatedInfluencers: number;
  validatedPros: number;

  // Early-bird bonus
  earlyBirdBonus: number;
}

/**
 * Calculate provisional points during the waitlist phase.
 * These points are used for the leaderboard BEFORE launch.
 *
 * Formula:
 *   provisionalPoints =
 *     (waitlistClients * 5) +
 *     (waitlistInfluencers * 15) +
 *     (waitlistPros * 25) +
 *     earlyBirdBonus
 *
 * @param user - User data with referral counters
 * @returns Provisional points for pre-launch phase
 */
export function calculateProvisionalPoints(user: UserPointsData): number {
  const clientPoints = user.waitlistClients * 5;
  const influencerPoints = user.waitlistInfluencers * 15;
  const proPoints = user.waitlistPros * 25;
  const bonus = user.earlyBirdBonus;

  return clientPoints + influencerPoints + proPoints + bonus;
}

/**
 * Calculate final points at launch time.
 * These points are used for prize eligibility (iPhone 17 Pro, €3,500).
 *
 * Formula:
 *   finalPoints =
 *     (appDownloads * 10) +
 *     (validatedInfluencers * 30) +
 *     (validatedPros * 50) +
 *     earlyBirdBonus
 *
 * @param user - User data with validation counters
 * @returns Final points for post-launch phase
 */
export function calculateFinalPoints(user: UserPointsData): number {
  const appDownloadPoints = user.appDownloads * 10;
  const validatedInfluencerPoints = user.validatedInfluencers * 30;
  const validatedProPoints = user.validatedPros * 50;
  const bonus = user.earlyBirdBonus;

  return appDownloadPoints + validatedInfluencerPoints + validatedProPoints + bonus;
}

/**
 * Get the next milestone threshold for a given points total.
 * Milestones correspond to reward tiers:
 * - 10 pts  → Glow Starters (2 parrainages validés)
 * - 50 pts  → Glow Circle Insiders
 * - 100 pts → Glow Icons
 * - 200 pts → Glow Elites (secret tier)
 *
 * @param points - Current points total
 * @returns Next milestone (10, 50, 100, or 200)
 */
export function getNextMilestone(points: number): number {
  const milestones = [10, 50, 100, 200];

  for (const milestone of milestones) {
    if (points < milestone) {
      return milestone;
    }
  }

  // If user has >= 200 points, next milestone is still 200 (max tier)
  return 200;
}

/**
 * Determine if a user is eligible for the €3,500 jackpot.
 * Eligibility requires finalPoints >= 100.
 *
 * @param finalPoints - User's final points at launch
 * @returns true if eligible for jackpot draw
 */
export function isEligibleForJackpot(finalPoints: number): boolean {
  return finalPoints >= 100;
}

/**
 * Get the reward tier name for a given points total.
 * Used for display purposes and milestone tracking.
 *
 * @param points - Current points total
 * @returns Tier name
 */
export function getRewardTier(points: number): string {
  if (points >= 200) return "Glow Elites";
  if (points >= 100) return "Glow Icons";
  if (points >= 50) return "Glow Circle Insiders";
  if (points >= 10) return "Glow Starters";
  return "En progression";
}

/**
 * Get next milestone with enhanced info for display
 * @param points - Current points total
 * @returns Object with target, missing points, and emoji
 */
export function nextMilestone(points: number) {
  const milestones = [
    { target: 10, emoji: '🥉' },
    { target: 50, emoji: '🥈' },
    { target: 100, emoji: '🥇' },
    { target: 200, emoji: '🏆' }
  ];

  for (const milestone of milestones) {
    if (points < milestone.target) {
      return {
        target: milestone.target,
        missing: milestone.target - points,
        emoji: milestone.emoji
      };
    }
  }

  return { target: 200, missing: 0, emoji: '🏆' };
}

/**
 * Get tier info by points (legacy support)
 */
export function getTierByPoints(points: number): { name: string; tier: number } | null {
  if (points >= 200) return { name: "Glow Elites", tier: 200 };
  if (points >= 100) return { name: "Glow Icons", tier: 100 };
  if (points >= 50) return { name: "Glow Circle Insiders", tier: 50 };
  if (points >= 10) return { name: "Glow Starters", tier: 10 };
  return null;
}

/**
 * Constants for role-based point values
 */
export const POINTS_CONFIG = {
  // Pre-launch (waitlist) points
  WAITLIST: {
    CLIENT: 5,
    INFLUENCER: 15,
    BEAUTY_PRO: 25,
  },
  // Post-launch (validation) points
  LAUNCH: {
    APP_DOWNLOAD: 10,
    VALIDATED_INFLUENCER: 30,
    VALIDATED_PRO: 50,
  },
  // Early-bird bonus
  EARLY_BIRD_BONUS: 50,
  EARLY_BIRD_LIMIT: 100,
  // Milestones
  MILESTONES: [10, 50, 100, 200],
  // Jackpot threshold
  JACKPOT_THRESHOLD: 100,
} as const;

/**
 * Prelaunch cutoff date (Brussels time: March 1, 2026 at 00:00 = UTC Feb 28, 2026 at 23:00)
 * Brussels is UTC+1 at this date, so we use the UTC equivalent to avoid timezone issues.
 */
export const PRELAUNCH_END_UTC = "2026-02-28T23:00:00.000Z";

/**
 * Type definition for user roles
 */
export type UserRole = "client" | "influencer" | "beautypro";

/**
 * Check if current date is still in prelaunch phase
 * @param now - Optional date to check (defaults to current time)
 * @returns true if still in prelaunch phase, false if launch has occurred
 */
export function isPrelaunch(now: Date = new Date()): boolean {
  const cutoff = new Date(PRELAUNCH_END_UTC);
  return now < cutoff;
}

/**
 * Get points awarded for referring a user based on the referred user's role
 * @param referredRole - Role of the newly referred user
 * @param isLaunched - Whether the app has launched (defaults to checking current date)
 * @returns Points to award to the referrer
 */
export function pointsForReferredRole(
  referredRole: UserRole,
  isLaunched: boolean = !isPrelaunch()
): number {
  if (isLaunched) {
    switch (referredRole) {
      case "client":
        return POINTS_CONFIG.LAUNCH.APP_DOWNLOAD;
      case "influencer":
        return POINTS_CONFIG.LAUNCH.VALIDATED_INFLUENCER;
      case "beautypro":
        return POINTS_CONFIG.LAUNCH.VALIDATED_PRO;
      default:
        return 0;
    }
  } else {
    switch (referredRole) {
      case "client":
        return POINTS_CONFIG.WAITLIST.CLIENT;
      case "influencer":
        return POINTS_CONFIG.WAITLIST.INFLUENCER;
      case "beautypro":
        return POINTS_CONFIG.WAITLIST.BEAUTY_PRO;
      default:
        return 0;
    }
  }
}