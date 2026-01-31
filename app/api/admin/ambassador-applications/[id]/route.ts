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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("ambassador_applications")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));
  const supabase = supabaseAdmin();

  const allowed = new Set(["pending", "reviewing", "approved", "rejected"]);
  if (body.status && !allowed.has(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const patch: any = {};
  if (body.status) {
    patch.status = body.status;
    patch.reviewed_at = new Date().toISOString();
  }
  if (typeof body.admin_notes === "string") {
    patch.admin_notes = body.admin_notes;
  }

  const { data, error } = await supabase
    .from("ambassador_applications")
    .update(patch)
    .eq("id", params.id)
    .select("id,status,admin_notes")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}
