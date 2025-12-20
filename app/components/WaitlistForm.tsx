'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhoneInputBelgium } from '@/components/ui/phone-input-belgium';

interface FormData {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  city: string;
  role: 'client' | 'influencer' | 'beautypro';
  skill_answer: string;
  consent: boolean;
}

interface WaitlistFormProps {
  onSuccess?: (data: { referralCode: string; shareUrl: string }) => void;
}

export default function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    city: '',
    role: 'client',
    skill_answer: '',
    consent: false
  });

  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (parseInt(formData.skill_answer) !== 32) {
      setError('La réponse à la question d\'habileté est incorrecte. (8 × 4 = ?)');
      setLoading(false);
      return;
    }

    if (!formData.consent) {
      setError('Veuillez accepter les CGU et la Politique de Confidentialité pour continuer.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/join-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          referral_code: referralCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setSuccess(true);
      setShareUrl(data.shareUrl);

      if (onSuccess) {
        onSuccess({
          referralCode: data.referralCode,
          shareUrl: data.shareUrl
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    setFormData(prev => ({
      ...prev,
      [target.name]: value
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Lien copié!');
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenue sur Afroé!
            </h2>
            <p className="text-gray-600 mb-6">
              Ton inscription est confirmée
            </p>
          </div>

          <Alert className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <AlertDescription className="text-center">
              <p className="font-semibold text-gray-900 mb-2">
                Ton lien de parrainage:
              </p>
              <div className="bg-white p-3 rounded border border-gray-200 mb-3">
                <code className="text-sm text-purple-600 break-all">
                  {shareUrl}
                </code>
              </div>
              <Button
                onClick={copyToClipboard}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                📋 Copier le lien
              </Button>
            </AlertDescription>
          </Alert>

          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Partage ce lien</strong> avec tes amis pour gagner des points:
            </p>
            <ul className="text-left list-disc list-inside space-y-1">
              <li>Client: +2 points</li>
              <li>Influenceur: +15 points</li>
              <li>Beauty Pro: +25 points</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Rejoins la Glow List
        </h2>
        <p className="text-gray-600">
          Inscris-toi et commence à gagner des points
        </p>
        {referralCode && (
          <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
            <p className="text-sm text-green-700">
              ✨ Tu as été parrainé! Code: <strong>{referralCode}</strong>
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="ton@email.com"
            disabled={loading}
          />
        </div>

        <PhoneInputBelgium
          value={formData.phone}
          onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
          disabled={loading}
          required={true}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">Prénom *</Label>
            <Input
              id="first_name"
              name="first_name"
              type="text"
              required
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Prénom"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="last_name">Nom</Label>
            <Input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Nom"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            placeholder="Paris, Lyon, Marseille..."
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="role">Je suis... *</Label>
          <select
            id="role"
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="client">Client (2 pts/referral)</option>
            <option value="influencer">Influenceur (15 pts/referral)</option>
            <option value="beautypro">Beauty Pro (25 pts/referral)</option>
          </select>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <Label htmlFor="skill_answer" className="font-semibold">
            Question d'habileté (obligatoire en Belgique) *
          </Label>
          <p className="text-sm text-gray-600 mb-2">Combien fait <strong>8 × 4</strong> ?</p>
          <Input
            id="skill_answer"
            name="skill_answer"
            type="number"
            required
            value={formData.skill_answer}
            onChange={handleChange}
            placeholder="Votre réponse"
            disabled={loading}
          />
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="consent"
            name="consent"
            required
            checked={formData.consent}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <Label htmlFor="consent" className="text-sm text-gray-600">
            J'accepte les{' '}
            <a
              href="/cgu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 underline"
              onClick={(e) => e.stopPropagation()}
            >
              Conditions Générales d'Utilisation
            </a>
            {' '}et la{' '}
            <a
              href="/confidentialite"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 underline"
              onClick={(e) => e.stopPropagation()}
            >
              Politique de Confidentialité
            </a>
            {' '}d'Afroé, et je confirme que les informations fournies sont exactes. *
          </Label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
        >
          {loading ? 'Inscription en cours...' : 'Participer au concours'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          En t'inscrivant, tu acceptes de recevoir des communications d'Afroé
        </p>
      </form>
    </div>
  );
}
