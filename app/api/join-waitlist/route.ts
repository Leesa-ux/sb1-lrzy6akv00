import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { validateEmail, validatePhone, sanitizeEmail, sanitizePhone, sanitizeText } from '@/lib/validation';
import { getClientIp } from '@/lib/get-client-ip';
import { POINTS_CONFIG, calculateProvisionalPoints } from '@/lib/points';
import {
  sendClientWelcomeEmail,
  sendInfluencerWelcomeEmail,
  sendBeautyProWelcomeEmail,
} from '@/lib/brevo-welcome';
import { ensureUniqueReferralCode, isValidReferralCode } from '@/lib/referral-code';

interface JoinWaitlistBody {
  email: string;
  phone: string;
  first_name: string;
  last_name?: string;
  city?: string;
  role: 'client' | 'influencer' | 'beautypro';
  referral_code?: string;
  skillAnswerCorrect?: boolean;
  consentGdpr?: boolean;
  consentSms?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
      console.error('[join-waitlist] DATABASE_URL is not configured properly');
      console.error('[join-waitlist] Current DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration de la base de données manquante. Veuillez contacter l\'administrateur.'
        },
        { status: 500 }
      );
    }

    const body: JoinWaitlistBody = await request.json();
    const { email, phone, first_name, last_name, city, role, referral_code, skillAnswerCorrect, consentGdpr, consentSms } = body;

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
      if (!isValidReferralCode(referral_code)) {
        return NextResponse.json(
          { success: false, error: 'Format de code de parrainage invalide' },
          { status: 400 }
        );
      }

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
    const myReferralCode = await ensureUniqueReferralCode(prisma);

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
        consentGdpr: consentGdpr === true,
        consentSms: consentSms !== false,
        consentAt: (consentGdpr === true || consentSms !== undefined) ? new Date() : undefined,
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

      const idempotencyKey = `${referrer.id}_${newUser.id}_waitlist_signup`;

      await prisma.referralEvent.create({
        data: {
          id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          actorL1Id: referrer.id,
          actorL2Id: newUser.id,
          type: 'waitlist_signup',
          roleAtSignup: role,
          pointsAwarded: pointsAwarded,
          idempotencyKey: idempotencyKey,
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

    const refLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://afroe.studio'}?ref=${newUser.referralCode}`;

    try {
      const basePayload = {
        email: newUser.email,
        firstName: newUser.firstName,
        role,
        refLink,
        rank: newUser.rank || 0,
        points: newUser.provisionalPoints || 0,
        nextMilestone: newUser.nextMilestone || 10,
      };

      if (role === 'client') {
        await sendClientWelcomeEmail(basePayload);
      } else if (role === 'influencer') {
        await sendInfluencerWelcomeEmail(basePayload);
      } else if (role === 'beautypro') {
        await sendBeautyProWelcomeEmail(basePayload);
      }
    } catch (e) {
      console.error('Erreur envoi email Welcome:', e);
    }

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

    if (error instanceof Error) {
      console.error('[join-waitlist] Error name:', error.name);
      console.error('[join-waitlist] Error message:', error.message);
      console.error('[join-waitlist] Error stack:', error.stack);
    }

    const isDatabaseError = error instanceof Error && (
      error.message.includes('database') ||
      error.message.includes('Prisma') ||
      error.message.includes('authentication') ||
      error.message.includes('connection')
    );

    if (isDatabaseError) {
      console.error('[join-waitlist] DATABASE CONNECTION ERROR - Check DATABASE_URL in .env');
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to join waitlist.' },
    { status: 405 }
  );
}
