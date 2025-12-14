/**
 * Feature Flags System
 *
 * Permet d'activer/désactiver des fonctionnalités sans casser la prod.
 * Usage: if (!isSafeMode()) { ... nouveau comportement ... }
 */

/**
 * SAFE_MODE = true (défaut) → Comportement actuel, aucun nouveau feature
 * SAFE_MODE = false → Active les nouvelles fonctionnalités
 *
 * @returns true si on est en mode sécurisé (comportement actuel uniquement)
 */
export function isSafeMode(): boolean {
  // Valeur par défaut: true (sécurisé)
  const envValue = process.env.NEXT_PUBLIC_SAFE_MODE || 'true';
  return envValue.toLowerCase() !== 'false';
}

/**
 * Inverse de isSafeMode() pour une meilleure lisibilité
 * Usage: if (isFeatureEnabled('countdown')) { ... nouveau comportement ... }
 *
 * @returns true si les nouveaux features sont activés
 */
export function isFeatureEnabled(featureName?: string): boolean {
  const safeMode = isSafeMode();

  // En mode safe, aucun feature n'est activé
  if (safeMode) return false;

  // Si pas de feature spécifique, retourne l'état général
  if (!featureName) return true;

  // Pour l'instant, tous les features partagent le même flag
  // Dans le futur, on pourrait avoir des flags granulaires:
  // NEXT_PUBLIC_FEATURE_COUNTDOWN=true
  // NEXT_PUBLIC_FEATURE_DASHBOARD=true
  // etc.

  return true;
}

/**
 * Helper pour logs de debug (uniquement en dev)
 */
export function logFeatureState(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[FeatureFlags]', {
      safeMode: isSafeMode(),
      featuresEnabled: isFeatureEnabled(),
      env: process.env.NEXT_PUBLIC_SAFE_MODE || 'undefined (default: true)'
    });
  }
}

/**
 * Hook React pour utiliser les feature flags dans les composants
 * Usage: const safeMode = useSafeMode();
 */
export function useSafeMode(): boolean {
  return isSafeMode();
}

/**
 * Hook React pour vérifier si un feature est activé
 * Usage: const showCountdown = useFeature('countdown');
 */
export function useFeature(featureName?: string): boolean {
  return isFeatureEnabled(featureName);
}
