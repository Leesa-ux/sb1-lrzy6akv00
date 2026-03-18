import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') ?? 'all';

    const res = await fetch(
      `https://yubmsrvzzcrubmshflpk.supabase.co/functions/v1/get-leaderboard?role=${role}`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
