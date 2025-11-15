export type Role = "client" | "pro" | "influencer";

export type Milestone = 10 | 50 | 100 | 200;

export interface BrevoContact {
  email: string;
  firstName?: string;
  phone?: string;
  attributes: {
    ROLE: Role;
    REF_LINK: string;
    RANK: number;
    POINTS: number;
    REF_COUNT: number;
    NEXT_MILESTONE: Milestone;
    LAST_REF_AT: string;
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
  GLOW_ELITE: 107,
} as const;

export const POINT_RULES = {
  PRE_LAUNCH: {
    client: 2,
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

export function getSMSByRole(role: Role, refLink: string): string {
  const messages = {
    client: `Afroé ✨ Bienvenue sur la Glow List !\nAmi·e = +2 pts · Influenceur ≥2k = +15 pts · Pro = +25 pts.\nÀ 10 pts : badge + mise en avant + -10%.\nTon lien : ${refLink}`,
    influencer: `Afroé ✨ Bienvenue sur la Glow List !\nInfluenceur ≥2k = +15 pts · Client = +2 pts · Pro = +25 pts.\nVise 50–100 pts pour les rewards + Jackpot 3 500 €.\nTon lien : ${refLink}`,
    pro: `Afroé ✨ Bienvenue Beauty Pro !\nChaque pro = +25 pts · client = +2 pts · influenceur ≥2k = +15 pts.\nÀ 100 pts : Glow Kit + 1h coaching + Jackpot 3 500 €.\nTon lien : ${refLink}`,
  };

  return messages[role];
}
