// scripts/update-guard.js
import fs from 'fs';
import crypto from 'crypto';

const protectedFiles = [
  'app/page.tsx',
  'app/components/WaitlistLandingPage.tsx',
  'app/api/send-sms/route.ts',
  'app/api/verify-code/route.ts',
  'app/api/save-lead/route.ts'
];

function sha(path) {
  try {
    const buf = fs.readFileSync(path);
    return crypto.createHash('sha256').update(buf).digest('hex');
  } catch { return null; }
}

const out = {};
for (const f of protectedFiles) {
  if (fs.existsSync(f)) out[f] = sha(f);
}
fs.writeFileSync('.guardhash.json', JSON.stringify(out, null, 2));
console.log('✅ Baseline mise à jour');