import crypto from 'crypto';

const SERVER_SALT = process.env.PHONE_HASH_SALT || 'afroe-phone-salt-2025';

export function normalizePhone(phone: string): string | null {
  if (!phone) return null;

  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  } else if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('0')) {
      cleaned = '+32' + cleaned.slice(1);
    } else if (cleaned.length === 9) {
      cleaned = '+32' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }

  if (cleaned.length < 10 || cleaned.length > 16) {
    return null;
  }

  return cleaned;
}

export function hashPhone(normalized: string): string {
  return crypto
    .createHash('sha256')
    .update(normalized + SERVER_SALT)
    .digest('hex');
}

export function maskEmail(email: string): string {
  if (!email) return '***';
  const [local, domain] = email.split('@');
  if (!domain) return '***';

  const maskedLocal = local.length > 2
    ? local[0] + '***'
    : '***';

  const domainParts = domain.split('.');
  const maskedDomain = domainParts.length > 1
    ? domainParts[0][0] + '***.' + domainParts[domainParts.length - 1]
    : '***';

  return `${maskedLocal}@${maskedDomain}`;
}

export function generateSmsCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function maskPhoneForLog(phone: string): string {
  if (!phone || phone.length < 4) return '***';
  return phone.slice(0, 3) + '***' + phone.slice(-2);
}
