import { NextRequest } from 'next/server';
import { validateJwt } from '@/lib/auth';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { checkRateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { db } from '@/db';
import { programs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/public/schedule?date=YYYY-MM-DD
 *
 * Returns program schedule for a specific date or day of week
 * Requires: Authorization header with Bearer token (JWT)
 *
 * Query params:
 * - date (optional): Date in YYYY-MM-DD format. If not provided, returns today's schedule
 *
 * Response includes:
 * - Array of programs with title, host, description, start/end times
 */
export async function GET(request: NextRequest) {
  try {
    // Validate JWT token
    const { station, error } = await validateJwt(request);

    if (error || !station) {
      return error;
    }

    // Check rate limit (use station ID for JWT-based auth)
    const rateLimit = checkRateLimit(station.id, RateLimitPresets.publicApi);
    if (!rateLimit.allowed) {
      return ApiErrors.forbidden(
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds`
      );
    }

    // Get date from query params or use today
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    let targetDate: Date;
    if (dateParam) {
      targetDate = new Date(dateParam);
      if (isNaN(targetDate.getTime())) {
        return ApiErrors.badRequest('Invalid date format. Expected: YYYY-MM-DD');
      }
    } else {
      targetDate = new Date();
    }

    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = targetDate.getDay();

    // Fetch programs for this station and day of week
    const stationPrograms = await db
      .select({
        id: programs.id,
        title: programs.title,
        hostName: programs.hostName,
        description: programs.description,
        dayOfWeek: programs.dayOfWeek,
        startTime: programs.startTime,
        endTime: programs.endTime,
        isActive: programs.isActive,
      })
      .from(programs)
      .where(
        and(
          eq(programs.stationId, station.id),
          eq(programs.dayOfWeek, dayOfWeek),
          eq(programs.isActive, true)
        )
      )
      .orderBy(programs.startTime);

    // Format response
    const formattedPrograms = stationPrograms.map((program) => ({
      id: program.id,
      title: program.title,
      host: program.hostName || 'Unknown Host',
      description: program.description || '',
      startTime: program.startTime,
      endTime: program.endTime,
      dayOfWeek: program.dayOfWeek,
    }));

    return successResponse({
      date: targetDate.toISOString().split('T')[0],
      dayOfWeek,
      programs: formattedPrograms,
      count: formattedPrograms.length,
    });
  } catch (error) {
    console.error('Schedule endpoint error:', error);
    return ApiErrors.internalError('Failed to fetch program schedule');
  }
}
