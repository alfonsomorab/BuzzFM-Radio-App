import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as schema from './schema';

// Load environment variables if not already loaded
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: resolve(__dirname, '../../.env.local') });
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Test connection helper
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown helper
export async function closeConnection() {
  await pool.end();
  console.log('Database connection closed');
}
