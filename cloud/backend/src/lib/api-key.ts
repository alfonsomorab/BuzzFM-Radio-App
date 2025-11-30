import { randomBytes } from 'crypto';
import { db } from '@/db';
import { radioStations } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * API Key Generator
 *
 * Generates secure API keys for radio stations with the format:
 * sk_live_{64 hex characters}
 *
 * Uses crypto.randomBytes for cryptographically secure random generation
 */

const API_KEY_PREFIX = 'sk_live_';
const API_KEY_LENGTH = 32; // bytes, will be 64 hex characters

/**
 * Generate a new API key with secure random bytes
 *
 * @returns API key in format: sk_live_{64 hex characters}
 */
export function generateApiKeyString(): string {
  const randomPart = randomBytes(API_KEY_LENGTH).toString('hex');
  return `${API_KEY_PREFIX}${randomPart}`;
}

/**
 * Generate a unique API key that doesn't exist in the database
 *
 * @returns Promise<string> Unique API key
 */
export async function generateUniqueApiKey(): Promise<string> {
  let apiKey: string;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    apiKey = generateApiKeyString();

    // Check if key already exists
    const [existing] = await db
      .select({ id: radioStations.id })
      .from(radioStations)
      .where(eq(radioStations.apiKey, apiKey))
      .limit(1);

    if (!existing) {
      return apiKey;
    }

    attempts++;
  }

  throw new Error('Failed to generate unique API key after maximum attempts');
}

/**
 * Validate API key format (without database lookup)
 *
 * @param key - API key to validate
 * @returns boolean - true if format is valid
 */
export function isValidApiKeyFormat(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }

  // Check prefix
  if (!key.startsWith(API_KEY_PREFIX)) {
    return false;
  }

  // Remove prefix and check hex part
  const hexPart = key.substring(API_KEY_PREFIX.length);

  // Should be exactly 64 hex characters
  if (hexPart.length !== API_KEY_LENGTH * 2) {
    return false;
  }

  // Check if all characters are valid hex
  const hexRegex = /^[0-9a-f]+$/;
  return hexRegex.test(hexPart);
}

/**
 * Mask API key for display (show only first 10 and last 4 characters)
 *
 * @param key - API key to mask
 * @returns Masked API key (e.g., "sk_live_ab...xyz9")
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 15) {
    return '***';
  }

  const start = key.substring(0, 10);
  const end = key.substring(key.length - 4);

  return `${start}...${end}`;
}
