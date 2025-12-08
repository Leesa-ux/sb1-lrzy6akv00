import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { calculateProvisionalPoints } from '../lib/points';

const prisma = new PrismaClient();

interface CSVRow {
  email: string;
  referrals_count: string;
  points: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  city?: string;
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function ensureUniqueReferralCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateReferralCode();
    const existing = await prisma.user.findFirst({
      where: { referralCode: code }
    });

    if (!existing) {
      return code;
    }
    attempts++;
  }

  throw new Error('Unable to generate unique referral code');
}

function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row as CSVRow);
  }

  return rows;
}

async function importLeaderboard(csvPath: string) {
  console.log('🚀 Starting leaderboard import...\n');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Error: File not found at ${csvPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  console.log(`📋 Found ${rows.length} rows in CSV\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const email = row.email.trim().toLowerCase();
    if (!email) {
      console.log(`⚠️  Skipping row with empty email`);
      skipped++;
      continue;
    }

    const referralsCount = parseInt(row.referrals_count) || 0;
    const points = parseInt(row.points) || 0;

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        await prisma.user.update({
          where: { email },
          data: {
            refCount: referralsCount,
            provisionalPoints: points,
            points: points,
            updatedAt: new Date()
          }
        });

        console.log(`✅ Updated: ${email} (${points} points, ${referralsCount} referrals)`);
        updated++;
      } else {
        const referralCode = await ensureUniqueReferralCode();
        const firstName = row.first_name || email.split('@')[0];
        const lastName = row.last_name;
        const role = (row.role as 'client' | 'influencer' | 'beautypro') || 'client';
        const city = row.city;

        await prisma.user.create({
          data: {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email,
            phone: '',
            firstName,
            lastName,
            role,
            referralCode,
            phoneVerified: false,
            referralValidated: false,
            fraudScore: 0,
            refCount: referralsCount,
            waitlistClients: 0,
            waitlistInfluencers: 0,
            waitlistPros: 0,
            appDownloads: 0,
            validatedInfluencers: 0,
            validatedPros: 0,
            earlyBird: false,
            earlyBirdBonus: 0,
            provisionalPoints: points,
            finalPoints: 0,
            rank: 0,
            nextMilestone: 10,
            eligibleForJackpot: false,
            isTopRank: false,
            points: points,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        console.log(`✨ Created: ${email} (${points} points, ${referralsCount} referrals)`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${email}:`, error instanceof Error ? error.message : error);
      errors++;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`   ✨ Created: ${created}`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📋 Total processed: ${created + updated + skipped + errors}/${rows.length}`);
}

const csvPath = process.argv[2] || path.join(process.cwd(), 'leaderboard.csv');

importLeaderboard(csvPath)
  .then(() => {
    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
