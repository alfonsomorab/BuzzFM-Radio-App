import { NextRequest } from 'next/server';
import { db } from '@/db';
import { payments, radioStations } from '@/db/schema';
import { validateAdminSession } from '@/lib/auth-session';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { eq, and, gte, lte, desc, asc, sql, count } from 'drizzle-orm';
import { z } from 'zod';

/**
 * GET /api/admin/payments
 * List all payments with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Validate admin session
    await validateAdminSession();

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
    const offset = (page - 1) * pageSize;

    // Filters
    const stationId = searchParams.get('stationId');
    const status = searchParams.get('status') as 'pending' | 'paid' | 'overdue' | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query conditions
    const conditions = [];

    if (stationId) {
      conditions.push(eq(payments.stationId, stationId));
    }

    if (status) {
      conditions.push(eq(payments.status, status));
    }

    if (startDate) {
      conditions.push(gte(payments.paymentDate, startDate));
    }

    if (endDate) {
      conditions.push(lte(payments.paymentDate, endDate));
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(payments)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined);

    // Fetch payments with station details
    const orderFn = sortOrder === 'asc' ? asc : desc;

    const paymentsList = await db
      .select({
        id: payments.id,
        stationId: payments.stationId,
        stationName: radioStations.name,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        dueDate: payments.dueDate,
        status: payments.status,
        notes: payments.notes,
        recordedBy: payments.recordedBy,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .leftJoin(radioStations, eq(payments.stationId, radioStations.id))
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
      .orderBy(orderFn(payments.createdAt))
      .limit(pageSize)
      .offset(offset);

    return successResponse({
      items: paymentsList,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return ApiErrors.unauthorized();
    }
    if (error.message === 'FORBIDDEN') {
      return ApiErrors.forbidden();
    }
    console.error('Error listing payments:', error);
    return ApiErrors.internalError();
  }
}

/**
 * POST /api/admin/payments
 * Record a new payment
 */

const createPaymentSchema = z.object({
  stationId: z.string().uuid(),
  amount: z.number().int().positive(),
  paymentDate: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).default('paid'),
  notes: z.string().max(1000).optional(),
  extendSubscriptionDays: z.number().int().min(0).max(365).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate admin session
    const adminSession = await validateAdminSession();

    const body = await request.json();

    // Validate request body
    const validationResult = createPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiErrors.validationError(validationResult.error.errors);
    }

    const data = validationResult.data;

    // Check if station exists
    const [station] = await db
      .select()
      .from(radioStations)
      .where(eq(radioStations.id, data.stationId))
      .limit(1);

    if (!station) {
      return ApiErrors.stationNotFound();
    }

    // Calculate due date (30 days from payment date or today)
    const paymentDate = data.paymentDate || new Date().toISOString().split('T')[0];
    const dueDateObj = new Date(paymentDate);
    dueDateObj.setDate(dueDateObj.getDate() + 30);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    // Create payment record
    const [newPayment] = await db
      .insert(payments)
      .values({
        stationId: data.stationId,
        amount: data.amount,
        paymentDate,
        dueDate,
        status: data.status,
        notes: data.notes,
        recordedBy: adminSession.id,
      })
      .returning();

    // If extendSubscriptionDays is provided, update station subscription date
    if (data.extendSubscriptionDays && data.extendSubscriptionDays > 0) {
      const currentDueDate = station.subscriptionDueDate
        ? new Date(station.subscriptionDueDate)
        : new Date();

      // If current due date is in the past, start from today
      const today = new Date();
      const baseDate = currentDueDate > today ? currentDueDate : today;

      baseDate.setDate(baseDate.getDate() + data.extendSubscriptionDays);
      const newSubscriptionDueDate = baseDate.toISOString().split('T')[0];

      await db
        .update(radioStations)
        .set({
          subscriptionDueDate: newSubscriptionDueDate,
          lastPaymentDate: paymentDate,
          updatedAt: new Date(),
        })
        .where(eq(radioStations.id, data.stationId));
    }

    return successResponse(newPayment, 201);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return ApiErrors.unauthorized();
    }
    if (error.message === 'FORBIDDEN') {
      return ApiErrors.forbidden();
    }
    console.error('Error creating payment:', error);
    return ApiErrors.internalError();
  }
}
