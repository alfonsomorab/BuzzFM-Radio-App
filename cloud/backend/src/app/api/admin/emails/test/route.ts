import { NextRequest } from 'next/server';
import { validateAdminSession } from '@/lib/auth-session';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { sendTestEmail } from '@/lib/email';
import { z } from 'zod';

/**
 * POST /api/admin/emails/test
 * Send a test email to verify SMTP configuration
 */

const sendTestSchema = z.object({
  to: z.string().email(),
  template: z.enum(['7-day', '1-day']).default('7-day'),
});

export async function POST(request: NextRequest) {
  try {
    // Validate admin session
    await validateAdminSession();

    const body = await request.json();

    // Validate request body
    const validationResult = sendTestSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiErrors.validationError(validationResult.error.flatten().fieldErrors);
    }

    const { to, template } = validationResult.data;

    // Send test email
    try {
      const result = await sendTestEmail(to, template);

      return successResponse({
        sent: true,
        to,
        template,
        messageId: result.messageId,
        preview: result.preview, // Only present in test mode (Ethereal)
        message: result.preview
          ? `Test email sent successfully! Preview at: ${result.preview}`
          : 'Test email sent successfully!',
      });
    } catch (emailError: any) {
      console.error('Test email sending failed:', emailError);
      return ApiErrors.emailSendFailed(emailError.message || 'Unknown error');
    }
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return ApiErrors.unauthorized();
    }
    if (error.message === 'FORBIDDEN') {
      return ApiErrors.forbidden();
    }
    console.error('Error sending test email:', error);
    return ApiErrors.internalError();
  }
}
