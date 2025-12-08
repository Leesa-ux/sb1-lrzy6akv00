'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LeaderboardEntry {
  rank: number;
  firstName: string;
  city?: string;
  role: string;
  referralsCount: number;
  points: number;
  earlyBird: boolean;
}

interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardEntry[];
  total: number;
  filter: string;
  error?: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');

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
        return '👤 Client';
      case 'influencer':
        return '⭐ Influenceur';
      case 'beautypro':
        return '💅 Beauty Pro';
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
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Glow List Leaderboard
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
              >
                👤 Clients
              </Button>
              <Button
                variant={selectedRole === 'influencer' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('influencer')}
                disabled={loading}
              >
                ⭐ Influenceurs
              </Button>
              <Button
                variant={selectedRole === 'beautypro' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('beautypro')}
                disabled={loading}
              >
                💅 Beauty Pros
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
                <div className="text-6xl mb-4">🎯</div>
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
                {leaderboard.map((entry) => (
                  <div
                    key={`${entry.rank}-${entry.firstName}`}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {entry.rank}
                          </div>
                          <div className="text-xl">
                            {getRankEmoji(entry.rank)}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {entry.firstName}
                            </span>
                            {entry.earlyBird && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                ⚡ Early Bird
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Badge className={getRoleBadgeColor(entry.role)}>
                              {getRoleLabel(entry.role)}
                            </Badge>
                            {entry.city && (
                              <span className="text-xs">📍 {entry.city}</span>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100">
            <CardContent className="py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🎁 Récompenses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/50 rounded p-3">
                  <div className="text-2xl mb-1">🥇</div>
                  <div className="font-semibold">Rang 1</div>
                  <div className="text-xs text-gray-600">iPhone 17 Pro</div>
                </div>
                <div className="bg-white/50 rounded p-3">
                  <div className="text-2xl mb-1">💰</div>
                  <div className="font-semibold">100+ points</div>
                  <div className="text-xs text-gray-600">Jackpot €3,500</div>
                </div>
                <div className="bg-white/50 rounded p-3">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="font-semibold">Early Birds</div>
                  <div className="text-xs text-gray-600">+50 points bonus</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={() => (window.location.href = '/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            ← Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
