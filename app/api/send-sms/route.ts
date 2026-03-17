import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, email, role } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone required' }, { status: 400 });
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-sms-code`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ phone, email, role }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);

  } catch (err) {
    console.error('[api/send-sms] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
