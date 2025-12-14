import { PrismaClient } from '@prisma/client';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DEFAULT_LENGTH = 8;
const MAX_RETRY_ATTEMPTS = 10;

export function generateReferralCode(length: number = DEFAULT_LENGTH): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return code;
}

export async function ensureUniqueReferralCode(
  prisma: PrismaClient,
  maxAttempts: number = MAX_RETRY_ATTEMPTS
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateReferralCode();

    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true }
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error(
    `Unable to generate unique referral code after ${maxAttempts} attempts`
  );
}

export async function createUserWithUniqueRefCode<T>(
  prisma: PrismaClient,
  userData: Omit<T, 'referralCode'>,
  createFn: (data: T) => Promise<any>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const referralCode = generateReferralCode();

    try {
      const result = await createFn({
        ...userData,
        referralCode,
      } as T);

      return { success: true, data: result };
    } catch (error: any) {
      const isDuplicateError =
        error?.code === 'P2002' ||
        error?.message?.toLowerCase().includes('unique') ||
        error?.message?.toLowerCase().includes('duplicate');

      if (!isDuplicateError) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Database error'
        };
      }
    }
  }

  return {
    success: false,
    error: `Could not generate unique referral code after ${maxAttempts} attempts`
  };
}

export function isValidReferralCode(code: string): boolean {
  if (typeof code !== 'string' || code.length !== DEFAULT_LENGTH) {
    return false;
  }

  for (const char of code) {
    if (!ALPHABET.includes(char)) {
      return false;
    }
  }

  return true;
}

export function getReferralLink(referralCode: string, baseUrl?: string): string {
  const url = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${url}?ref=${referralCode}`;
}
