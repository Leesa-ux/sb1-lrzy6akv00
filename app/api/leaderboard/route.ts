import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface LeaderboardEntry {
  rank: number;
  firstName: string;
  city?: string;
  role: string;
  referralsCount: number;
  points: number;
  earlyBird: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit') || '50');

    const validRoles = ['client', 'influencer', 'beautypro'];
    if (roleFilter && !validRoles.includes(roleFilter)) {
      return NextResponse.json(
        { success: false, error: 'Filtre de rôle invalide. Valeurs acceptées: client, influencer, beautypro' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Limite doit être entre 1 et 100' },
        { status: 400 }
      );
    }

    const whereClause = roleFilter ? { role: roleFilter } : {};

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        firstName: true,
        role: true,
        refCount: true,
        provisionalPoints: true,
        earlyBird: true,
        createdAt: true
      },
      orderBy: [
        { provisionalPoints: 'desc' },
        { refCount: 'desc' },
        { createdAt: 'asc' }
      ],
      take: limit
    });

    const leaderboard: LeaderboardEntry[] = users.map((user, index) => ({
      rank: index + 1,
      firstName: user.firstName || 'Anonyme',
      role: user.role,
      referralsCount: user.refCount,
      points: user.provisionalPoints,
      earlyBird: user.earlyBird
    }));

    return NextResponse.json({
      success: true,
      leaderboard,
      total: leaderboard.length,
      filter: roleFilter || 'all'
    });

  } catch (error) {
    console.error('[leaderboard] Error:', error);

    if (error instanceof Error) {
      console.error('[leaderboard] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération du classement'
      },
      { status: 500 }
    );
  }
}
