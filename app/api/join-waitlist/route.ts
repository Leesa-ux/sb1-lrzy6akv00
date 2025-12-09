import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateEmail, validatePhone, sanitizeEmail, sanitizePhone, sanitizeText } from '@/lib/validation';
import { getClientIp } from '@/lib/get-client-ip';
import { POINTS_CONFIG, calculateProvisionalPoints } from '@/lib/points';

const prisma = new PrismaClient();

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function ensureUniqueReferralCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateReferralCode();
    const existing = await prisma.user.findFirst({
      where: { referralCode: code }
    });

    if (!existing) {
      return code;
    }
    attempts++;
  }

  throw new Error('Unable to generate unique referral code');
}

interface JoinWaitlistBody {
  email: string;
  phone: string;
  first_name: string;
  last_name?: string;
  city?: string;
  role: 'client' | 'influencer' | 'beautypro';
  referral_code?: string;
  skillAnswerCorrect?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: JoinWaitlistBody = await request.json();
    const { email, phone, first_name, last_name, city, role, referral_code, skillAnswerCorrect } = body;

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { success: false, error: emailValidation.error },
        { status: 400 }
      );
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { success: false, error: phoneValidation.error },
        { status: 400 }
      );
    }

    if (!first_name || first_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prénom requis' },
        { status: 400 }
      );
    }

    const validRoles = ['client', 'influencer', 'beautypro'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Rôle invalide. Valeurs acceptées: client, influencer, beautypro' },
        { status: 400 }
      );
    }

    if (skillAnswerCorrect !== true) {
      return NextResponse.json(
        { success: false, error: 'Réponse à la question d\'habileté incorrecte ou manquante' },
        { status: 400 }
      );
    }

    const cleanEmail = sanitizeEmail(email);
    const cleanPhone = sanitizePhone(phone);
    const cleanFirstName = sanitizeText(first_name, 50);
    const cleanLastName = last_name ? sanitizeText(last_name, 50) : undefined;
    const cleanCity = city ? sanitizeText(city, 100) : undefined;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { phone: cleanPhone }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: existingUser.email === cleanEmail
            ? 'Cet email est déjà inscrit'
            : 'Ce numéro de téléphone est déjà inscrit'
        },
        { status: 409 }
      );
    }

    let referrer = null;
    if (referral_code) {
      referrer = await prisma.user.findUnique({
        where: { referralCode: referral_code }
      });

      if (!referrer) {
        return NextResponse.json(
          { success: false, error: 'Code de parrainage invalide' },
          { status: 400 }
        );
      }
    }

    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const myReferralCode = await ensureUniqueReferralCode();

    const earlyBirdCount = await prisma.user.count({
      where: { earlyBird: true }
    });
    const isEarlyBird = earlyBirdCount < POINTS_CONFIG.EARLY_BIRD_LIMIT;
    const earlyBirdBonus = isEarlyBird ? POINTS_CONFIG.EARLY_BIRD_BONUS : 0;

    const newUser = await prisma.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: cleanEmail,
        phone: cleanPhone,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        role: role,
        referralCode: myReferralCode,
        referredBy: referrer?.referralCode,
        phoneVerified: false,
        referralValidated: false,
        fraudScore: 0,
        refCount: 0,
        waitlistClients: 0,
        waitlistInfluencers: 0,
        waitlistPros: 0,
        appDownloads: 0,
        validatedInfluencers: 0,
        validatedPros: 0,
        earlyBird: isEarlyBird,
        earlyBirdBonus: earlyBirdBonus,
        provisionalPoints: earlyBirdBonus,
        finalPoints: 0,
        rank: 0,
        nextMilestone: 10,
        eligibleForJackpot: false,
        isTopRank: false,
        points: earlyBirdBonus,
        skillAnswerCorrect: skillAnswerCorrect === true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    if (referrer) {
      let pointsAwarded = 0;
      let counterField: 'waitlistClients' | 'waitlistInfluencers' | 'waitlistPros';

      switch (role) {
        case 'client':
          pointsAwarded = POINTS_CONFIG.WAITLIST.CLIENT;
          counterField = 'waitlistClients';
          break;
        case 'influencer':
          pointsAwarded = POINTS_CONFIG.WAITLIST.INFLUENCER;
          counterField = 'waitlistInfluencers';
          break;
        case 'beautypro':
          pointsAwarded = POINTS_CONFIG.WAITLIST.BEAUTY_PRO;
          counterField = 'waitlistPros';
          break;
      }

      const updatedReferrer = await prisma.user.update({
        where: { id: referrer.id },
        data: {
          refCount: { increment: 1 },
          [counterField]: { increment: 1 },
          lastRefAt: new Date()
        }
      });

      const newProvisionalPoints = calculateProvisionalPoints({
        waitlistClients: updatedReferrer.waitlistClients,
        waitlistInfluencers: updatedReferrer.waitlistInfluencers,
        waitlistPros: updatedReferrer.waitlistPros,
        appDownloads: updatedReferrer.appDownloads,
        validatedInfluencers: updatedReferrer.validatedInfluencers,
        validatedPros: updatedReferrer.validatedPros,
        earlyBirdBonus: updatedReferrer.earlyBirdBonus
      });

      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          provisionalPoints: newProvisionalPoints,
          points: newProvisionalPoints
        }
      });

      await prisma.referralEvent.create({
        data: {
          id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          actorL1Id: referrer.id,
          actorL2Id: newUser.id,
          type: 'waitlist_signup',
          roleAtSignup: role,
          pointsAwarded: pointsAwarded,
          createdAt: new Date()
        }
      });
    }

    // TODO: Add signup_metadata model to Prisma schema to enable fraud tracking
    // await prisma.signupMetadata.create({
    //   data: {
    //     userId: newUser.id,
    //     ipAddress: ipAddress,
    //     userAgent: userAgent,
    //     formSubmitTime: new Date(),
    //     fraudFlags: [],
    //     isBlocked: false
    //   }
    // });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        referralCode: newUser.referralCode,
        points: newUser.provisionalPoints,
        earlyBird: newUser.earlyBird,
        createdAt: newUser.createdAt
      },
      referralCode: newUser.referralCode,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?ref=${newUser.referralCode}`
    });

  } catch (error) {
    console.error('[join-waitlist] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to join waitlist.' },
    { status: 405 }
  );
}
