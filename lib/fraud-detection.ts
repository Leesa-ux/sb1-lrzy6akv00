import { isTempEmail } from "./temp-email-domains";

export interface FraudCheckResult {
  isBlocked: boolean;
  flags: string[];
  reason?: string;
}

export interface SignupMetadata {
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  formLoadTime?: number;
  formSubmitTime: number;
  email: string;
}

export interface ReferralMetadata {
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  referrerCode: string;
  referrerIp?: string;
  referrerFingerprint?: string;
}

export async function checkSignupFraud(
  metadata: SignupMetadata,
  supabase: any
): Promise<FraudCheckResult> {
  const flags: string[] = [];
  let isBlocked = false;
  let reason: string | undefined;

  if (isTempEmail(metadata.email)) {
    isBlocked = true;
    flags.push("temp_email");
    reason = "Temporary email domains are not allowed";
  }

  if (metadata.formLoadTime && metadata.formSubmitTime) {
    const timeToSubmit = (metadata.formSubmitTime - metadata.formLoadTime) / 1000;
    if (timeToSubmit < 3) {
      flags.push("fast_submit");
    }
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: recentSignups } = await supabase
    .from("ip_activity")
    .select("id")
    .eq("ip_address", metadata.ipAddress)
    .eq("action_type", "signup")
    .gte("created_at", oneHourAgo);

  if (recentSignups && recentSignups.length >= 3) {
    flags.push("repeated_ip");
  }

  if (metadata.userAgent) {
    const { data: sameUserAgent } = await supabase
      .from("signup_metadata")
      .select("id")
      .eq("user_agent", metadata.userAgent)
      .gte("created_at", oneHourAgo);

    if (sameUserAgent && sameUserAgent.length >= 3) {
      flags.push("repeated_user_agent");
    }
  }

  if (metadata.deviceFingerprint) {
    const { data: sameFingerprint } = await supabase
      .from("signup_metadata")
      .select("id")
      .eq("device_fingerprint", metadata.deviceFingerprint)
      .gte("created_at", oneHourAgo);

    if (sameFingerprint && sameFingerprint.length >= 2) {
      flags.push("repeated_device");
    }
  }

  return { isBlocked, flags, reason };
}

export async function checkReferralFraud(
  metadata: ReferralMetadata,
  supabase: any
): Promise<FraudCheckResult> {
  const flags: string[] = [];
  let isBlocked = false;
  let reason: string | undefined;

  if (metadata.referrerIp && metadata.ipAddress === metadata.referrerIp) {
    isBlocked = true;
    flags.push("same_ip_as_referrer");
    reason = "Self-referral detected (same IP)";
  }

  if (
    metadata.referrerFingerprint &&
    metadata.deviceFingerprint &&
    metadata.referrerFingerprint === metadata.deviceFingerprint
  ) {
    isBlocked = true;
    flags.push("same_device_as_referrer");
    reason = "Self-referral detected (same device)";
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: recentReferrals } = await supabase
    .from("ip_activity")
    .select("id")
    .eq("ip_address", metadata.ipAddress)
    .eq("action_type", "referral")
    .gte("created_at", oneHourAgo);

  if (recentReferrals && recentReferrals.length >= 1) {
    flags.push("multiple_referrals_per_hour");
  }

  return { isBlocked, flags, reason };
}

export async function logIpActivity(
  supabase: any,
  ipAddress: string,
  actionType: string,
  userId?: string,
  metadata?: any
): Promise<void> {
  await supabase.from("ip_activity").insert({
    ip_address: ipAddress,
    action_type: actionType,
    user_id: userId,
    metadata: metadata || {},
  });
}
