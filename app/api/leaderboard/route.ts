import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') ?? 'all';

  // ✅ Variables lues DANS la fonction — jamais au niveau module
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { success: false, error: 'Missing Supabase environment variables' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    let query = supabase
      .from('User')
      .select('id, firstName, email, role, points, ref_count, earlyBird, isBlocked')
      .eq('isBlocked', false)
      .order('points', { ascending: false })
      .limit(50);

    if (role !== 'all') {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const getTier = (points: number): string => {
      if (points >= 200) return 'Legend';
      if (points >= 100) return 'Elite Influencer';
      if (points >= 50)  return 'Top Glower';
      if (points >= 20)  return 'Rising Star';
      return 'Glow Starter';
    };

    const maskEmail = (email: string): string => {
      const [local, domain] = email.split('@');
      if (!local || !domain) return '';
      return local[0] + '***@' + domain;
    };

    const leaderboard = (users ?? []).map((u, i) => ({
      rank:           i + 1,
      firstName:      u.firstName ?? 'Participant',
      emailMasked:    u.email ? maskEmail(u.email) : undefined,
      role:           u.role,
      referralsCount: u.ref_count ?? 0,
      points:         u.points ?? 0,
      earlyBird:      u.earlyBird ?? false,
      tier:           getTier(u.points ?? 0),
    }));

    return NextResponse.json({
      success: true,
      leaderboard,
      total:  leaderboard.length,
      filter: role,
    });

  } catch (err) {
    console.error('[api/leaderboard] error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
