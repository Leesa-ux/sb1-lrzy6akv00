import { sendBrevoEmail } from './brevo-client';
import { EMAIL_TEMPLATE_IDS, Role } from './brevo-types';

function mapRoleForBrevo(role: 'client' | 'influencer' | 'beautypro'): Role {
  if (role === 'beautypro') return 'pro';
  return role;
}

interface WelcomeEmailPayload {
  email: string;
  firstName?: string | null;
  role: 'client' | 'influencer' | 'beautypro';
  refLink: string;
  rank: number;
  points: number;
  nextMilestone: number;
}

async function sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<void> {
  const { email, firstName, role, refLink, rank, points, nextMilestone } = payload;

  await sendBrevoEmail({
    to: [{ email, name: firstName || undefined }],
    templateId: EMAIL_TEMPLATE_IDS.WELCOME,
    params: {
      FIRSTNAME: firstName || 'Glow Friend',
      ROLE: mapRoleForBrevo(role),
      REF_LINK: refLink,
      RANK: rank,
      POINTS: points,
      NEXT_MILESTONE: nextMilestone,
    },
  });
}

export async function sendClientWelcomeEmail(payload: WelcomeEmailPayload): Promise<void> {
  await sendWelcomeEmail({ ...payload, role: 'client' });
}

export async function sendInfluencerWelcomeEmail(payload: WelcomeEmailPayload): Promise<void> {
  await sendWelcomeEmail({ ...payload, role: 'influencer' });
}

export async function sendBeautyProWelcomeEmail(payload: WelcomeEmailPayload): Promise<void> {
  await sendWelcomeEmail({ ...payload, role: 'beautypro' });
}
