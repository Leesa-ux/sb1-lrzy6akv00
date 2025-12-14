import { generateReferralCode, isValidReferralCode, getReferralLink } from '../referral-code';

describe('ReferralCode', () => {
  describe('generateReferralCode', () => {
    it('should generate 8 character code by default', () => {
      const code = generateReferralCode();
      expect(code).toHaveLength(8);
    });

    it('should generate code with custom length', () => {
      const code = generateReferralCode(12);
      expect(code).toHaveLength(12);
    });

    it('should only use valid alphabet characters', () => {
      const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const code = generateReferralCode();

      for (const char of code) {
        expect(validChars).toContain(char);
      }
    });

    it('should not use confusing characters (0, O, I, 1)', () => {
      const confusingChars = ['0', 'O', 'I', '1'];
      const code = generateReferralCode();

      for (const char of confusingChars) {
        expect(code).not.toContain(char);
      }
    });

    it('should generate different codes on multiple calls', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateReferralCode());
      }

      expect(codes.size).toBeGreaterThan(95);
    });
  });

  describe('isValidReferralCode', () => {
    it('should validate correct code', () => {
      expect(isValidReferralCode('K7M4Q2TX')).toBe(true);
      expect(isValidReferralCode('ABCD2345')).toBe(true);
    });

    it('should reject code with wrong length', () => {
      expect(isValidReferralCode('ABC123')).toBe(false);
      expect(isValidReferralCode('ABCD23456')).toBe(false);
    });

    it('should reject code with invalid characters', () => {
      expect(isValidReferralCode('ABCD123O')).toBe(false);
      expect(isValidReferralCode('ABCD123I')).toBe(false);
      expect(isValidReferralCode('abcd1234')).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(isValidReferralCode(null as any)).toBe(false);
      expect(isValidReferralCode(undefined as any)).toBe(false);
      expect(isValidReferralCode(12345678 as any)).toBe(false);
    });
  });

  describe('getReferralLink', () => {
    const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

    afterEach(() => {
      process.env.NEXT_PUBLIC_APP_URL = originalEnv;
    });

    it('should generate link with default URL', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://afroe.studio';
      const link = getReferralLink('K7M4Q2TX');
      expect(link).toBe('https://afroe.studio?ref=K7M4Q2TX');
    });

    it('should generate link with custom base URL', () => {
      const link = getReferralLink('K7M4Q2TX', 'https://custom.com');
      expect(link).toBe('https://custom.com?ref=K7M4Q2TX');
    });

    it('should use localhost as fallback', () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      const link = getReferralLink('K7M4Q2TX');
      expect(link).toBe('http://localhost:3000?ref=K7M4Q2TX');
    });
  });
});
