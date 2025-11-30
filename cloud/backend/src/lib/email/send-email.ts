import { createTransporter, getFromAddress, isTestMode } from './nodemailer';
import * as reminder7Days from './templates/reminder-7days';
import * as reminder1Day from './templates/reminder-1day';
import nodemailer from 'nodemailer';

/**
 * Email sending functions using Nodemailer
 */

export interface EmailResult {
  sent: boolean;
  messageId: string;
  preview?: string; // Ethereal preview URL in test mode
}

/**
 * Send subscription reminder email
 *
 * @param params - Email parameters
 * @returns Email result with message ID and preview URL (if test mode)
 */
export async function sendSubscriptionReminder(params: {
  to: string;
  stationName: string;
  subscriptionDueDate: Date;
  type: '7-day' | '1-day';
  customMessage?: string;
}): Promise<EmailResult> {
  const { to, stationName, subscriptionDueDate, type, customMessage } = params;

  // Select template based on type
  const template = type === '7-day' ? reminder7Days : reminder1Day;

  const templateParams = {
    stationName,
    subscriptionDueDate,
    customMessage,
  };

  // Generate email content
  const subject = template.getSubject(templateParams);
  const htmlBody = template.getHtmlBody(templateParams);
  const textBody = template.getTextBody(templateParams);

  // Get transporter
  const transporter = await createTransporter();
  const from = getFromAddress();

  // Send email
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: textBody,
      html: htmlBody,
    });

    const result: EmailResult = {
      sent: true,
      messageId: info.messageId,
    };

    // Add preview URL if using Ethereal Email (test mode)
    if (isTestMode()) {
      result.preview = nodemailer.getTestMessageUrl(info) || undefined;
    }

    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send a test email to verify SMTP configuration
 *
 * @param to - Recipient email address
 * @param template - Template to use ('7-day' or '1-day')
 * @returns Email result
 */
export async function sendTestEmail(
  to: string,
  template: '7-day' | '1-day' = '7-day'
): Promise<EmailResult> {
  // Use dummy data for test
  const testDate = new Date();
  testDate.setDate(testDate.getDate() + (template === '7-day' ? 7 : 1));

  return sendSubscriptionReminder({
    to,
    stationName: 'Test Radio Station FM',
    subscriptionDueDate: testDate,
    type: template,
    customMessage: 'This is a test email to verify SMTP configuration.',
  });
}
