import { NextRequest } from 'next/server';
import { db } from '@/db';
import { radioStations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ApiErrors } from './api-response';

export interface AuthenticatedStation {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  apiKey: string;
  streamUrlPrimary: string;
  streamUrlBackup: string | null;
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  } | null;
}

/**
 * Validates API key from Authorization header
 * Expected format: "Bearer {api_key}"
 */
export async function validateApiKey(
  request: NextRequest
): Promise<{ station: AuthenticatedStation | null; error: any | null }> {
  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return { station: null, error: ApiErrors.invalidApiKey() };
    }

    // Check format: "Bearer {api_key}"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return {
        station: null,
        error: ApiErrors.badRequest('Invalid authorization header format. Expected: Bearer {api_key}')
      };
    }

    const apiKey = parts[1];

    // Look up station by API key
    const [station] = await db
      .select({
        id: radioStations.id,
        name: radioStations.name,
        slug: radioStations.slug,
        status: radioStations.status,
        apiKey: radioStations.apiKey,
        streamUrlPrimary: radioStations.streamUrlPrimary,
        streamUrlBackup: radioStations.streamUrlBackup,
        branding: radioStations.branding,
      })
      .from(radioStations)
      .where(eq(radioStations.apiKey, apiKey))
      .limit(1);

    if (!station) {
      return { station: null, error: ApiErrors.invalidApiKey() };
    }

    return { station, error: null };
  } catch (error) {
    console.error('API key validation error:', error);
    return {
      station: null,
      error: ApiErrors.internalError('Authentication failed')
    };
  }
}

/**
 * Check if station is active (not suspended)
 */
export function isStationActive(station: AuthenticatedStation): boolean {
  return station.status === 'active';
}
