import { db } from '../lib/db';

async function testDatabaseConnection() {
  console.log('Testing database connection...\n');

  console.log('Environment variables:');
  console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    if (url.includes('[YOUR-PASSWORD]')) {
      console.error('  ❌ ERROR: DATABASE_URL contains placeholder [YOUR-PASSWORD]');
      console.error('  Please update .env with actual database password');
      process.exit(1);
    }
    const maskedUrl = url.replace(/:([^@]+)@/, ':****@');
    console.log('  URL format:', maskedUrl);
  }

  try {
    console.log('\nAttempting to connect to database...');
    await db.$connect();
    console.log('✅ Successfully connected to database');

    console.log('\nTesting basic query...');
    const userCount = await db.user.count();
    console.log(`✅ Found ${userCount} users in database`);

    console.log('\nTesting referral events...');
    const eventCount = await db.referralEvent.count();
    console.log(`✅ Found ${eventCount} referral events in database`);

    console.log('\n✅ All database tests passed!');
    console.log('Your database is properly configured.');

  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('\nError details:');
    if (error instanceof Error) {
      console.error('- Name:', error.name);
      console.error('- Message:', error.message);

      if (error.message.includes('authentication') || error.message.includes('password')) {
        console.error('\n⚠️  This looks like an authentication error.');
        console.error('Please check:');
        console.error('1. Your DATABASE_URL has the correct password');
        console.error('2. The password doesn\'t contain special characters that need escaping');
        console.error('3. You can reset your database password in Supabase Dashboard');
      }

      if (error.message.includes('P1001') || error.message.includes('reach database')) {
        console.error('\n⚠️  Cannot reach the database server.');
        console.error('Please check:');
        console.error('1. Your internet connection');
        console.error('2. The database server hostname is correct');
        console.error('3. Firewall or network restrictions');
      }
    }
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

testDatabaseConnection();
