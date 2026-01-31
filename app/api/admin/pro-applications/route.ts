import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const city = searchParams.get("city");

  const supabase = supabaseAdmin();
  let q = supabase
    .from("pro_applications")
    .select("id,created_at,status,first_name,last_name,email,city,certifications,portfolio_url,portfolio_paths,next_action")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) q = q.eq("status", status);
  if (city) q = q.eq("city", city);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, next_action, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Application ID required" }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const updates: any = { updated_at: new Date().toISOString() };

    if (status) updates.status = status;
    if (next_action !== undefined) updates.next_action = next_action;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const { data, error } = await supabase
      .from("pro_applications")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
