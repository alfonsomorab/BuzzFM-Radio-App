import { NextRequest } from 'next/server';
import { validateApiKey, isStationActive } from '@/lib/auth';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { checkRateLimit, RateLimitPresets } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/public/config
 *
 * Returns station configuration for mobile app
 * Requires: Authorization header with Bearer token (API key)
 *
 * Response includes:
 * - Station name and status
 * - Stream URLs (primary and backup)
 * - Branding information (logo, colors)
 */
export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const { station, error } = await validateApiKey(request);

    if (error || !station) {
      return error;
    }

    // Check rate limit
    const rateLimit = checkRateLimit(station.apiKey, RateLimitPresets.publicApi);
    if (!rateLimit.allowed) {
      return ApiErrors.forbidden(
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds`
      );
    }

    // Check if station is suspended
    if (!isStationActive(station)) {
      return ApiErrors.stationSuspended();
    }

    // Return station configuration
    return successResponse({
      station: {
        name: station.name,
        slug: station.slug,
        status: station.status,
      },
      streamUrls: {
        primary: station.streamUrlPrimary,
        backup: station.streamUrlBackup,
      },
      branding: station.branding || {
        logoUrl: null,
        primaryColor: '#3b82f6',
        secondaryColor: '#6366f1',
      },
    });
  } catch (error) {
    console.error('Config endpoint error:', error);
    return ApiErrors.internalError('Failed to fetch station configuration');
  }
}
