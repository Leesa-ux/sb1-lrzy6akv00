export type Role = "client" | "pro" | "influencer";

/** Values that Brevo automation branches actually check */
export type BrevoRole = "client" | "pro" | "amb";

/**
 * Maps internal DB role → Brevo ROLE attribute value.
 * Brevo automation branches use: client | pro | amb
 */
export function mapRoleForBrevo(dbRole: string): BrevoRole {
  if (dbRole === "beauty_pro" || dbRole === "beautypro" || dbRole === "pro") return "pro";
  if (dbRole === "influencer") return "amb";
  return "client";
}

export type Milestone = 10 | 50 | 100 | 200;

export interface BrevoContact {
  email: string;
  firstName?: string;
  phone?: string;
  listIds?: number[];
  attributes: {
    ROLE: BrevoRole;
    REFERRAL_LINK: string;
    MY_GLOW_LINK?: string;
    RANK: number;
    REFERRAL_POINTS: number;
    POINTS: number;
    PROVISIONAL_POINTS?: number;
    FINAL_POINTS?: number;
    REF_COUNT: number;
    NEXT_MILESTONE: number; // Changed from Milestone to number to allow any integer
    LAST_REF_AT: string;
    EARLY_BIRD?: boolean;
    EARLY_BIRD_BONUS?: number;
    WAITLIST_CLIENTS?: number;
    WAITLIST_INFLUENCERS?: number;
    WAITLIST_PROS?: number;
    APP_DOWNLOADS?: number;
    VALIDATED_INFLUENCERS?: number;
    VALIDATED_PROS?: number;
    ELIGIBLE_FOR_JACKPOT?: boolean;
    IS_TOP_RANK?: boolean;
  };
}

export interface BrevoEmailParams {
  to: Array<{ email: string; name?: string }>;
  templateId: number;
  params: Record<string, any>;
}

export interface BrevoSMSParams {
  phone: string;
  message: string;
}

export const EMAIL_TEMPLATE_IDS = {
  WELCOME: 101,
  FOLLOWUP_1H: 102,
  ACTIVATION_48H: 103,
  MILESTONE: 104,
  REMINDER_5D: 105,
  LAUNCH_DAY: 106,
  WELCOME_BEAUTY_PRO: 107,
  ACTIVATION_PRO_IRL: 108,
  GLOW_ELITE: 109,
  FOLLOWUP_INFLUENCER_COLLAB: 110,
  INFLUENCER_PROGRESS_CONTEST: 111,
  INFLUENCER_CREATOR_TEST_DAY: 112,
  INFLUENCER_COLLAB_APPROVED: 113,
  INFLUENCER_COLLAB_DECLINED: 114,
  AMBASSADOR_WELCOME: 115,
  AMBASSADOR_CONTRACT_FOLLOWUP_J7: 116,
  AMBASSADOR_CONTRACT_REMINDER_J45: 117,
} as const;

export const POINT_RULES = {
  PRE_LAUNCH: {
    client: 5,
    influencer: 15,
    pro: 25,
  },
  POST_LAUNCH: {
    client: 10,
    influencer: 50,
    pro: 100,
  },
} as const;

export const MILESTONES: Milestone[] = [10, 50, 100, 200];

export function getSMSByRole(dbRole: string, refLink: string): string {
  const { getSMSTemplate } = require("./sms-templates");
  // SMS templates use keys: client | influencer | pro
  const smsRole: Role =
    dbRole === "beauty_pro" || dbRole === "beautypro" ? "pro"
    : dbRole === "influencer" ? "influencer"
    : "client";
  return getSMSTemplate("welcome", smsRole, { refLink });
}
