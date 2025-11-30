import { NextRequest } from 'next/server';
import { db } from '@/db';
import { radioStations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ApiErrors } from './api-response';
import { extractJwtToken, verifyJwt } from './jwt';

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

/**
 * Validates JWT token from Authorization header
 * Expected format: "Bearer {jwt_token}"
 *
 * This is the primary authentication method for protected endpoints.
 * Mobile apps obtain JWT tokens by authenticating with their API key at /api/public/auth
 */
export async function validateJwt(
  request: NextRequest
): Promise<{ station: AuthenticatedStation | null; error: any | null }> {
  try {
    // Extract JWT token from Authorization header
    const token = extractJwtToken(request);

    if (!token) {
      return {
        station: null,
        error: ApiErrors.invalidToken('Missing or invalid authorization header'),
      };
    }

    // Verify and decode JWT
    const verification = await verifyJwt(token);

    if (!verification.valid) {
      // Handle specific JWT errors
      if (verification.error === 'TOKEN_EXPIRED') {
        return {
          station: null,
          error: ApiErrors.tokenExpired(),
        };
      }

      return {
        station: null,
        error: ApiErrors.invalidToken(),
      };
    }

    // JWT is valid, fetch station data from database
    // We still need to fetch full station data as JWT only contains minimal claims
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
      .where(eq(radioStations.id, verification.payload!.stationId))
      .limit(1);

    if (!station) {
      // Station not found - token references non-existent station
      return {
        station: null,
        error: ApiErrors.invalidToken('Station not found'),
      };
    }

    return { station, error: null };
  } catch (error) {
    console.error('JWT validation error:', error);
    return {
      station: null,
      error: ApiErrors.internalError('Authentication failed'),
    };
  }
}
