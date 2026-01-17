// Centralized validation utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Email requis' };
  }
  
  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email trop long' };
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Format email invalide' };
  }
  
  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  const cleaned = phone.replace(/[^\d+]/g, '');

  if (!cleaned) {
    return { isValid: false, error: 'Téléphone requis' };
  }

  if (!cleaned.startsWith('+32')) {
    return { isValid: false, error: 'Numéro invalide. Exemple : +32 471 12 34 56' };
  }

  const digitsAfterPrefix = cleaned.substring(3);

  if (!digitsAfterPrefix.startsWith('4')) {
    return { isValid: false, error: 'Numéro invalide. Exemple : +32 471 12 34 56' };
  }

  if (digitsAfterPrefix.length !== 9) {
    return { isValid: false, error: 'Numéro invalide. Exemple : +32 471 12 34 56' };
  }

  const belgianMobileRegex = /^\+324\d{8}$/;
  if (!belgianMobileRegex.test(cleaned)) {
    return { isValid: false, error: 'Numéro invalide. Exemple : +32 471 12 34 56' };
  }

  return { isValid: true };
}

export function validateRole(role: string): ValidationResult {
  const validRoles = ['entrepreneur', 'investisseur', 'developpeur', 'client', 'autre'];
  
  if (!role) {
    return { isValid: false, error: 'Rôle requis' };
  }
  
  if (!validRoles.includes(role)) {
    return { isValid: false, error: 'Rôle invalide' };
  }
  
  return { isValid: true };
}

export function validateVerificationCode(code: string): ValidationResult {
  const cleaned = code.replace(/\D/g, '');
  
  if (cleaned.length !== 4) {
    return { isValid: false, error: 'Code doit contenir 4 chiffres' };
  }
  
  return { isValid: true };
}

// Sanitization functions
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 254);
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').slice(0, 16);
}

export function sanitizeText(text: string, maxLength = 100): string {
  return text.trim().slice(0, maxLength);
}