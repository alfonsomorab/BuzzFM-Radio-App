import { NextRequest } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { checkRateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { generateJwt } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

/**
 * POST /api/public/auth
 *
 * Authenticates mobile app with API key and returns JWT token
 * This is the initial authentication endpoint - mobile apps call this once to obtain a JWT
 *
 * Authentication: API key in Authorization header (Bearer {api_key})
 *
 * Response includes:
 * - JWT token (valid for 24 hours)
 * - Token expiration timestamp
 * - Station basic information
 *
 * Rate limit: 10 requests per minute to prevent brute force attacks
 *
 * Usage flow:
 * 1. Mobile app sends API key to this endpoint
 * 2. Backend validates API key against database
 * 3. Backend generates JWT with station ID and status
 * 4. Mobile app stores JWT securely (flutter_secure_storage)
 * 5. Mobile app uses JWT for all subsequent API calls
 * 6. When JWT expires, mobile app re-authenticates using API key
 */
export async function POST(request: NextRequest) {
  try {
    // Extract API key for rate limiting (use forwarded IP if not available)
    const authHeader = request.headers.get('authorization');
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor?.split(',')[0].trim() || 'unknown';
    const apiKeyForRateLimit = authHeader?.split(' ')[1] || clientIp;

    // Check rate limit (strict - 10 requests per minute)
    const rateLimit = checkRateLimit(`auth:${apiKeyForRateLimit}`, RateLimitPresets.auth);
    if (!rateLimit.allowed) {
      return ApiErrors.forbidden(
        `Too many authentication attempts. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds`
      );
    }

    // Validate API key
    const { station, error } = await validateApiKey(request);

    if (error || !station) {
      return error;
    }

    // Generate JWT token
    const token = await generateJwt(station.id, station.status);

    // Calculate expiration timestamp
    const expirationTime = parseInt(process.env.JWT_EXPIRATION || '86400', 10);
    const expiresAt = new Date(Date.now() + expirationTime * 1000);

    // Return JWT and station info
    return successResponse(
      {
        token,
        expiresAt: expiresAt.toISOString(),
        expiresIn: expirationTime, // seconds
        station: {
          id: station.id,
          name: station.name,
          slug: station.slug,
          status: station.status,
        },
      },
      200
    );
  } catch (error) {
    console.error('Authentication endpoint error:', error);
    return ApiErrors.internalError('Authentication failed');
  }
}
