import { NextRequest } from 'next/server';
import { validateAdminSession } from '@/lib/auth-session';
import { successResponse, ApiErrors } from '@/lib/api-response';

/**
 * GET /api/admin/emails/templates
 * List available email templates with metadata
 */
export async function GET(request: NextRequest) {
  try {
    // Validate admin session
    await validateAdminSession();

    const templates = [
      {
        id: '7-day',
        name: '7-Day Subscription Reminder',
        description: 'Sent 7 days before subscription expires',
        type: 'reminder',
        urgency: 'medium',
        fields: [
          { name: 'stationName', type: 'string', required: true },
          { name: 'subscriptionDueDate', type: 'date', required: true },
          { name: 'customMessage', type: 'string', required: false },
        ],
        preview: {
          subject: 'Reminder: Your [Station Name] subscription expires in 7 days',
          highlights: [
            'Friendly reminder tone',
            'Clear expiration date',
            'Information about consequences',
            'Customizable message support',
          ],
        },
      },
      {
        id: '1-day',
        name: '1-Day Urgent Subscription Reminder',
        description: 'Sent 1 day before subscription expires',
        type: 'reminder',
        urgency: 'high',
        fields: [
          { name: 'stationName', type: 'string', required: true },
          { name: 'subscriptionDueDate', type: 'date', required: true },
          { name: 'customMessage', type: 'string', required: false },
        ],
        preview: {
          subject: '⚠️ URGENT: Your [Station Name] subscription expires TOMORROW',
          highlights: [
            'Urgent tone with clear warning',
            'Emphasizes immediate action needed',
            'Lists consequences of non-payment',
            'Red color scheme for urgency',
          ],
        },
      },
    ];

    return successResponse({
      templates,
      total: templates.length,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return ApiErrors.unauthorized();
    }
    if (error.message === 'FORBIDDEN') {
      return ApiErrors.forbidden();
    }
    console.error('Error getting email templates:', error);
    return ApiErrors.internalError();
  }
}
