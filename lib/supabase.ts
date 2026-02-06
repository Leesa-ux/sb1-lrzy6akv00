import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

export function supabaseAdmin() {
  const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SERVICE_ROLE_KEY is required for admin operations");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  email_masked: string;
  email: string;
  first_name: string;
  role: string;
  referrals_count: number;
  total_points: number;
  early_bird: boolean;
  tier: string;
  created_at: string;
}
