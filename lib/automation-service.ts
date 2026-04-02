import { db } from "./db";
import { upsertBrevoContact } from "./brevo-client";
import {
  MILESTONES,
  POINT_RULES,
  mapRoleForBrevo,
  type Role,
  type Milestone,
} from "./brevo-types";

const BREVO_GLOW_LIST_ID = parseInt(process.env.BREVO_GLOW_LIST_ID || "5", 10);

const LAUNCH_DATE = new Date("2026-05-15T22:59:00Z");
const IS_POST_LAUNCH = Date.now() >= LAUNCH_DATE.getTime();

/** Magic link that takes the user directly back to their personal Glow success page */
function buildMyGlowLink(user: { firstName: string | null; referralCode: string }): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://afroe.com";
  const shareUrl = `${base}/?ref=${user.referralCode}`;
  const params = new URLSearchParams({
    ref:       user.referralCode,
    shareUrl,
    firstName: user.firstName || "Toi",
  });
  return `${base}/success?${params.toString()}`;
}

export function getNextMilestone(points: number): Milestone {
  for (const milestone of MILESTONES) {
    if (points < milestone) {
      return milestone;
    }
  }
  return 200;
}

export function calculatePointsForRole(role: Role, isLaunchDay = false): number {
  const rules = IS_POST_LAUNCH ? POINT_RULES.POST_LAUNCH : POINT_RULES.PRE_LAUNCH;
  const basePoints = rules[role];
  return isLaunchDay ? basePoints * 2 : basePoints;
}

/**
 * Syncs the user's contact data to Brevo.
 * Adding to a list triggers the "Follow Up email" automation.
 * Updating REFERRAL_POINTS triggers the PALIER automations (10/50/100/200).
 */
export async function syncUserToBrevo(userId: string, listIds?: number[]): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const currentPoints = IS_POST_LAUNCH ? user.finalPoints : user.provisionalPoints;

  await upsertBrevoContact({
    email: user.email,
    firstName: user.firstName || undefined,
    phone: user.phone || undefined,
    ...(listIds ? { listIds } : {}),
    attributes: {
      ROLE: mapRoleForBrevo(user.role),
      REF_LINK: `${process.env.NEXT_PUBLIC_APP_URL || "https://afroe.com"}/waitlist?ref=${user.referralCode}`,
      MY_GLOW_LINK: buildMyGlowLink(user),
      RANK: user.rank,
      REFERRAL_POINTS: currentPoints,
      POINTS: currentPoints,
      PROVISIONAL_POINTS: user.provisionalPoints,
      FINAL_POINTS: user.finalPoints,
      REF_COUNT: user.refCount,
      NEXT_MILESTONE: user.nextMilestone,
      LAST_REF_AT: user.lastRefAt?.toISOString() || new Date().toISOString(),
      EARLY_BIRD: user.earlyBird,
      EARLY_BIRD_BONUS: user.earlyBirdBonus,
      WAITLIST_CLIENTS: user.waitlistClients,
      WAITLIST_INFLUENCERS: user.waitlistInfluencers,
      WAITLIST_PROS: user.waitlistPros,
      APP_DOWNLOADS: user.appDownloads,
      VALIDATED_INFLUENCERS: user.validatedInfluencers,
      VALIDATED_PROS: user.validatedPros,
      ELIGIBLE_FOR_JACKPOT: user.eligibleForJackpot,
      IS_TOP_RANK: user.isTopRank,
    },
  });
}

export async function updateUserPoints(
  userId: string,
  pointsToAdd: number
): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await db.user.update({
    where: { id: userId },
    data: {
      points: user.points + pointsToAdd,
      refCount: { increment: 1 },
      lastRefAt: new Date(),
    },
  });

  // Syncing REFERRAL_POINTS to Brevo triggers the PALIER automations automatically
  await syncUserToBrevo(userId);
}

// ---------------------------------------------------------------------------
// The functions below are kept as no-ops for backward compatibility.
// All welcome emails, follow-ups, nudges, and milestone emails are now
// handled entirely by Brevo automations (Follow Up email + PALIER 10/50/100/200).
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(_userId: string): Promise<void> {}
export async function sendFollowupEmail(_userId: string): Promise<void> {}
export async function sendActivation48hEmail(_userId: string): Promise<void> {}
export async function sendMilestoneEmail(_userId: string, _milestone: Milestone): Promise<void> {}
export async function sendGlowEliteEmail(_userId: string): Promise<void> {}
export async function checkAndSendMilestoneEmails(_userId: string, _oldPoints: number, _newPoints: number): Promise<void> {}
export async function sendInactivityReminder(_userId: string): Promise<void> {}
export async function sendWelcomeBeautyProEmail(_userId: string): Promise<void> {}
export async function sendActivationProIRLEmail(_userId: string): Promise<void> {}
