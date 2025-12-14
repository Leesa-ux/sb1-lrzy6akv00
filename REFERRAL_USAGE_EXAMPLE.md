# Exemples d'Utilisation du Système de Referral

## 1. Récupérer le ref dans une Landing Page

```typescript
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const searchParams = useSearchParams();
  const [referredBy, setReferredBy] = useState<string | null>(null);

  useEffect(() => {
    // Récupère le code du parrain depuis l'URL
    const refCode = searchParams.get("ref");
    if (refCode) {
      setReferredBy(refCode);
      // Optionnel: stocker dans localStorage pour persistance
      localStorage.setItem("referredBy", refCode);
    }
  }, [searchParams]);

  return (
    <div>
      {referredBy && (
        <div className="bg-green-500/10 border border-green-500 p-4 rounded-lg">
          <p>🎉 Tu as été invité par un membre de la Glow List!</p>
          <p className="text-sm text-gray-400">Code: {referredBy}</p>
        </div>
      )}

      <WaitlistForm referredBy={referredBy} />
    </div>
  );
}
```

---

## 2. Envoyer le ref lors de l'inscription

```typescript
"use client";

import { useState } from "react";

interface WaitlistFormProps {
  referredBy: string | null;
}

export default function WaitlistForm({ referredBy }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/join-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: "John",
          lastName: "Doe",
          role: "client",
          referredBy, // ← Envoi du code parrain
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirection vers success avec le nouveau referralCode
        window.location.href = `/success?ref=${data.user.referralCode}`;
      }
    } catch (error) {
      console.error("Erreur inscription:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ton@email.com"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Inscription..." : "Rejoindre la Glow List"}
      </button>
    </form>
  );
}
```

---

## 3. Afficher le Dashboard de Referral

```typescript
"use client";

import { useEffect, useState } from "react";
import ShareButtons from "@/app/components/ShareButtons";

interface UserStats {
  referralCode: string;
  refCount: number;
  waitlistClients: number;
  waitlistInfluencers: number;
  waitlistPros: number;
  provisionalPoints: number;
  rank: number;
  nextMilestone: number;
}

export default function ReferralDashboard({ userId }: { userId: string }) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [refLink, setRefLink] = useState("");

  useEffect(() => {
    async function loadStats() {
      const response = await fetch(`/api/user-stats?userId=${userId}`);
      const data = await response.json();
      setStats(data);

      // Calcul du refLink
      const link = `${window.location.origin}?ref=${data.referralCode}`;
      setRefLink(link);
    }

    loadStats();
  }, [userId]);

  if (!stats) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Total Referrals"
          value={stats.refCount}
          icon="👥"
        />
        <StatCard
          title="Points"
          value={stats.provisionalPoints}
          icon="⭐"
        />
        <StatCard
          title="Classement"
          value={`#${stats.rank}`}
          icon="🏆"
        />
      </div>

      {/* Breakdown par rôle */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Répartition de tes referrals</h3>
        <div className="space-y-3">
          <ReferralRow
            label="Clients"
            count={stats.waitlistClients}
            points={stats.waitlistClients * 2}
            color="text-green-400"
          />
          <ReferralRow
            label="Influenceurs"
            count={stats.waitlistInfluencers}
            points={stats.waitlistInfluencers * 15}
            color="text-purple-400"
          />
          <ReferralRow
            label="Beauty Pros"
            count={stats.waitlistPros}
            points={stats.waitlistPros * 25}
            color="text-pink-400"
          />
        </div>
      </div>

      {/* Prochain Milestone */}
      <div className="bg-gradient-to-r from-fuchsia-900/20 to-amber-900/20 border border-fuchsia-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-2">Prochain palier</h3>
        <p className="text-zinc-400 mb-4">
          Plus que <strong>{stats.nextMilestone - stats.provisionalPoints} points</strong> pour atteindre {stats.nextMilestone} pts!
        </p>
        <div className="w-full bg-zinc-800 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-fuchsia-500 to-amber-500 h-3 rounded-full transition-all"
            style={{
              width: `${(stats.provisionalPoints / stats.nextMilestone) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Boutons de partage */}
      {stats.referralCode && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Partage ton lien et gagne des points</h3>
          <ShareButtons
            referralLink={refLink}
            message="Rejoins Afroé, la plateforme beauté afro qui change le game ! 🔥"
          />
        </div>
      )}
    </div>
  );
}

// Composants helper
function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-zinc-400">{title}</div>
    </div>
  );
}

function ReferralRow({ label, count, points, color }: { label: string; count: number; points: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-300">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-zinc-400">{count} inscriptions</span>
        <span className={`font-semibold ${color}`}>+{points} pts</span>
      </div>
    </div>
  );
}
```

---

## 4. API Route pour récupérer les stats (à créer)

```typescript
// app/api/user-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        refCount: true,
        waitlistClients: true,
        waitlistInfluencers: true,
        waitlistPros: true,
        provisionalPoints: true,
        rank: true,
        nextMilestone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
```

---

## 5. Vérification Anti-Fraude avant Partage

```typescript
"use client";

import { useEffect, useState } from "react";
import ShareButtons from "@/app/components/ShareButtons";

export default function ShareSection({ userId, referralCode }: { userId: string; referralCode: string }) {
  const [canShare, setCanShare] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    async function checkEligibility() {
      const response = await fetch(`/api/check-share-eligibility?userId=${userId}`);
      const data = await response.json();

      if (data.eligible) {
        setCanShare(true);
      } else {
        setReason(data.reason || "Tu ne peux pas encore partager ton lien.");
      }
    }

    checkEligibility();
  }, [userId]);

  const refLink = `${window.location.origin}?ref=${referralCode}`;

  if (!canShare) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-xl p-6">
        <p className="text-red-400">⚠️ {reason}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Partage ton lien</h3>
      <ShareButtons referralLink={refLink} />
    </div>
  );
}
```

---

## 6. Tracking des Clics sur le refLink (Analytics)

```typescript
// app/api/track-referral-click/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode } = body;

    if (!referralCode) {
      return NextResponse.json({ error: "referralCode required" }, { status: 400 });
    }

    // Vérifier que le code existe
    const user = await prisma.user.findFirst({
      where: { referralCode },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
    }

    // Log du clic (créer une table ReferralClick si besoin)
    // await prisma.referralClick.create({
    //   data: {
    //     referralCode,
    //     clickedAt: new Date(),
    //     ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    //   },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
  }
}
```

Appel depuis le frontend:
```typescript
useEffect(() => {
  const refCode = searchParams.get("ref");
  if (refCode) {
    // Track le clic
    fetch("/api/track-referral-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode: refCode }),
    });
  }
}, [searchParams]);
```

---

## 7. Exemple de Notification en Temps Réel

```typescript
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ReferralNotifications({ userId }: { userId: string }) {
  useEffect(() => {
    // Poll toutes les 30 secondes pour vérifier les nouveaux referrals
    const interval = setInterval(async () => {
      const response = await fetch(`/api/recent-referrals?userId=${userId}`);
      const data = await response.json();

      if (data.newReferrals && data.newReferrals.length > 0) {
        data.newReferrals.forEach((referral: any) => {
          toast.success(
            `🎉 ${referral.firstName || "Quelqu'un"} vient de rejoindre via ton lien! +${referral.pointsEarned} pts`,
            { duration: 5000 }
          );
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  return null; // Composant invisible
}
```

---

## Résumé

Ces exemples montrent comment:
1. ✅ Récupérer le `?ref=` depuis l'URL
2. ✅ Envoyer `referredBy` lors de l'inscription
3. ✅ Afficher un dashboard avec stats et partage
4. ✅ Vérifier l'éligibilité au partage
5. ✅ Tracker les clics sur le refLink
6. ✅ Notifier en temps réel les nouveaux referrals

Tout le système backend est déjà en place, il suffit d'ajouter ces composants frontend selon vos besoins.
