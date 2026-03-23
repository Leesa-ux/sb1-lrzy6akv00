'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star, Sparkle, Target, Crown, Diamond, Gift, User, DeviceMobile, Camera, Key, CurrencyDollar } from '@phosphor-icons/react';
import GlowNav from '../components/GlowNav';

interface LeaderboardEntry {
  rank: number;
  firstName: string;
  emailMasked?: string;
  role: string;
  referralsCount: number;
  points: number;
  tier: string;
}

interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardEntry[];
  total: number;
  filter: string;
  error?: string;
}

function LeaderboardContent() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [successHref, setSuccessHref] = useState<string>('/success');

  useEffect(() => {
    const saved = typeof window !== 'undefined'
      ? sessionStorage.getItem('glowSuccessParams')
      : null;
    if (saved) setSuccessHref(`/success?${saved}`);
  }, []);

  const fetchLeaderboard = async (role: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = role === 'all'
        ? '/api/leaderboard'
        : `/api/leaderboard?role=${role}`;

      const response = await fetch(url);
      const data: LeaderboardResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement');
      }

      setLeaderboard(data.leaderboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(selectedRole);
  }, [selectedRole]);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'client':
        return (
          <>
            <User weight="thin" className="inline-block" /> Client
          </>
        );
      case 'influencer':
        return (
          <>
            <Star weight="thin" className="inline-block text-amber-400" /> Influenceur
          </>
        );
      case 'beautypro':
        return (
          <>
            <Sparkle weight="thin" className="inline-block text-amber-400" /> Beauty Pro
          </>
        );
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'client':
        return 'bg-blue-100 text-blue-800';
      case 'influencer':
        return 'bg-purple-100 text-purple-800';
      case 'beautypro':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return <Crown weight="thin" className="text-amber-400" />;
    if (rank === 2) return <Medal weight="thin" className="text-slate-400" />;
    if (rank === 3) return <Medal weight="thin" className="text-orange-400" />;
    return null;
  };

  const getRankNumberColor = (rank: number) => {
    if (rank === 1) return 'text-amber-500 font-bold';
    if (rank === 2) return 'text-slate-500 font-bold';
    if (rank === 3) return 'text-orange-500 font-bold';
    return 'text-gray-400';
  };

  const getProgressBarColor = (role: string) => {
    switch (role) {
      case 'client':
        return 'bg-fuchsia-400';
      case 'influencer':
        return 'bg-blue-400';
      case 'beautypro':
        return 'bg-amber-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getNextTierThreshold = (tier: string) => {
    switch (tier) {
      case 'Glow Starter':
        return 50;
      case 'Circle Insiders':
        return 100;
      case 'Glow Icons':
        return 200;
      case 'Leader Circle':
        return null;
      default:
        return 50;
    }
  };

  const calculateProgressPercentage = (points: number, tier: string) => {
    const nextThreshold = getNextTierThreshold(tier);
    if (!nextThreshold) return 100;
    return Math.min((points / nextThreshold) * 100, 100);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Leader Circle':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'Glow Icons':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'Circle Insiders':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'Glow Starter':
        return 'bg-gray-200 text-gray-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Leader Circle':
        return <Crown weight="thin" />;
      case 'Glow Icons':
        return <Trophy weight="thin" />;
      case 'Circle Insiders':
        return <Key weight="thin" />;
      case 'Glow Starter':
        return <Sparkle weight="thin" />;
      default:
        return <Sparkle weight="thin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 py-12 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Trophy weight="thin" className="text-amber-400" /> Glow List Leaderboard
          </h1>
          <p className="text-gray-600">
            Les meilleurs ambassadeurs Afroé
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtrer par rôle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedRole === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('all')}
                disabled={loading}
              >
                Tous
              </Button>
              <Button
                variant={selectedRole === 'client' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('client')}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <User weight="thin" className="text-fuchsia-400" /> Client.e
              </Button>
              <Button
                variant={selectedRole === 'influencer' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('influencer')}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <Camera weight="thin" className="text-blue-400" /> Influenceur.euse
              </Button>
              <Button
                variant={selectedRole === 'beautypro' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('beautypro')}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <Sparkle weight="thin" className="text-amber-400" /> Beauty Pro
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                Chargement du classement...
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-6">
              <p className="text-center text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && leaderboard.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <Target weight="thin" className="text-red-400" size={64} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun participant pour le moment
                </h3>
                <p className="text-gray-600">
                  Sois le premier à rejoindre la Glow List!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {leaderboard.map((entry) => {
                  const progressPercentage = calculateProgressPercentage(entry.points, entry.tier);
                  const rank1Points = leaderboard[0]?.points || 0;
                  const gapToIphone = rank1Points - entry.points;

                  return (
                    <div
                      key={`${entry.rank}-${entry.firstName}`}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 text-center">
                            <div className={`text-2xl flex items-center justify-center gap-1 ${getRankNumberColor(entry.rank)}`}>
                              {entry.rank}
                              {getRankEmoji(entry.rank) && (
                                <span className="inline-flex">{getRankEmoji(entry.rank)}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-gray-900">
                                {entry.firstName}
                              </span>
                              <Badge className={`text-xs font-bold flex items-center gap-1 ${getTierColor(entry.tier)}`}>
                                <span className="inline-flex">{getTierIcon(entry.tier)}</span> {entry.tier}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                              <Badge className={getRoleBadgeColor(entry.role)}>
                                {getRoleLabel(entry.role)}
                              </Badge>
                              {entry.emailMasked && (
                                <span className="text-xs text-gray-500">{entry.emailMasked}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">
                            {entry.points}
                          </div>
                          <div className="text-xs text-gray-500">
                            {entry.referralsCount} referral{entry.referralsCount > 1 ? 's' : ''}
                          </div>
                          {entry.rank > 1 && entry.rank <= 3 && gapToIphone > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              {gapToIphone} pts de l'iPhone
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 w-full bg-gray-200 rounded-full h-0.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full opacity-40 ${getProgressBarColor(entry.role)}`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 space-y-4">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center gap-2">
                <Trophy weight="thin" className="text-amber-400" /> Niveaux de Classement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <div className="mb-1 flex justify-center">
                    <Sparkle weight="thin" size={24} />
                  </div>
                  <div className="font-semibold text-xs mb-1">Glow Starter</div>
                  <div className="text-xs text-gray-600">10 points</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <div className="mb-1 flex justify-center">
                    <Key weight="thin" size={24} />
                  </div>
                  <div className="font-semibold text-xs mb-1">Circle Insiders</div>
                  <div className="text-xs text-gray-600">50 points</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <div className="mb-1 flex justify-center">
                    <Trophy weight="thin" size={24} />
                  </div>
                  <div className="font-semibold text-xs mb-1">Glow Icons</div>
                  <div className="text-xs text-gray-600">100 points</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <div className="mb-1 flex justify-center">
                    <Crown weight="thin" size={24} />
                  </div>
                  <div className="font-semibold text-xs mb-1">Leader Circle</div>
                  <div className="text-xs text-gray-600">200 points</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-100 to-pink-100">
            <CardContent className="py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center flex items-center justify-center gap-2">
                <Gift weight="thin" className="text-pink-400" /> Récompenses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white/50 rounded p-3 text-center">
                  <div className="mb-1 flex justify-center">
                    <Medal weight="thin" className="text-amber-400" size={24} />
                  </div>
                  <div className="font-semibold">Rang 1</div>
                  <div className="text-xs text-gray-600">iPhone 17 Pro</div>
                </div>
                <div className="bg-white/50 rounded p-3 text-center">
                  <div className="mb-1 flex justify-center">
                    <CurrencyDollar weight="thin" className="text-green-500" size={24} />
                  </div>
                  <div className="font-semibold">100+ points</div>
                  <div className="text-xs text-gray-600">Jackpot 2 000 €</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => (window.location.href = successHref)}
            className="bg-gradient-to-r from-purple-600 to-amber-500 hover:opacity-90 w-full sm:w-auto"
          >
            ← Mon lien Glow
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="w-full sm:w-auto"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>

      <GlowNav />
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 py-12 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                Chargement...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <LeaderboardContent />
    </Suspense>
  );
}
