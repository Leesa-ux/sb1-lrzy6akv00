import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyCodeRequest {
  phone: string;
  code: string;
}

function normalizePhone(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('32')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('04')) {
    return `+32${cleaned.substring(1)}`;
  }
  if (cleaned.length === 9 && cleaned.startsWith('4')) {
    return `+32${cleaned}`;
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phone, code }: VerifyCodeRequest = await req.json();

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ verified: false, error: 'missing' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const normalized = normalizePhone(phone);
    if (!normalized) {
      return new Response(
        JSON.stringify({ verified: false, error: 'Numéro invalide' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const verificationResponse = await fetch(
      `${supabaseUrl}/rest/v1/sms_verification_codes?phone=eq.${encodeURIComponent(normalized)}&verified=eq.false&order=created_at.desc&limit=1`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const verifications = await verificationResponse.json();

    if (!verifications || verifications.length === 0) {
      return new Response(
        JSON.stringify({ verified: false, expired: true, error: 'Code non trouvé ou expiré' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const verification = verifications[0];

    if (new Date(verification.expires_at).getTime() < Date.now()) {
      return new Response(
        JSON.stringify({ verified: false, expired: true, error: 'Code expiré' }),
        {
          status: 410,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (verification.attempts >= 5) {
      return new Response(
        JSON.stringify({ verified: false, error: 'Trop de tentatives pour ce code' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (verification.code !== String(code).trim()) {
      await fetch(`${supabaseUrl}/rest/v1/sms_verification_codes?id=eq.${verification.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          attempts: verification.attempts + 1,
        }),
      });

      return new Response(
        JSON.stringify({ verified: false, expired: false, error: 'Code incorrect' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await fetch(`${supabaseUrl}/rest/v1/sms_verification_codes?id=eq.${verification.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        verified: true,
      }),
    });

    return new Response(
      JSON.stringify({
        verified: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Verify Code Error:', error);
    return new Response(
      JSON.stringify({ verified: false, error: 'server-error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
