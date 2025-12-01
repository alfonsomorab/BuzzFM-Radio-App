import { NextRequest } from 'next/server';
import { db } from '@/db';
import { radioStations } from '@/db/schema';
import { validateAdminSession } from '@/lib/auth-session';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * POST /api/admin/stations/[id]/suspend
 * Suspend a radio station
 */

const suspendSchema = z.object({
  reason: z.string().max(500).optional(),
});

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

    // Parse body for optional reason
    const body = await request.json().catch(() => ({}));
    const validationResult = suspendSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.validationError(validationResult.error.flatten().fieldErrors);
    }

    // Update station status to suspended
    const [updatedStation] = await db
      .update(radioStations)
      .set({
        status: 'suspended',
        updatedAt: new Date(),
      })
      .where(eq(radioStations.id, id))
      .returning();

    return successResponse({
      ...updatedStation,
      suspensionReason: validationResult.data.reason,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return ApiErrors.unauthorized();
    }
    if (error.message === 'FORBIDDEN') {
      return ApiErrors.forbidden();
    }
    console.error('Error suspending station:', error);
    return ApiErrors.internalError();
  }
}
