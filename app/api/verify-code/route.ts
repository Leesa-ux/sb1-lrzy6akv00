import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, code } = body;
    if (!phone || !code) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const res = await fetch('https://yubmsrvzzcrubmshflpk.supabase.co/functions/v1/verify-sms-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
