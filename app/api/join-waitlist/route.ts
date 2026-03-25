import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const payload = {
      email:         body.email,
      phone:         body.phone,
      firstName:     body.firstName,
      lastName:      body.lastName,
      userType:      body.role || body.userType,
      followerCount: body.followerCount,
      referralCode:  body.referredBy || body.referralCode || body.ref,
      skillAnswer:   body.skillAnswer !== undefined ? Number(body.skillAnswer) : 32,
      consent:       body.consent ?? true,
    };

    const res = await fetch(
      'https://yubmsrvzzcrubmshflpk.supabase.co/functions/v1/join-waitlist',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-origin': request.headers.get('origin') || 'https://afroebeauty.com',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    // Add refLink alias so WaitlistForm.tsx can read data.refLink
    if (data.shareUrl) data.refLink = data.shareUrl;
    return NextResponse.json(data, { status: res.status });

  } catch (err) {
    console.error('[api/join-waitlist] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
