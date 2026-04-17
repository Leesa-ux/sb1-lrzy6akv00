import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { nextMilestone, getRewardTier } from "@/lib/points";
import { Resend } from "resend";
import { CAMPAIGN_CONFIG } from "@/config/campaign";

const getResend = () => process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const APP_URL = process.env.APP_URL || "https://afroe.app";

// Helper function to get reward description by role
function getRewardByRole(role: string): string {
  if (role === "beauty_pro" || role === "pro") return "1 mois booking fees off (après 2 mois payés)";
  if (role === "influencer") return "Spotlight Afroé (IG/TikTok)";
  return "Bon service gratuit (cap 30€)";
}

export async function POST(req: Request) {
  try {
    const resend = getResend();
    if (!resend) {
      return NextResponse.json({ ok: false, error: "email_not_configured" }, { status: 500 });
    }

    const { userId, kind } = await req.json() as { userId: string; kind: "weekly"|"leaderboard"|"lastcall" };
    const u = await db.user.findUnique({ where: { id: userId }});
    if (!u) return NextResponse.json({ ok:false, error:"user_not_found" }, { status:404 });

    // Use provisional points (waitlist phase points)
    const total = u.provisionalPoints;
    const nm = nextMilestone(total);
    const referralLink = `${APP_URL}/?ref=${u.referralCode}`;
    const rewardDescription = getRewardByRole(u.role);

    let subject = "", html = "", preheader = "";

    if (kind === "weekly") {
      subject = `${u.email.split("@")[0]}, t'es à ${total} pts — encore ${nm.missing} pour ${nm.emoji}`;
      preheader = `Il te manque ${nm.missing} pts pour la prochaine étape.`;
      html = `
        <h1>Ton score Afroé : ${total} pts 🔥</h1>
        <p>Encore <b>${nm.missing} pts</b> et tu débloques <b>${nm.target} pts</b> ${nm.emoji}.</p>
        <ul>
          <li>🥉 10 pts → Glow Starters</li>
          <li>🥈 50 pts → Glow Circle Insiders</li>
          <li>🥇 100 pts → Glow Icons + €3,500 jackpot</li>
          <li>🏆 200 pts → Glow Elites (secret tier)</li>
        </ul>
        <p>Ton lien à partager : <a href="${referralLink}">${referralLink}</a></p>
        <p style="color:#999;font-size:13px">Astuce : Story + DM groupé = boost rapide.</p>
      `;
    }

    if (kind === "leaderboard") {
      const all = await db.user.findMany({
        select: { id:true, email:true, role:true, referralCode:true, provisionalPoints:true }
      });
      const scored = all.map((x) => ({
        ...x,
        total: x.provisionalPoints
      }));
      scored.sort((a, b) => b.total - a.total);
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
      const END = CAMPAIGN_CONFIG.endDate.getTime();
      const diff = Math.max(0, END - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      const countdown = `${d}j ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;

      subject = `⏳ ${u.email.split("@")[0]}, ${d ? d+' jours' : (h? h+'h' : 'Dernières heures')} pour atteindre ${nm.target} pts`;
      preheader = `Après, c'est terminé. Joue ta place maintenant.`;
      html = `
        <h1>Dernière ligne droite ⏳</h1>
        <p>La campagne se termine dans <b>${countdown}</b>.</p>
        <p>Tu es à <b>${total} pts</b> — encore <b>${nm.missing}</b> pour <b>${nm.target} pts</b> ${nm.emoji}.</p>
        <ul>
          <li>🥉 10 pts → Glow Starters</li>
          <li>🥈 50 pts → Glow Circle Insiders</li>
          <li>🥇 100 pts → Glow Icons + €3,500 jackpot</li>
          <li>🏆 200 pts → Glow Elites (secret tier)</li>
        </ul>
        <p>Partage maintenant : <a href="${referralLink}">${referralLink}</a></p>
        <p style="color:#999;font-size:13px">Les 100 premiers signups ont reçu +50 pts bonus.</p>
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