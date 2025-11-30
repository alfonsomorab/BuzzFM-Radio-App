import { NextRequest } from 'next/server';
import { db } from '@/db';
import { radioStations, programs, payments, analyticsDaily, analyticsGeography } from '@/db/schema';
import { validateAdminSession } from '@/lib/auth-session';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { eq, count } from 'drizzle-orm';
import { z } from 'zod';

/**
 * GET /api/admin/stations/[id]
 * Get station details with related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin session
    await validateAdminSession();

    const { id } = params;

    // Fetch station
    const [station] = await db
      .select()
      .from(radioStations)
      .where(eq(radioStations.id, id))
      .limit(1);

    if (!station) {
      return ApiErrors.stationNotFound();
    }

    // Get related counts
    const [programCount] = await db
      .select({ count: count() })
      .from(programs)
      .where(eq(programs.stationId, id));

    const [paymentCount] = await db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.stationId, id));

    return successResponse({
      ...station,
      programCount: programCount.count,
      paymentCount: paymentCount.count,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return ApiErrors.unauthorized();
    }
    if (error.message === 'FORBIDDEN') {
      return ApiErrors.forbidden();
    }
    console.error('Error getting station:', error);
    return ApiErrors.internalError();
  }
}

/**
 * PUT /api/admin/stations/[id]
 * Update station details
 */

const updateStationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
  address: z.string().max(1000).optional(),
  description: z.string().max(1000).optional(),
  musicGenre: z.string().max(255).optional(),
  contactName: z.string().max(255).optional(),
  contactPhone: z.string().max(50).optional(),
  contactEmail: z.string().email().optional(),
  streamUrlPrimary: z.string().url().optional(),
  streamUrlBackup: z.string().url().optional(),
  subscriptionDueDate: z.string().nullable().optional(),
  branding: z
    .object({
      logoUrl: z.string().url().optional(),
      primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    })
    .nullable()
    .optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin session
    await validateAdminSession();

    const { id } = params;

    // Check if station exists
    const [existingStation] = await db
      .select()
      .from(radioStations)
      .where(eq(radioStations.id, id))
      .limit(1);

    if (!existingStation) {
      return ApiErrors.stationNotFound();
    }

    const body = await request.json();

    // Validate request body
    const validationResult = updateStationSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiErrors.validationError(validationResult.error.errors);
    }

    const data = validationResult.data;

    // If slug is being updated, check for duplicates
    if (data.slug && data.slug !== existingStation.slug) {
      const [duplicate] = await db
        .select({ id: radioStations.id })
        .from(radioStations)
        .where(eq(radioStations.slug, data.slug))
        .limit(1);

      if (duplicate) {
        return ApiErrors.duplicateSlug();
      }
    }

    // Update station
    const [updatedStation] = await db
      .update(radioStations)
      .set({
        ...data,
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
    console.error('Error updating station:', error);
    return ApiErrors.internalError();
  }
}

/**
 * DELETE /api/admin/stations/[id]
 * Delete a station and all related data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin session
    await validateAdminSession();

    const { id } = params;

    // Check if station exists
    const [station] = await db
      .select()
      .from(radioStations)
      .where(eq(radioStations.id, id))
      .limit(1);

    if (!station) {
      return ApiErrors.stationNotFound();
    }

    // Delete in transaction (cascade deletes should handle related data)
    // But we'll be explicit for clarity
    await db.transaction(async (tx) => {
      // Delete analytics
      await tx.delete(analyticsGeography).where(eq(analyticsGeography.stationId, id));
      await tx.delete(analyticsDaily).where(eq(analyticsDaily.stationId, id));

      // Delete programs
      await tx.delete(programs).where(eq(programs.stationId, id));

      // Delete payments
      await tx.delete(payments).where(eq(payments.stationId, id));

      // Delete station
      await tx.delete(radioStations).where(eq(radioStations.id, id));
    });

    return successResponse({
      deletedId: id,
      message: 'Station and all related data deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return ApiErrors.unauthorized();
    }
    if (error.message === 'FORBIDDEN') {
      return ApiErrors.forbidden();
    }
    console.error('Error deleting station:', error);
    return ApiErrors.internalError();
  }
}
