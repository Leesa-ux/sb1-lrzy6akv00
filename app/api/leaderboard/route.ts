import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const getTier = (points: number) => {
  if (points >= 200) return 'Leader Circle';
  if (points >= 100) return 'Glow Icons';
  if (points >= 50)  return 'Circle Insiders';
  if (points >= 10)  return 'Glow Starter';
  return 'En route';
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') ?? 'all';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
                     || process.env.SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 });
    }

    let url = `${supabaseUrl}/rest/v1/User?select=id,firstName,email,role,points,ref_count,isBlocked&isBlocked=eq.false&order=points.desc&limit=50`;
    if (role !== 'all') url += `&role=eq.${encodeURIComponent(role)}`;

    const res = await fetch(url, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const users = await res.json();

    const leaderboard = users.map((u: any, i: number) => ({
      rank:           i + 1,
      firstName:      u.firstName ?? 'Participant',
      role:           u.role,
      referralsCount: u.ref_count ?? 0,
      points:         u.points ?? 0,
      tier:           getTier(u.points ?? 0),
    }));

    return NextResponse.json({ success: true, leaderboard, total: leaderboard.length });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
