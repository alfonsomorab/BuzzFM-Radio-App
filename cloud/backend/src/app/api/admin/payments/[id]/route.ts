import { NextRequest } from 'next/server';
import { db } from '@/db';
import { payments, radioStations } from '@/db/schema';
import { validateAdminSession } from '@/lib/auth-session';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { eq } from 'drizzle-orm';

/**
 * GET /api/admin/payments/[id]
 * Get payment details with station information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin session
    await validateAdminSession();

    const { id } = params;

    // Fetch payment with station details
    const [payment] = await db
      .select({
        id: payments.id,
        stationId: payments.stationId,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        dueDate: payments.dueDate,
        status: payments.status,
        notes: payments.notes,
        recordedBy: payments.recordedBy,
        createdAt: payments.createdAt,
        station: {
          id: radioStations.id,
          name: radioStations.name,
          contactEmail: radioStations.contactEmail,
          subscriptionDueDate: radioStations.subscriptionDueDate,
        },
      })
      .from(payments)
      .leftJoin(radioStations, eq(payments.stationId, radioStations.id))
      .where(eq(payments.id, id))
      .limit(1);

    if (!payment) {
      return ApiErrors.paymentNotFound();
    }

    return successResponse(payment);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return ApiErrors.unauthorized();
    }
    if (error.message === 'FORBIDDEN') {
      return ApiErrors.forbidden();
    }
    console.error('Error getting payment:', error);
    return ApiErrors.internalError();
  }
}
