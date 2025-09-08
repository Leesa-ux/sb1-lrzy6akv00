import { db } from "@/lib/db"; // adjust import if your prisma client is in a different path

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
 * Resolve the direct referrer and root influencer based on a referral code
 */
export async function resolveReferrers(refCode?: string) {
  let directReferrer: any = null;
  let rootInfluencer: any = null;

  if (refCode) {
    directReferrer = await db.user.findUnique({ where: { referralCode: refCode } });
    if (directReferrer) {
      if (directReferrer.rootInfluencerId) {
        rootInfluencer = await db.user.findUnique({ where: { id: directReferrer.rootInfluencerId } });
      } else if (directReferrer.role === "influenceur") {
        rootInfluencer = directReferrer;
      }
    }
  }

  return { directReferrer, rootInfluencer };
}