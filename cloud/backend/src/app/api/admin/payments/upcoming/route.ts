import { NextRequest } from 'next/server';
import { db } from '@/db';
import { radioStations, payments } from '@/db/schema';
import { validateAdminSession } from '@/lib/auth-session';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { and, lte, gte, eq, desc, sql } from 'drizzle-orm';

/**
 * GET /api/admin/payments/upcoming
 * Get stations with upcoming subscription renewals
 */
export async function GET(request: NextRequest) {
  try {
    // Validate admin session
    await validateAdminSession();

    const { searchParams } = new URL(request.url);

    // Get days parameter (default 30, max 365)
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 365);

    // Calculate date range
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    // Find stations expiring within the date range
    const expiringStations = await db
      .select({
        id: radioStations.id,
        name: radioStations.name,
        contactEmail: radioStations.contactEmail,
        subscriptionDueDate: radioStations.subscriptionDueDate,
        lastPaymentDate: radioStations.lastPaymentDate,
        status: radioStations.status,
      })
      .from(radioStations)
      .where(
        and(
          lte(radioStations.subscriptionDueDate, futureDateStr),
          gte(radioStations.subscriptionDueDate, todayStr)
        )
      )
      .orderBy(radioStations.subscriptionDueDate);

    // Get last payment info for each station
    const stationsWithPaymentInfo = await Promise.all(
      expiringStations.map(async (station) => {
        // Get last payment
        const [lastPayment] = await db
          .select({
            amount: payments.amount,
            paymentDate: payments.paymentDate,
          })
          .from(payments)
          .where(eq(payments.stationId, station.id))
          .orderBy(desc(payments.paymentDate))
          .limit(1);

        // Calculate days until expiry
        const dueDate = new Date(station.subscriptionDueDate!);
        const daysUntilExpiry = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: station.id,
          name: station.name,
          contactEmail: station.contactEmail,
          subscriptionDueDate: station.subscriptionDueDate,
          daysUntilExpiry,
          status: station.status,
          lastPaymentDate: lastPayment?.paymentDate || station.lastPaymentDate,
          lastPaymentAmount: lastPayment?.amount || null,
        };
      })
    );

    // Sort by days until expiry (ascending)
    stationsWithPaymentInfo.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    // Calculate summary
    const expiringSoon = stationsWithPaymentInfo.filter((s) => s.daysUntilExpiry <= 7).length;
    const needsAttention = stationsWithPaymentInfo.filter(
      (s) => s.daysUntilExpiry > 7 && s.daysUntilExpiry <= 30
    ).length;

    return successResponse({
      stations: stationsWithPaymentInfo,
      summary: {
        totalStations: stationsWithPaymentInfo.length,
        expiringSoon, // within 7 days
        needsAttention, // 8-30 days
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return ApiErrors.unauthorized();
    }
    if (error.message === 'FORBIDDEN') {
      return ApiErrors.forbidden();
    }
    console.error('Error getting upcoming renewals:', error);
    return ApiErrors.internalError();
  }
}
