import { db } from "./db";

const L1 = { lead_client:1, lead_pro:3, activated_client:3, activated_pro:10 } as const;
const L2 = { lead_client:0.5, lead_pro:1.5, activated_client:1.5, activated_pro:5 } as const;

type EventType = keyof typeof L1;
const BREAKS = [10, 25, 50, 100] as const;

export async function getUserPoints(userId: string) {
  // Somme L1 : events où user est l’actorL1
  const l1 = await db.referralEvent.groupBy({
    by: ["type"],
    where: { actorL1Id: userId },
    _count: { type: true }
  });

  // Somme L2 : events où user est l’actorL2
  const l2 = await db.referralEvent.groupBy({
    by: ["type"],
    where: { actorL2Id: userId },
    _count: { type: true }
  });

  const l1Points = l1.reduce((sum: number, e: { type: string; _count: { type: number } }) =>
    sum + (L1[e.type as EventType] || 0) * e._count.type, 0
  );
  const l2Points = l2.reduce((sum: number, e: { type: string; _count: { type: number } }) =>
    sum + (L2[e.type as EventType] || 0) * e._count.type, 0
  );

  return { l1Points, l2Points, total: l1Points + l2Points };
}

export function nextMilestone(points: number) {
  for (const b of BREAKS) {
    if (points < b) {
      return { target: b, missing: b - points, emoji: b===10?'🌱':b===25?'✨':b===50?'💎':'🔥' };
    }
  }
  return { target: 100, missing: 0, emoji:'🔥' };
}

export function palier2Copy(role: "client"|"influenceur"|"pro") {
  if (role === "pro") return "1 mois booking fees off (après 2 mois payés)";
  if (role === "influenceur") return "Spotlight Afroé (IG/TikTok)";
  return "Bon service gratuit (cap 30)";
}