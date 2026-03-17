import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendSmsRequest {
  phone: string;
  email?: string;
  role?: string;
}

function generateSmsCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

async function sendSmsViaBrevo(phone: string, code: string): Promise<boolean> {
  const apiKey = Deno.env.get('BREVO_API_KEY');
  const sender = Deno.env.get('BREVO_SENDER') || 'Afroe';

  if (!apiKey) {
    console.error('BREVO_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'transactional',
        sender,
        recipient: phone,
        content: `Votre code Afroé : ${code}. Valide 30 minutes.`,
        tag: 'afroe-otp',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo API error:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phone, email, role }: SendSmsRequest = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ ok: false, error: 'phone_required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const normalized = normalizePhone(phone);
    if (!normalized) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Numéro de téléphone invalide' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const code = generateSmsCode();
    const ttl = 1800;
    const expiresAt = Date.now() + ttl * 1000;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    await fetch(`${supabaseUrl}/rest/v1/sms_verification_codes`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        phone: normalized,
        code,
        expires_at: new Date(expiresAt).toISOString(),
        attempts: 0,
        verified: false,
      }),
    });

    const smsSent = await sendSmsViaBrevo(normalized, code);

    if (!smsSent) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to send SMS' }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        expiresAt,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Send SMS Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'server-error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
