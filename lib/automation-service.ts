import { db } from "./db";
import {
  upsertBrevoContact,
  sendBrevoEmail,
  sendBrevoSMS,
  checkEmailOpened,
} from "./brevo-client";
import {
  EMAIL_TEMPLATE_IDS,
  MILESTONES,
  POINT_RULES,
  getSMSByRole,
  type Role,
  type Milestone,
} from "./brevo-types";
import { getSMSTemplate } from "./sms-templates";

const LAUNCH_DATE = new Date("2026-01-15T00:00:00Z");
const IS_POST_LAUNCH = Date.now() >= LAUNCH_DATE.getTime();

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

export async function syncUserToBrevo(userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  // Use provisionalPoints for current leaderboard, but sync both
  const currentPoints = IS_POST_LAUNCH ? user.finalPoints : user.provisionalPoints;

  await upsertBrevoContact({
    email: user.email,
    firstName: user.firstName || undefined,
    phone: user.phone || undefined,
    attributes: {
      ROLE: user.role as Role,
      REF_LINK: `${process.env.NEXT_PUBLIC_APP_URL || "https://afroe.com"}/waitlist?ref=${user.referralCode}`,
      RANK: user.rank,
      POINTS: currentPoints, // Use current phase points
      PROVISIONAL_POINTS: user.provisionalPoints, // NEW: Waitlist phase points
      FINAL_POINTS: user.finalPoints, // NEW: Launch phase points
      REF_COUNT: user.refCount,
      NEXT_MILESTONE: user.nextMilestone,
      LAST_REF_AT: user.lastRefAt?.toISOString() || new Date().toISOString(),
      EARLY_BIRD: user.earlyBird, // NEW: Early-bird status
      EARLY_BIRD_BONUS: user.earlyBirdBonus, // NEW: Bonus points amount
      // Referral counters
      WAITLIST_CLIENTS: user.waitlistClients,
      WAITLIST_INFLUENCERS: user.waitlistInfluencers,
      WAITLIST_PROS: user.waitlistPros,
      // Validation counters (for post-launch)
      APP_DOWNLOADS: user.appDownloads,
      VALIDATED_INFLUENCERS: user.validatedInfluencers,
      VALIDATED_PROS: user.validatedPros,
      // Prize eligibility
      ELIGIBLE_FOR_JACKPOT: user.eligibleForJackpot,
      IS_TOP_RANK: user.isTopRank,
    },
  });
}

export async function sendWelcomeEmail(userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const refLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://afroe.com"}/waitlist?ref=${user.referralCode}`;

  await sendBrevoEmail({
    to: [{ email: user.email, name: user.firstName || undefined }],
    templateId: EMAIL_TEMPLATE_IDS.WELCOME,
    params: {
      FIRSTNAME: user.firstName || "Glow Friend",
      REF_LINK: refLink,
      ROLE: user.role,
      POINTS: user.points,
      NEXT_MILESTONE: getNextMilestone(user.points),
    },
  });

  if (user.phone) {
    await sendBrevoSMS({
      phone: user.phone,
      message: getSMSByRole(user.role as Role, refLink),
    });
  }

  await db.user.update({
    where: { id: userId },
    data: { emailSentAt: new Date() },
  });
}

export async function sendFollowupEmail(userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const timeSinceSignup = Date.now() - user.createdAt.getTime();
  if (timeSinceSignup < 3600000) return;

  const emailOpened = user.emailOpenedAt
    ? true
    : await checkEmailOpened(user.email, user.createdAt);

  await sendBrevoEmail({
    to: [{ email: user.email, name: user.firstName || undefined }],
    templateId: EMAIL_TEMPLATE_IDS.FOLLOWUP_1H,
    params: {
      FIRSTNAME: user.firstName || "Glow Friend",
      REF_LINK: `${process.env.NEXT_PUBLIC_APP_URL || "https://afroe.com"}/waitlist?ref=${user.referralCode}`,
      POINTS: user.points,
      ROLE: user.role,
    },
  });

  if (!emailOpened && user.phone) {
    await sendBrevoSMS({
      phone: user.phone,
      message: getSMSTemplate("followup_1h"),
    });
  }
}

export async function sendActivation48hEmail(userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const timeSinceSignup = Date.now() - user.createdAt.getTime();
  if (timeSinceSignup < 172800000) return;

  if (user.refCount === 0 && user.points < 10) {
    await sendBrevoEmail({
      to: [{ email: user.email, name: user.firstName || undefined }],
      templateId: EMAIL_TEMPLATE_IDS.ACTIVATION_48H,
      params: {
        FIRSTNAME: user.firstName || "Glow Friend",
        REF_LINK: `${process.env.NEXT_PUBLIC_APP_URL || "https://afroe.com"}/waitlist?ref=${user.referralCode}`,
        POINTS: user.points,
        ROLE: user.role,
      },
    });

    if (user.phone) {
      await sendBrevoSMS({
        phone: user.phone,
        message: getSMSTemplate("activation_48h"),
      });
    }
  }
}

export async function sendMilestoneEmail(
  userId: string,
  milestone: Milestone
): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  if (user.lastMilestoneSent === milestone) return;

  await sendBrevoEmail({
    to: [{ email: user.email, name: user.firstName || undefined }],
    templateId: EMAIL_TEMPLATE_IDS.MILESTONE,
    params: {
      FIRSTNAME: user.firstName || "Glow Star",
      MILESTONE: milestone,
      POINTS: user.points,
      RANK: user.rank,
      NEXT_MILESTONE: getNextMilestone(user.points),
      REF_LINK: `${process.env.NEXT_PUBLIC_APP_URL || "https://afroe.com"}/waitlist?ref=${user.referralCode}`,
    },
  });

  if (user.phone) {
    await sendBrevoSMS({
      phone: user.phone,
      message: getSMSTemplate("milestone", undefined, { milestone }),
    });
  }

  await db.user.update({
    where: { id: userId },
    data: { lastMilestoneSent: milestone },
  });
}

export async function sendGlowEliteEmail(userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  if (user.lastMilestoneSent === 200) return;

  await sendBrevoEmail({
    to: [{ email: user.email, name: user.firstName || undefined }],
    templateId: EMAIL_TEMPLATE_IDS.GLOW_ELITE,
    params: {
      FIRSTNAME: user.firstName || "Glow Elite",
      POINTS: user.points,
      RANK: user.rank,
      REF_LINK: `${process.env.NEXT_PUBLIC_APP_URL || "https://afroe.com"}/waitlist?ref=${user.referralCode}`,
    },
  });

  if (user.phone) {
    await sendBrevoSMS({
      phone: user.phone,
      message: getSMSTemplate("glow_elite"),
    });
  }

  await db.user.update({
    where: { id: userId },
    data: { lastMilestoneSent: 200 },
  });
}

export async function checkAndSendMilestoneEmails(
  userId: string,
  oldPoints: number,
  newPoints: number
): Promise<void> {
  for (const milestone of MILESTONES) {
    if (oldPoints < milestone && newPoints >= milestone) {
      await sendMilestoneEmail(userId, milestone);
    }
  }

  if (oldPoints < 200 && newPoints >= 200) {
    await sendGlowEliteEmail(userId);
  }
}

export async function sendInactivityReminder(userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.lastRefAt) return;

  const daysSinceLastRef =
    (Date.now() - user.lastRefAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceLastRef >= 5) {
    await sendBrevoEmail({
      to: [{ email: user.email, name: user.firstName || undefined }],
      templateId: EMAIL_TEMPLATE_IDS.REMINDER_5D,
      params: {
        FIRSTNAME: user.firstName || "Glow Friend",
        POINTS: user.points,
        RANK: user.rank,
        REF_LINK: `${process.env.NEXT_PUBLIC_APP_URL || "https://afroe.com"}/waitlist?ref=${user.referralCode}`,
        NEXT_MILESTONE: getNextMilestone(user.points),
      },
    });

    if (user.phone) {
      await sendBrevoSMS({
        phone: user.phone,
        message: getSMSTemplate("reminder_5d"),
      });
    }
  }
}

export async function updateUserPoints(
  userId: string,
  pointsToAdd: number
): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const oldPoints = user.points;
  const newPoints = oldPoints + pointsToAdd;

  await db.user.update({
    where: { id: userId },
    data: {
      points: newPoints,
      refCount: { increment: 1 },
      lastRefAt: new Date(),
    },
  });

  await syncUserToBrevo(userId);
  await checkAndSendMilestoneEmails(userId, oldPoints, newPoints);
}

export async function sendWelcomeBeautyProEmail(userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "pro") return;

  const refLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://afroe.com"}/waitlist?ref=${user.referralCode}`;

  await sendBrevoEmail({
    to: [{ email: user.email, name: user.firstName || undefined }],
    templateId: EMAIL_TEMPLATE_IDS.WELCOME_BEAUTY_PRO,
    params: {
      FIRSTNAME: user.firstName || "Beauty Pro",
      REF_LINK: refLink,
      ROLE: user.role,
      POINTS: user.points,
    },
  });

  if (user.phone) {
    await sendBrevoSMS({
      phone: user.phone,
      message: getSMSTemplate("welcome_beauty_pro", undefined, { refLink }),
    });
  }

  await db.user.update({
    where: { id: userId },
    data: { emailSentAt: new Date() },
  });
}

export async function sendActivationProIRLEmail(userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "pro") return;

  const timeSinceSignup = Date.now() - user.createdAt.getTime();
  if (timeSinceSignup < 172800000) return;

  if (user.refCount === 0) {
    const refLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://afroe.com"}/waitlist?ref=${user.referralCode}`;

    await sendBrevoEmail({
      to: [{ email: user.email, name: user.firstName || undefined }],
      templateId: EMAIL_TEMPLATE_IDS.ACTIVATION_PRO_IRL,
      params: {
        FIRSTNAME: user.firstName || "Beauty Pro",
        REF_LINK: refLink,
        ROLE: user.role,
        POINTS: user.points,
        REF_COUNT: user.refCount,
      },
    });

    if (user.phone) {
      await sendBrevoSMS({
        phone: user.phone,
        message: getSMSTemplate("activation_pro_irl"),
      });
    }
  }
}
