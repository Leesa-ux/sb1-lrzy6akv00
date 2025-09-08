import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic"; // pour Vercel Cron

export async function GET() {
  try {
    const users = await db.user.findMany({ select: { id:true }});

    // En prod → prévoir batching/file d’attente
    await Promise.allSettled(
      users.map(u =>
        fetch(`${process.env.APP_URL}/api/progress-email`, {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ userId: u.id, kind: "weekly" })
        })
      )
    );

    return NextResponse.json({ ok:true, count: users.length });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || "server_error" }, { status:500 });
  }
}