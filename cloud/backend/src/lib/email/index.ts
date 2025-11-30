/**
 * Email service barrel export
 */

export { createTransporter, getFromAddress, isTestMode } from './nodemailer';
export { sendSubscriptionReminder, sendTestEmail } from './send-email';
export type { EmailResult } from './send-email';
