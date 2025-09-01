// scripts/guard.js
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

// charge les empreintes "attendues"
const baselinePath = '.guardhash.json';
const baseline = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath,'utf8')) : {};

let changed = [];
for (const f of protectedFiles) {
  const curr = sha(f);
  if (!curr) continue;
  if (baseline[f] && baseline[f] !== curr) changed.push(f);
}

if (changed.length) {
  console.error('\n❌ Guardrails: fichiers protégés modifiés:\n', changed.join('\n'));
  console.error('\n✔️ Si c\'est volontaire, mets à jour la baseline après review:\n   node scripts/update-guard.js\n');
  process.exit(1);
} else {
  process.exit(0);
}