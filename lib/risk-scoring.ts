import { isTempEmail } from "./temp-email-domains";

export interface RiskFactors {
  tempEmail: boolean;
  ipAbuse: boolean;
  userAgentReuse: boolean;
  referralClustering: boolean;
  unopenedEmails: boolean;
  fastSubmit: boolean;
  repeatedDevice: boolean;
}

export interface UserRiskData {
  userId: string;
  email: string;
  createdAt: Date;
  emailOpenedAt?: Date | null;
  signupMetadata?: {
    ipAddress: string;
    userAgent: string;
    deviceFingerprint?: string;
    fraudFlags: string[];
  };
  referralTracking?: {
    fraudFlags: string[];
  }[];
}

export function calculateRiskScore(
  user: UserRiskData,
  ipCounts: Map<string, number>,
  userAgentCounts: Map<string, number>,
  deviceCounts: Map<string, number>,
  referralClusters: Map<string, number>
): { score: number; factors: RiskFactors } {
  let score = 0;
  const factors: RiskFactors = {
    tempEmail: false,
    ipAbuse: false,
    userAgentReuse: false,
    referralClustering: false,
    unopenedEmails: false,
    fastSubmit: false,
    repeatedDevice: false,
  };

  if (isTempEmail(user.email)) {
    factors.tempEmail = true;
    score += 50;
  }

  if (user.signupMetadata) {
    const { ipAddress, userAgent, deviceFingerprint, fraudFlags } = user.signupMetadata;

    if (ipCounts.get(ipAddress) && ipCounts.get(ipAddress)! >= 3) {
      factors.ipAbuse = true;
      score += 30;
    }

    if (userAgent && userAgentCounts.get(userAgent) && userAgentCounts.get(userAgent)! >= 3) {
      factors.userAgentReuse = true;
      score += 25;
    }

    if (deviceFingerprint && deviceCounts.get(deviceFingerprint) && deviceCounts.get(deviceFingerprint)! >= 2) {
      factors.repeatedDevice = true;
      score += 20;
    }

    if (fraudFlags.includes("fast_submit")) {
      factors.fastSubmit = true;
      score += 10;
    }
  }

  if (user.referralTracking && user.referralTracking.length > 0) {
    const suspiciousReferrals = user.referralTracking.filter(
      (rt) => rt.fraudFlags && rt.fraudFlags.length > 0
    );

    if (suspiciousReferrals.length >= 2) {
      factors.referralClustering = true;
      score += 30;
    }
  }

  const emailSentDaysAgo = user.createdAt
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (emailSentDaysAgo >= 3 && !user.emailOpenedAt) {
    factors.unopenedEmails = true;
    score += 15;
  }

  return { score, factors };
}

export function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 80) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

export function buildCounts(
  signupMetadata: Array<{
    ipAddress: string;
    userAgent: string;
    deviceFingerprint?: string | null;
  }>
): {
  ipCounts: Map<string, number>;
  userAgentCounts: Map<string, number>;
  deviceCounts: Map<string, number>;
} {
  const ipCounts = new Map<string, number>();
  const userAgentCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();

  for (const metadata of signupMetadata) {
    ipCounts.set(metadata.ipAddress, (ipCounts.get(metadata.ipAddress) || 0) + 1);

    if (metadata.userAgent) {
      userAgentCounts.set(
        metadata.userAgent,
        (userAgentCounts.get(metadata.userAgent) || 0) + 1
      );
    }

    if (metadata.deviceFingerprint) {
      deviceCounts.set(
        metadata.deviceFingerprint,
        (deviceCounts.get(metadata.deviceFingerprint) || 0) + 1
      );
    }
  }

  return { ipCounts, userAgentCounts, deviceCounts };
}
