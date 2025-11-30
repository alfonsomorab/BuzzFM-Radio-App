import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables before importing db
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

import { db, testConnection, closeConnection } from './index';
import { users, radioStations, programs, payments } from './schema';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

/**
 * Enhanced Seed Script for Admin Dashboard
 * Creates admin user with real bcrypt password and sample data for testing
 */

// Helper to generate API keys with sk_live_ prefix
function generateApiKey(): string {
  return `sk_live_${randomBytes(32).toString('hex')}`;
}

// Helper to generate slugs
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seed() {
  console.log('🌱 Starting enhanced admin database seed...\n');

  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // 1. Create Admin User with real bcrypt password
    console.log('Creating admin user with bcrypt password...');
    const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

    const [adminUser] = await db
      .insert(users)
      .values({
        email: 'admin@radioplatform.com',
        passwordHash: adminPasswordHash,
        name: 'Platform Administrator',
        role: 'admin',
      })
      .returning();
    console.log('✅ Admin user created:', adminUser.email);
    console.log('   Password: Admin123!');

    // 2. Create Sample Radio Stations
    console.log('\nCreating radio stations...');

    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    const oneDayFromNow = new Date(today);
    oneDayFromNow.setDate(today.getDate() + 1);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const [station1] = await db
      .insert(radioStations)
      .values({
        name: 'Magic FM 95.7',
        slug: generateSlug('Magic FM 95.7'),
        address: '123 Radio Street, Music City, MC 12345',
        description: 'Your favorite hits from the 80s, 90s, and today!',
        musicGenre: 'Pop, Rock, Classics',
        contactName: 'John Smith',
        contactPhone: '+1-555-0100',
        contactEmail: 'contact@magicfm.com',
        streamUrlPrimary: 'https://streaming.hostpannel.lat:8012/stream',
        streamUrlBackup: 'https://streaming.hostpannel.lat:2020/public/magicfm',
        apiKey: generateApiKey(),
        status: 'active',
        subscriptionDueDate: sevenDaysFromNow.toISOString().split('T')[0],
        lastPaymentDate: thirtyDaysAgo.toISOString().split('T')[0],
        branding: {
          logoUrl: 'https://example.com/logos/magicfm.png',
          primaryColor: '#FF5733',
          secondaryColor: '#FFC300',
        },
      })
      .returning();
    console.log('✅ Station created:', station1.name);
    console.log('   API Key:', station1.apiKey);
    console.log('   Subscription due:', station1.subscriptionDueDate, '(7 days from now)');

    const [station2] = await db
      .insert(radioStations)
      .values({
        name: 'Jazz Vibes 101.3',
        slug: generateSlug('Jazz Vibes 101.3'),
        address: '456 Jazz Avenue, Sound Town, ST 67890',
        description: 'Smooth jazz and soulful melodies all day long',
        musicGenre: 'Jazz, Blues, Soul',
        contactName: 'Sarah Johnson',
        contactPhone: '+1-555-0200',
        contactEmail: 'info@jazzvibes.com',
        streamUrlPrimary: 'https://streaming.example.com/jazzvibes',
        streamUrlBackup: 'https://backup.example.com/jazzvibes',
        apiKey: generateApiKey(),
        status: 'active',
        subscriptionDueDate: oneDayFromNow.toISOString().split('T')[0],
        lastPaymentDate: thirtyDaysAgo.toISOString().split('T')[0],
        branding: {
          logoUrl: 'https://example.com/logos/jazzvibes.png',
          primaryColor: '#3498DB',
          secondaryColor: '#2ECC71',
        },
      })
      .returning();
    console.log('✅ Station created:', station2.name);
    console.log('   API Key:', station2.apiKey);
    console.log('   Subscription due:', station2.subscriptionDueDate, '(1 day from now)');

    const [station3] = await db
      .insert(radioStations)
      .values({
        name: 'Rock Nation FM',
        slug: generateSlug('Rock Nation FM'),
        address: '789 Rock Boulevard, Metal City, RC 11111',
        description: 'Pure rock energy 24/7',
        musicGenre: 'Rock, Metal, Alternative',
        contactName: 'Mike Rodriguez',
        contactPhone: '+1-555-0300',
        contactEmail: 'contact@rocknation.fm',
        streamUrlPrimary: 'https://streaming.example.com/rocknation',
        apiKey: generateApiKey(),
        status: 'suspended',
        subscriptionDueDate: thirtyDaysAgo.toISOString().split('T')[0],
        lastPaymentDate: new Date(today.getFullYear(), today.getMonth() - 2, 1)
          .toISOString()
          .split('T')[0],
        branding: {
          logoUrl: 'https://example.com/logos/rocknation.png',
          primaryColor: '#E74C3C',
          secondaryColor: '#34495E',
        },
      })
      .returning();
    console.log('✅ Station created:', station3.name);
    console.log('   API Key:', station3.apiKey);
    console.log('   Status: SUSPENDED (overdue payment)');

    // 3. Create Station Users
    console.log('\nCreating station users...');

    const stationPasswordHash = await bcrypt.hash('Station123!', 10);

    const [stationUser1] = await db
      .insert(users)
      .values({
        email: 'manager@magicfm.com',
        passwordHash: stationPasswordHash,
        name: 'Magic FM Manager',
        role: 'station',
        stationId: station1.id,
      })
      .returning();
    console.log('✅ Station user created:', stationUser1.email);

    const [stationUser2] = await db
      .insert(users)
      .values({
        email: 'manager@jazzvibes.com',
        passwordHash: stationPasswordHash,
        name: 'Jazz Vibes Manager',
        role: 'station',
        stationId: station2.id,
      })
      .returning();
    console.log('✅ Station user created:', stationUser2.email);
    console.log('   Password for all station users: Station123!');

    // 4. Create Program Schedules (12 programs across stations)
    console.log('\nCreating program schedules...');

    // Magic FM Programs (Monday-Friday)
    await db.insert(programs).values([
      {
        stationId: station1.id,
        title: 'Morning Magic',
        hostName: 'DJ Sarah',
        description: 'Wake up with the best hits to start your day!',
        dayOfWeek: 1, // Monday
        startTime: '06:00:00',
        endTime: '10:00:00',
        isActive: true,
      },
      {
        stationId: station1.id,
        title: 'Lunchtime Classics',
        hostName: 'Mike Thompson',
        description: 'Timeless classics during your lunch break',
        dayOfWeek: 1,
        startTime: '12:00:00',
        endTime: '14:00:00',
        isActive: true,
      },
      {
        stationId: station1.id,
        title: 'Drive Time Mix',
        hostName: 'DJ Carlos',
        description: 'Your favorite tunes for the commute home',
        dayOfWeek: 1,
        startTime: '16:00:00',
        endTime: '19:00:00',
        isActive: true,
      },
      {
        stationId: station1.id,
        title: 'Weekend Throwback',
        hostName: 'DJ Sarah',
        description: 'Classic hits from the past decades',
        dayOfWeek: 6, // Saturday
        startTime: '10:00:00',
        endTime: '14:00:00',
        isActive: true,
      },
    ]);

    // Jazz Vibes Programs
    await db.insert(programs).values([
      {
        stationId: station2.id,
        title: 'Smooth Morning Jazz',
        hostName: 'Linda Martinez',
        description: 'Start your day with smooth jazz melodies',
        dayOfWeek: 2, // Tuesday
        startTime: '07:00:00',
        endTime: '11:00:00',
        isActive: true,
      },
      {
        stationId: station2.id,
        title: 'Jazz at Noon',
        hostName: 'Robert Lee',
        description: 'Midday jazz favorites',
        dayOfWeek: 2,
        startTime: '12:00:00',
        endTime: '14:00:00',
        isActive: true,
      },
      {
        stationId: station2.id,
        title: 'Evening Soul Sessions',
        hostName: 'Marcus Brown',
        description: 'Soulful jazz and blues to unwind',
        dayOfWeek: 4, // Thursday
        startTime: '19:00:00',
        endTime: '22:00:00',
        isActive: true,
      },
      {
        stationId: station2.id,
        title: 'Sunday Jazz Brunch',
        hostName: 'Linda Martinez',
        description: 'Perfect jazz for your Sunday morning',
        dayOfWeek: 0, // Sunday
        startTime: '09:00:00',
        endTime: '13:00:00',
        isActive: true,
      },
    ]);

    // Rock Nation Programs (suspended station still has schedules)
    await db.insert(programs).values([
      {
        stationId: station3.id,
        title: 'Morning Rock Wake-Up',
        hostName: 'Tommy Rocks',
        description: 'High energy rock to start your day',
        dayOfWeek: 1,
        startTime: '06:00:00',
        endTime: '09:00:00',
        isActive: true,
      },
      {
        stationId: station3.id,
        title: 'Metal Monday',
        hostName: 'Slash McKenzie',
        description: 'Heavy metal all day long',
        dayOfWeek: 1,
        startTime: '20:00:00',
        endTime: '23:00:00',
        isActive: true,
      },
      {
        stationId: station3.id,
        title: 'Classic Rock Friday',
        hostName: 'Tommy Rocks',
        description: 'The best classic rock anthems',
        dayOfWeek: 5,
        startTime: '18:00:00',
        endTime: '22:00:00',
        isActive: true,
      },
      {
        stationId: station3.id,
        title: 'Weekend Rock Marathon',
        hostName: 'Various DJs',
        description: 'Non-stop rock all weekend',
        dayOfWeek: 6,
        startTime: '00:00:00',
        endTime: '23:59:59',
        isActive: false, // Inactive due to suspension
      },
    ]);
    console.log('✅ 12 program schedules created');

    // 5. Create Payment Records (6 payments with various statuses)
    console.log('\nCreating payment records...');

    const fifteenDaysAgo = new Date(today);
    fifteenDaysAgo.setDate(today.getDate() - 15);

    await db.insert(payments).values([
      // Magic FM - Paid last month
      {
        stationId: station1.id,
        amount: 9900, // $99.00
        paymentDate: thirtyDaysAgo.toISOString().split('T')[0],
        dueDate: thirtyDaysAgo.toISOString().split('T')[0],
        status: 'paid',
        notes: 'Monthly subscription payment',
        recordedBy: adminUser.id,
      },
      // Magic FM - Upcoming payment (pending)
      {
        stationId: station1.id,
        amount: 9900,
        paymentDate: null,
        dueDate: sevenDaysFromNow.toISOString().split('T')[0],
        status: 'pending',
        notes: 'Next monthly subscription - due in 7 days',
        recordedBy: adminUser.id,
      },
      // Jazz Vibes - Paid recently
      {
        stationId: station2.id,
        amount: 12900, // $129.00 (premium plan)
        paymentDate: fifteenDaysAgo.toISOString().split('T')[0],
        dueDate: fifteenDaysAgo.toISOString().split('T')[0],
        status: 'paid',
        notes: 'Premium plan subscription',
        recordedBy: adminUser.id,
      },
      // Jazz Vibes - Urgent payment (pending, due tomorrow)
      {
        stationId: station2.id,
        amount: 12900,
        paymentDate: null,
        dueDate: oneDayFromNow.toISOString().split('T')[0],
        status: 'pending',
        notes: 'URGENT: Payment due tomorrow!',
        recordedBy: adminUser.id,
      },
      // Rock Nation - Overdue payment
      {
        stationId: station3.id,
        amount: 9900,
        paymentDate: null,
        dueDate: thirtyDaysAgo.toISOString().split('T')[0],
        status: 'overdue',
        notes: 'OVERDUE - Station suspended',
        recordedBy: adminUser.id,
      },
      // Rock Nation - Previous paid payment
      {
        stationId: station3.id,
        amount: 9900,
        paymentDate: new Date(today.getFullYear(), today.getMonth() - 2, 1)
          .toISOString()
          .split('T')[0],
        dueDate: new Date(today.getFullYear(), today.getMonth() - 2, 1)
          .toISOString()
          .split('T')[0],
        status: 'paid',
        notes: 'Last successful payment (2 months ago)',
        recordedBy: adminUser.id,
      },
    ]);
    console.log('✅ 6 payment records created');

    console.log('\n✨ Enhanced admin database seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log('  - 1 Admin user (with bcrypt password)');
    console.log('  - 3 Radio stations (1 active, 1 expiring soon, 1 suspended)');
    console.log('  - 2 Station users (with bcrypt passwords)');
    console.log('  - 12 Programs');
    console.log('  - 6 Payment records (2 paid, 2 pending, 1 overdue, 1 historical)');
    console.log('\n🔑 Login Credentials:');
    console.log('  Admin:');
    console.log('    Email: admin@radioplatform.com');
    console.log('    Password: Admin123!');
    console.log('  Station Users:');
    console.log('    Email: manager@magicfm.com OR manager@jazzvibes.com');
    console.log('    Password: Station123!');
    console.log('\n🔐 Station API Keys:');
    console.log('  Magic FM:', station1.apiKey);
    console.log('  Jazz Vibes:', station2.apiKey);
    console.log('  Rock Nation:', station3.apiKey, '(SUSPENDED)');
    console.log('\n⚠️  Payment Scenarios:');
    console.log('  - Magic FM: Due in 7 days (test 7-day reminder)');
    console.log('  - Jazz Vibes: Due in 1 day (test 1-day reminder)');
    console.log('  - Rock Nation: Overdue and suspended');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await closeConnection();
  }
}

// Run seed
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
