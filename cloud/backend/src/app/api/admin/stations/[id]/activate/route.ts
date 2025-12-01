import { NextRequest } from 'next/server';
import { db } from '@/db';
import { radioStations } from '@/db/schema';
import { validateAdminSession } from '@/lib/auth-session';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { eq } from 'drizzle-orm';

/**
 * POST /api/admin/stations/[id]/activate
 * Activate a suspended radio station
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate admin session
    await validateAdminSession();

    const { id } = await params;

    // Check if station exists
    const [station] = await db
      .select()
      .from(radioStations)
      .where(eq(radioStations.id, id))
      .limit(1);

    if (!station) {
      return ApiErrors.stationNotFound();
    }

    // Update station status to active
    const [updatedStation] = await db
      .update(radioStations)
      .set({
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(radioStations.id, id))
      .returning();

    return successResponse(updatedStation);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return ApiErrors.unauthorized();
    }
    if (error.message === 'FORBIDDEN') {
      return ApiErrors.forbidden();
    }
    console.error('Error activating station:', error);
    return ApiErrors.internalError();
  }
}
