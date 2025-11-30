import { NextRequest } from 'next/server';
import { validateJwt } from '@/lib/auth';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { checkRateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { db } from '@/db';
import { analyticsDaily, analyticsGeography } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

interface AnalyticsPayload {
  sessionDuration?: number; // in seconds
  country?: string;
  city?: string;
  quality?: 'high' | 'medium' | 'low';
  timestamp?: string;
}

/**
 * POST /api/public/analytics
 *
 * Logs listening session analytics
 * Requires: Authorization header with Bearer token (JWT)
 *
 * Request body:
 * - sessionDuration (optional): Duration in seconds
 * - country (optional): Listener's country
 * - city (optional): Listener's city
 * - quality (optional): Stream quality used
 * - timestamp (optional): Session timestamp
 *
 * This endpoint updates daily analytics and geographic distribution
 */
export async function POST(request: NextRequest) {
  try {
    // Validate JWT token
    const { station, error } = await validateJwt(request);

    if (error || !station) {
      return error;
    }

    // Check rate limit (more restrictive for analytics, use station ID for JWT-based auth)
    const rateLimit = checkRateLimit(station.id, RateLimitPresets.analytics);
    if (!rateLimit.allowed) {
      return ApiErrors.forbidden(
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds`
      );
    }

    // Parse request body
    let payload: AnalyticsPayload;
    try {
      payload = await request.json();
    } catch {
      return ApiErrors.badRequest('Invalid JSON payload');
    }

    const today = new Date().toISOString().split('T')[0];

    // Update daily analytics (increment listener count)
    await db
      .insert(analyticsDaily)
      .values({
        stationId: station.id,
        date: today,
        totalListeners: 1,
        peakListeners: 1,
        peakTime: new Date().toTimeString().split(' ')[0],
      })
      .onConflictDoUpdate({
        target: [analyticsDaily.stationId, analyticsDaily.date],
        set: {
          totalListeners: sql`${analyticsDaily.totalListeners} + 1`,
          // Update peak if current count is higher (simplified - in production use real-time tracking)
          peakListeners: sql`GREATEST(${analyticsDaily.peakListeners}, ${analyticsDaily.totalListeners} + 1)`,
        },
      });

    // Update geographic analytics if country is provided
    if (payload.country) {
      // Check if entry exists
      const [existing] = await db
        .select()
        .from(analyticsGeography)
        .where(
          and(
            eq(analyticsGeography.stationId, station.id),
            eq(analyticsGeography.date, today),
            eq(analyticsGeography.country, payload.country)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing entry
        await db
          .update(analyticsGeography)
          .set({
            listenerCount: sql`${analyticsGeography.listenerCount} + 1`,
          })
          .where(eq(analyticsGeography.id, existing.id));
      } else {
        // Insert new entry
        await db.insert(analyticsGeography).values({
          stationId: station.id,
          date: today,
          country: payload.country,
          city: payload.city || null,
          listenerCount: 1,
        });
      }
    }

    return successResponse(
      {
        message: 'Analytics logged successfully',
        sessionId: crypto.randomUUID(), // Return a session ID for tracking
      },
      201
    );
  } catch (error) {
    console.error('Analytics endpoint error:', error);
    return ApiErrors.internalError('Failed to log analytics');
  }
}
