import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserPoints, nextMilestone, palier2Copy } from "@/lib/points";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.APP_URL || "https://afroe.app";

export async function POST(req: Request) {
  try {
    const { userId, kind } = await req.json() as { userId: string; kind: "weekly"|"leaderboard"|"lastcall" };
    const u = await db.user.findUnique({ where: { id: userId }});
    if (!u) return NextResponse.json({ ok:false, error:"user_not_found" }, { status:404 });

    const { total } = await getUserPoints(u.id);
    const nm = nextMilestone(total);
    const referralLink = `${APP_URL}/?ref=${u.referralCode}`;
    const pal2 = palier2Copy(u.role as any);

    let subject = "", html = "", preheader = "";

    if (kind === "weekly") {
      subject = `${u.email.split("@")[0]}, t’es à ${total} pts — encore ${nm.missing} pour ${nm.emoji}`;
      preheader = `Il te manque ${nm.missing} pts pour le prochain palier.`;
      html = `
        <h1>Ton score Afroé : ${total} pts 🔥</h1>
        <p>Encore <b>${nm.missing} pts</b> et tu débloques <b>${nm.target} pts</b> ${nm.emoji}.</p>
        <ul>
          <li>🌱 10 pts → Badge VIP + Tuto</li>
          <li>✨ 25 pts → ${pal2}</li>
          <li>💎 50 pts → Afroé Pack</li>
          <li>🔥 100 pts → Cagnotte 3 500 €</li>
        </ul>
        <p>Ton lien à partager : <a href="${referralLink}">${referralLink}</a></p>
        <p style="color:#999;font-size:13px">Astuce : Story + DM groupé = boost rapide.</p>
      `;
    }

    if (kind === "leaderboard") {
      const all = await db.user.findMany({ select: { id:true, email:true, role:true, referralCode:true }});
      const scored = await Promise.all(all.map(async (x: { id: string; email: string; role: string; referralCode: string }) => {
        const { total } = await getUserPoints(x.id);
        return { ...x, total };
      }));
      scored.sort((a: { total: number }, b: { total: number }) => b.total - a.total);
      const idx = scored.findIndex((x: { id: string }) => x.id === u.id);
      const top = scored.slice(0,3);

      subject = `Leaderboard Afroé — tu es #${idx+1} avec ${total} pts`;
      preheader = `Le top bouge. Tu montes ou tu laisses passer ?`;
      html = `
        <h1>Le Top Afroé 🔥</h1>
        <ol>
          <li>🥇 ${top[0]?.email ?? '—'} — ${top[0]?.total ?? 0} pts</li>
          <li>🥈 ${top[1]?.email ?? '—'} — ${top[1]?.total ?? 0} pts</li>
          <li>🥉 ${top[2]?.email ?? '—'} — ${top[2]?.total ?? 0} pts</li>
        </ol>
        <p>Toi : <b>#${idx+1}</b> avec <b>${total} pts</b>.</p>
        <p>Encore <b>${nm.missing}</b> pour <b>${nm.target} pts</b> ${nm.emoji}.</p>
        <p>Ton lien : <a href="${referralLink}">${referralLink}</a></p>
      `;
    }

    if (kind === "lastcall") {
      const END = new Date(process.env.CAMPAIGN_END || "2025-10-01T23:59:59Z").getTime();
      const diff = Math.max(0, END - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      const countdown = `${d}j ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;

      subject = `⏳ ${u.email.split("@")[0]}, ${d ? d+' jours' : (h? h+'h' : 'Dernières heures')} pour passer ${nm.target} pts`;
      preheader = `Après, c’est terminé. Joue ta place maintenant.`;
      html = `
        <h1>Dernière ligne droite ⏳</h1>
        <p>La campagne se termine dans <b>${countdown}</b>.</p>
        <p>Tu es à <b>${total} pts</b> — encore <b>${nm.missing}</b> pour <b>${nm.target} pts</b> ${nm.emoji}.</p>
        <ul>
          <li>🌱 10 pts → Badge VIP + Tuto</li>
          <li>✨ 25 pts → ${pal2}</li>
          <li>💎 50 pts → Afroé Pack</li>
          <li>🔥 100 pts → Cagnotte 3 500 €</li>
        </ul>
        <p>Partage maintenant : <a href="${referralLink}">${referralLink}</a></p>
        <p style="color:#999;font-size:13px">Caps : 30 bons service · 50 Afroé Packs.</p>
      `;
    }

    await resend.emails.send({
      from: "Afroé <no-reply@afroe.app>",
      to: u.email,
      subject,
      html,
      headers: { "X-Preheader": preheader }
    });

    return NextResponse.json({ ok:true });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message || "server_error" }, { status:500 });
  }
}