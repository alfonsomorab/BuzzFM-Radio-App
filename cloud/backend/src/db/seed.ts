import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables before importing db
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

import { db, testConnection, closeConnection } from './index';
import { users, radioStations, programs, payments } from './schema';
import { randomBytes } from 'crypto';

// Helper to generate API keys
function generateApiKey(): string {
  return randomBytes(32).toString('hex');
}

// Helper to generate slugs
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // 1. Create Admin User
    console.log('Creating admin user...');
    const [adminUser] = await db.insert(users).values({
      email: 'admin@radiostreaming.com',
      passwordHash: '$2a$10$dummy.hash.for.testing.purposes.only', // In production, use bcrypt
      name: 'Platform Admin',
      role: 'admin',
    }).returning();
    console.log('✅ Admin user created:', adminUser.email);

    // 2. Create Sample Radio Stations
    console.log('\nCreating radio stations...');

    const [station1] = await db.insert(radioStations).values({
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
      subscriptionDueDate: new Date('2025-01-15').toISOString().split('T')[0],
      lastPaymentDate: new Date('2024-12-15').toISOString().split('T')[0],
      branding: {
        logoUrl: 'https://example.com/logos/magicfm.png',
        primaryColor: '#FF5733',
        secondaryColor: '#FFC300',
      },
    }).returning();
    console.log('✅ Station created:', station1.name, '| API Key:', station1.apiKey);

    const [station2] = await db.insert(radioStations).values({
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
      subscriptionDueDate: new Date('2025-02-01').toISOString().split('T')[0],
      lastPaymentDate: new Date('2025-01-01').toISOString().split('T')[0],
      branding: {
        logoUrl: 'https://example.com/logos/jazzvibes.png',
        primaryColor: '#3498DB',
        secondaryColor: '#2ECC71',
      },
    }).returning();
    console.log('✅ Station created:', station2.name, '| API Key:', station2.apiKey);

    const [station3] = await db.insert(radioStations).values({
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
      subscriptionDueDate: new Date('2024-12-01').toISOString().split('T')[0],
      lastPaymentDate: new Date('2024-11-01').toISOString().split('T')[0],
      branding: {
        logoUrl: 'https://example.com/logos/rocknation.png',
        primaryColor: '#E74C3C',
        secondaryColor: '#34495E',
      },
    }).returning();
    console.log('✅ Station created:', station3.name, '| Status:', station3.status);

    // 3. Create Station Users
    console.log('\nCreating station users...');

    const [stationUser1] = await db.insert(users).values({
      email: 'manager@magicfm.com',
      passwordHash: '$2a$10$dummy.hash.for.testing.purposes.only',
      name: 'Magic FM Manager',
      role: 'station',
      stationId: station1.id,
    }).returning();
    console.log('✅ Station user created:', stationUser1.email);

    const [stationUser2] = await db.insert(users).values({
      email: 'manager@jazzvibes.com',
      passwordHash: '$2a$10$dummy.hash.for.testing.purposes.only',
      name: 'Jazz Vibes Manager',
      role: 'station',
      stationId: station2.id,
    }).returning();
    console.log('✅ Station user created:', stationUser2.email);

    // 4. Create Program Schedules
    console.log('\nCreating program schedules...');

    // Magic FM Programs
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
        dayOfWeek: 1, // Monday
        startTime: '12:00:00',
        endTime: '14:00:00',
        isActive: true,
      },
      {
        stationId: station1.id,
        title: 'Drive Time Mix',
        hostName: 'DJ Carlos',
        description: 'Your favorite tunes for the commute home',
        dayOfWeek: 1, // Monday
        startTime: '16:00:00',
        endTime: '19:00:00',
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
        dayOfWeek: 2, // Tuesday
        startTime: '12:00:00',
        endTime: '14:00:00',
        isActive: true,
      },
    ]);
    console.log('✅ Program schedules created');

    // 5. Create Payment Records
    console.log('\nCreating payment records...');

    await db.insert(payments).values([
      {
        stationId: station1.id,
        amount: 9900, // $99.00
        paymentDate: '2024-12-15',
        dueDate: '2024-12-15',
        status: 'paid',
        notes: 'December 2024 subscription',
        recordedBy: adminUser.id,
      },
      {
        stationId: station1.id,
        amount: 9900, // $99.00
        paymentDate: null,
        dueDate: '2025-01-15',
        status: 'pending',
        notes: 'January 2025 subscription',
        recordedBy: adminUser.id,
      },
      {
        stationId: station2.id,
        amount: 12900, // $129.00
        paymentDate: '2025-01-01',
        dueDate: '2025-01-01',
        status: 'paid',
        notes: 'January 2025 subscription',
        recordedBy: adminUser.id,
      },
      {
        stationId: station3.id,
        amount: 9900, // $99.00
        paymentDate: null,
        dueDate: '2024-12-01',
        status: 'overdue',
        notes: 'December 2024 subscription - OVERDUE',
        recordedBy: adminUser.id,
      },
    ]);
    console.log('✅ Payment records created');

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log('  - 1 Admin user');
    console.log('  - 3 Radio stations');
    console.log('  - 2 Station users');
    console.log('  - 5 Programs');
    console.log('  - 4 Payment records');
    console.log('\n🔑 Test Credentials:');
    console.log('  Admin: admin@radiostreaming.com');
    console.log('  Station 1: manager@magicfm.com');
    console.log('  Station 2: manager@jazzvibes.com');
    console.log('\n🔐 API Keys:');
    console.log('  Magic FM:', station1.apiKey);
    console.log('  Jazz Vibes:', station2.apiKey);
    console.log('  Rock Nation:', station3.apiKey);

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
