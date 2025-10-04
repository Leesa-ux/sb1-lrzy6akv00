/**  DO NOT EDIT WITHOUT APPROVAL.
 *   This file is protected by GUARDRAILS.md and CODEOWNERS.
 *   Frontend must keep the 3-line headline and referral flow intact.
 */

import { NextRequest, NextResponse } from 'next/server';

// Enhanced duplicate prevention with cleanup
const submissionCache = new Map<string, { timestamp: number; attempts: number }>();

function checkSubmissionLimit(email: string, phone: string): { allowed: boolean; reason?: string } {
  const key = `${email}:${phone}`;
  const now = Date.now();
  const entry = submissionCache.get(key);
  
  // Cleanup old entries periodically
  if (submissionCache.size > 200) {
    const oneHourAgo = now - 60 * 60 * 1000;
    Array.from(submissionCache.entries()).forEach(([k, v]) => {
      if (v.timestamp < oneHourAgo) {
        submissionCache.delete(k);
      }
    });
  }
  
  if (!entry) {
    submissionCache.set(key, { timestamp: now, attempts: 1 });
    return { allowed: true };
  }
  
  // Reset if more than 1 hour passed
  if (now - entry.timestamp > 60 * 60 * 1000) {
    submissionCache.set(key, { timestamp: now, attempts: 1 });
    return { allowed: true };
  }
  
  // Allow max 3 submissions per hour
  if (entry.attempts >= 3) {
    return { allowed: false, reason: 'Trop de soumissions, réessayez plus tard' };
  }
  
  // Check minimum interval (1 minute)
  if (now - entry.timestamp < 60000) {
    return { allowed: false, reason: 'Veuillez patienter avant de soumettre à nouveau' };
  }
  
  entry.attempts++;
  entry.timestamp = now;
  return { allowed: true };
}

// Input sanitization
function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 254); // RFC 5321 limit
}

function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').slice(0, 16);
}

function sanitizeText(text: string): string {
  return text.trim().slice(0, 100); // Reasonable limit
}

export async function POST(request: NextRequest) {
  try {
    const { email, phone, role, referralCode } = await request.json();

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email || '');
    const sanitizedPhone = sanitizePhone(phone || '');
    const sanitizedRole = sanitizeText(role || '');
    const sanitizedReferralCode = sanitizeText(referralCode || '');

    // Validate required fields
    if (!sanitizedEmail || !sanitizedPhone) {
      return NextResponse.json(
        { ok: false, error: 'Email et téléphone requis' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(sanitizedEmail)) {
      return NextResponse.json(
        { ok: false, error: 'Format email invalide' },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!/^\+?[1-9]\d{7,14}$/.test(sanitizedPhone)) {
      return NextResponse.json(
        { ok: false, error: 'Format téléphone invalide' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['entrepreneur', 'investisseur', 'developpeur', 'client', 'autre'];
    if (sanitizedRole && !validRoles.includes(sanitizedRole)) {
      return NextResponse.json(
        { ok: false, error: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Prevent duplicate submissions
    const submissionCheck = checkSubmissionLimit(sanitizedEmail, sanitizedPhone);
    if (!submissionCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: submissionCheck.reason || 'Soumission refusée' },
        { status: 429 }
      );
    }

    // Prepare data for Google Sheets
    const leadData = {
      timestamp: new Date().toISOString(),
      email: sanitizedEmail,
      phone: sanitizedPhone,
      role: sanitizedRole || 'client',
      referralCode: sanitizedReferralCode,
      status: sanitizedReferralCode ? 'verified' : 'pending',
      source: 'waitlist',
    };

    // Send to Google Sheets using Google Apps Script Web App
    const promises = [];

    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      promises.push(
        fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(leadData),
          signal: controller.signal,
        }).catch(error => {
          clearTimeout(timeoutId);
          console.error('Google Sheets Webhook Error:', error);
          return null;
        })
      );
    }

    // Alternative: Google Sheets API
    if (process.env.GOOGLE_SHEETS_API_KEY && process.env.GOOGLE_SHEETS_ID) {
      const range = 'Leads!A:H';
      const values = [
        [
          leadData.timestamp,
          leadData.email,
          leadData.phone,
          leadData.role,
          leadData.referralCode,
          leadData.status,
          leadData.source,
        ],
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      promises.push(
        fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/${range}:append?valueInputOption=USER_ENTERED&key=${process.env.GOOGLE_SHEETS_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              range,
              majorDimension: 'ROWS',
              values,
            }),
            signal: controller.signal,
          }
        ).catch(error => {
          clearTimeout(timeoutId);
          console.error('Google Sheets API Error:', error);
          return null;
        })
      );
    }

    // Execute all promises in parallel but don't block response
    if (promises.length > 0) {
      Promise.allSettled(promises).then(results => {
        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length > 0) {
          console.warn('Some integrations failed:', failures);
        }
      });
    }

    // Log for development (non-blocking)
    if (process.env.NODE_ENV === 'development') {
      console.log('💾 Lead saved:', leadData);
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Lead sauvegardé avec succès',
      referralCode: sanitizedReferralCode 
    });

  } catch (error) {
    console.error('Save Lead Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erreur serveur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}