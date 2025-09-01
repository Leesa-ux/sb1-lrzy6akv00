/**  DO NOT EDIT WITHOUT APPROVAL.
 *   This file is protected by GUARDRAILS.md and CODEOWNERS.
 *   Frontend must keep the 3-line headline and referral flow intact.
 */

'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, CheckCircle, Smartphone, Users, Zap } from 'lucide-react';

// Memoized feature data to prevent re-renders
const FEATURES = [
  {
    icon: Smartphone,
    title: 'Accès Prioritaire',
    description: 'Soyez les premiers informés du lancement',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    icon: Users,
    title: 'Communauté Exclusive',
    description: 'Rejoignez un réseau de visionnaires',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Découvrez les dernières technologies',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  }
];

// Memoized role options
const ROLE_OPTIONS = [
  { value: 'entrepreneur', label: 'Entrepreneur' },
  { value: 'investisseur', label: 'Investisseur' },
  { value: 'developpeur', label: 'Développeur' },
  { value: 'client', label: 'Client' },
  { value: 'autre', label: 'Autre' }
];

export default function WaitlistLandingPage() {
  const [step, setStep] = useState<'signup' | 'verify' | 'success'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  
  // Form data
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  // Memoized referral code generation
  const makeReferralCode = useCallback(() => {
    const base = (email || "guest").split("@")[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 6) || "afroe";
    const rand = Math.random().toString(36).slice(2, 8);
    return `${base}-${rand}`.toLowerCase();
  }, [email]);

  // Memoized time formatting
  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const ss = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  }, []);

  // Timer effect for referral code expiration
  useEffect(() => {
    mountedRef.current = true;
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setTimeLeft(prev => prev - 1);
        }
      }, 1000);
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft]);

  // Memoized form validation
  const isFormValid = useMemo(() => {
    // Enhanced validation
    const emailValid = email && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
    const phoneValid = phone && /^\+?[1-9]\d{7,14}$/.test(phone.replace(/\s+/g, ''));
    const roleValid = role && ['entrepreneur', 'investisseur', 'developpeur', 'client', 'autre'].includes(role);
    
    return emailValid && phoneValid && roleValid;
  }, [email, phone, role]);

  // Client-side rate limiting
  const canSubmit = useMemo(() => {
    const now = Date.now();
    return now - lastSubmissionTime > 60000; // 1 minute cooldown
  }, [lastSubmissionTime]);
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !canSubmit) {
      if (!canSubmit) {
        setError('Veuillez patienter avant de soumettre à nouveau');
        return;
      }
      setError('Veuillez remplir tous les champs correctement');
      return;
    }

    setLoading(true);
    setError('');
    setLastSubmissionTime(Date.now());

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPhone = phone.replace(/\s+/g, '');
    try {
      // Parallel requests for better performance
      const [smsResponse, leadResponse] = await Promise.allSettled([
        fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: sanitizedPhone }),
        }),
        fetch('/api/save-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: sanitizedEmail, 
            phone: sanitizedPhone, 
            role, 
            referralCode: '' 
          }),
        })
      ]);

      // Check SMS response
      if (smsResponse.status === 'rejected' || !smsResponse.value.ok) {
        const smsError = smsResponse.status === 'fulfilled' 
          ? await smsResponse.value.json() 
          : { error: 'Erreur envoi SMS' };
        setError(smsError.error || 'Erreur envoi SMS');
        return;
      }

      // Log lead save errors but don't block user flow
      if (leadResponse.status === 'rejected' || !leadResponse.value.ok) {
        console.warn('Lead save failed, but continuing with SMS verification');
      }

      setStep('verify');
      // Clear verification code when moving to verify step
      setVerificationCode('');
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [email, phone, role, isFormValid, canSubmit]);

  const handleVerification = useCallback(async () => {
    if (!phone || verificationCode.length !== 4) {
      setError('Code de vérification requis');
      return;
    }

    setLoading(true);
    setError('');

    const sanitizedPhone = phone.replace(/\s+/g, '');
    const sanitizedCode = verificationCode.replace(/\D/g, ''); // Only digits

    try {
      const resp = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: sanitizedPhone, code: sanitizedCode }),
      });
      const json = await resp.json();

      if (!resp.ok || !json.ok) {
        setError('Code incorrect');
        return;
      }

      // Success - generate referral code and set timer
      const gen = makeReferralCode();
      setReferralCode(gen);
      setTimeLeft(15 * 60); // 15 minutes
      setStep('success');

      // Save verified lead with referral code (non-blocking)
      try {
        await fetch('/api/save-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: email.trim().toLowerCase(), 
            phone: sanitizedPhone, 
            role, 
            referralCode: gen 
          }),
        });
      } catch (err) {
        console.warn('Referral code save failed');
      }
    } catch (err) {
      setError('Erreur de vérification');
    } finally {
      setLoading(false);
    }
  }, [phone, verificationCode, email, role, makeReferralCode]);

  const resendCode = useCallback(async () => {
    if (!phone) {
      setError('Numéro de téléphone requis');
      return;
    }

    setLoading(true);
    setError('');

    const sanitizedPhone = phone.replace(/\s+/g, '');

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: sanitizedPhone }),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.error || 'Erreur envoi SMS');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  // Reset form when switching steps
  const resetForm = useCallback(() => {
    setEmail('');
    setPhone('');
    setRole('');
    setVerificationCode('');
    setError('');
    setStep('signup');
  }, []);

  // Memoized feature cards to prevent unnecessary re-renders
  const featureCards = useMemo(() => (
    FEATURES.map((feature, index) => {
      const IconComponent = feature.icon;
      return (
        <div key={index} className="text-center">
          <div className={`w-12 h-12 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <IconComponent className={`w-6 h-6 ${feature.iconColor}`} />
          </div>
          <h3 className="font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-600 text-sm">{feature.description}</p>
        </div>
      );
    })
  ), []);

  // Memoized role options to prevent re-renders
  const roleSelectItems = useMemo(() => (
    ROLE_OPTIONS.map(option => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ))
  ), []);

  // Memoized formatted time display
  const formattedTimeLeft = useMemo(() => 
    timeLeft > 0 ? formatTime(timeLeft) : null
  , [timeLeft, formatTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 will-change-scroll">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 transform-gpu">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 transform-gpu">
            Rejoignez AFROÉ
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            La plateforme révolutionnaire qui connecte l'Afrique au monde. 
            Soyez parmi les premiers à découvrir l'avenir du commerce digital africain.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            {featureCards}
          </div>
        </div>

        {/* Waitlist Form */}
        <div className="max-w-md mx-auto">
          {step === 'signup' && (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm transform-gpu">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Rejoignez la liste d'attente</CardTitle>
                <CardDescription>
                  Inscrivez-vous pour être notifié du lancement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Vous êtes</Label>
                    <Select value={role} onValueChange={setRole} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre profil" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleSelectItems}
                      </SelectContent>
                    </Select>
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform-gpu transition-all duration-200"
                    disabled={loading || !isFormValid}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Rejoindre la liste d\'attente'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 'verify' && (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm transform-gpu">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Vérification SMS</CardTitle>
                <CardDescription>
                  Entrez le code reçu par SMS au {phone}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={4}
                    value={verificationCode}
                    onChange={setVerificationCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <Button 
                    onClick={handleVerification}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform-gpu transition-all duration-200"
                    disabled={loading || verificationCode.length !== 4}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      'Vérifier le code'
                    )}
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={resendCode}
                    className="w-full transform-gpu transition-all duration-200"
                    disabled={loading}
                  >
                    Renvoyer le code
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'success' && (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm transform-gpu">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto transform-gpu">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Bienvenue dans AFROÉ !</h2>
                  <p className="text-gray-600">
                    Votre inscription a été confirmée. Vous recevrez bientôt des nouvelles exclusives.
                  </p>
                  
                  {referralCode && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                      <h3 className="font-semibold text-gray-900 mb-2">Votre code de parrainage</h3>
                      <div className="bg-white p-3 rounded-lg border-2 border-dashed border-blue-300">
                        <code className="text-lg font-mono text-blue-600">{referralCode}</code>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Partagez ce code pour inviter vos contacts
                      </p>
                      {formattedTimeLeft && (
                        <p className="text-xs text-gray-500 mt-1">
                          Expire dans: {formattedTimeLeft}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Astuce:</strong> Partagez AFROÉ avec vos contacts pour accélérer le lancement !
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>© 2025 AFROÉ. L'avenir commence ici.</p>
        </div>
      </div>
    </div>
  );
}