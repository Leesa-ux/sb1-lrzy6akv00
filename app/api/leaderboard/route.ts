import { NextRequest, NextResponse } from 'next/server';
import { supabase, type LeaderboardEntry } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface LeaderboardResponse {
  rank: number;
  firstName: string;
  emailMasked: string;
  role: string;
  referralsCount: number;
  points: number;
  earlyBird: boolean;
  tier: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');

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

    if (userId) {
      const { data, error } = await supabase
        .from('referral_leaderboard_with_tier')
        .select('rank, total_points, tier, first_name, email_masked, referrals_count, role, early_bird')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[leaderboard] Error fetching user rank:', error);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la récupération de votre classement' },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { success: false, error: 'Utilisateur non trouvé dans le classement' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        userRank: {
          rank: data.rank,
          points: data.total_points,
          tier: data.tier,
          firstName: data.first_name,
          emailMasked: data.email_masked,
          referralsCount: data.referrals_count,
          role: data.role,
          earlyBird: data.early_bird
        }
      });
    }

    let query = supabase
      .from('referral_leaderboard_with_tier')
      .select('rank, first_name, email_masked, role, referrals_count, total_points, early_bird, tier')
      .order('rank', { ascending: true })
      .limit(limit);

    if (roleFilter) {
      query = query.eq('role', roleFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[leaderboard] Error:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du classement' },
        { status: 500 }
      );
    }

    const leaderboard: LeaderboardResponse[] = (data || []).map((user) => ({
      rank: user.rank,
      firstName: user.first_name || 'Anonyme',
      emailMasked: user.email_masked,
      role: user.role,
      referralsCount: user.referrals_count,
      points: user.total_points,
      earlyBird: user.early_bird,
      tier: user.tier
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
