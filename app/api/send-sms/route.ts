import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, email, role } = body;
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });
    const res = await fetch('https://yubmsrvzzcrubmshflpk.supabase.co/functions/v1/send-sms-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, email, role }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
