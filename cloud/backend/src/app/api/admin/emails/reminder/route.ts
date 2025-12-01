import { NextRequest } from 'next/server';
import { db } from '@/db';
import { radioStations } from '@/db/schema';
import { validateAdminSession } from '@/lib/auth-session';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { sendSubscriptionReminder } from '@/lib/email';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * POST /api/admin/emails/reminder
 * Send subscription reminder email to a station
 */

const sendReminderSchema = z.object({
  stationId: z.string().uuid(),
  type: z.enum(['7-day', '1-day']),
  customMessage: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate admin session
    await validateAdminSession();

    const body = await request.json();

    // Validate request body
    const validationResult = sendReminderSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiErrors.validationError(validationResult.error.flatten().fieldErrors);
    }

    const { stationId, type, customMessage } = validationResult.data;

    // Fetch station details
    const [station] = await db
      .select()
      .from(radioStations)
      .where(eq(radioStations.id, stationId))
      .limit(1);

    if (!station) {
      return ApiErrors.stationNotFound();
    }

    // Validate station has contact email
    if (!station.contactEmail) {
      return ApiErrors.badRequest('Station does not have a contact email configured');
    }

    // Validate station has subscription due date
    if (!station.subscriptionDueDate) {
      return ApiErrors.badRequest('Station does not have a subscription due date configured');
    }

    // Send email
    try {
      const result = await sendSubscriptionReminder({
        to: station.contactEmail,
        stationName: station.name,
        subscriptionDueDate: new Date(station.subscriptionDueDate),
        type,
        customMessage,
      });

      return successResponse({
        sent: true,
        to: station.contactEmail,
        subject: `${type === '7-day' ? 'Reminder' : 'URGENT'}: ${station.name} subscription reminder`,
        messageId: result.messageId,
        preview: result.preview, // Only present in test mode (Ethereal)
      });
    } catch (emailError: any) {
      console.error('Email sending failed:', emailError);
      return ApiErrors.emailSendFailed(emailError.message || 'Unknown error');
    }
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return ApiErrors.unauthorized();
    }
    if (error.message === 'FORBIDDEN') {
      return ApiErrors.forbidden();
    }
    console.error('Error sending reminder email:', error);
    return ApiErrors.internalError();
  }
}
