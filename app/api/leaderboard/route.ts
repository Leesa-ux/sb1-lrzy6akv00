import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getTier = (points: number): string => {
  if (points >= 200) return 'Leader Circle';
  if (points >= 100) return 'Glow Icons';
  if (points >= 50)  return 'Circle Insiders';
  if (points >= 10)  return 'Glow Starter';
  return 'En route';
};

const maskEmail = (email: string): string => {
  try {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '';
    return local[0] + '***@' + domain;
  } catch {
    return '';
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') ?? 'all';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('[leaderboard] Missing env vars:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceKey,
      });
      return NextResponse.json(
        { success: false, error: 'Missing Supabase environment variables' },
        { status: 500 }
      );
    }

    // Requête directe via REST Supabase — pas de createClient
    // Évite tout problème d'import ou de bundling
    let url = `${supabaseUrl}/rest/v1/User`
      + `?select=id,firstName,email,role,points,ref_count,isBlocked`
      + `&isBlocked=eq.false`
      + `&order=points.desc`
      + `&limit=50`;

    if (role !== 'all') {
      url += `&role=eq.${encodeURIComponent(role)}`;
    }

    const res = await fetch(url, {
      headers: {
        'apikey':        serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type':  'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[leaderboard] Supabase error:', res.status, errText);
      return NextResponse.json(
        { success: false, error: `Database error: ${res.status}` },
        { status: 500 }
      );
    }

    const users = await res.json() as Array<{
      id: string;
      firstName: string | null;
      email: string;
      role: string;
      points: number;
      ref_count: number;
      isBlocked: boolean;
    }>;

    const leaderboard = users.map((u, i) => ({
      rank:           i + 1,
      firstName:      u.firstName ?? 'Participant',
      emailMasked:    u.email ? maskEmail(u.email) : undefined,
      role:           u.role,
      referralsCount: u.ref_count ?? 0,
      points:         u.points ?? 0,
      tier:           getTier(u.points ?? 0),
    }));

    return NextResponse.json({
      success:     true,
      leaderboard,
      total:       leaderboard.length,
      filter:      role,
    });

  } catch (err) {
    console.error('[leaderboard] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
