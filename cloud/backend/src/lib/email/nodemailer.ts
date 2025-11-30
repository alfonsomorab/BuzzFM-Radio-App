import nodemailer, { Transporter } from 'nodemailer';

/**
 * Nodemailer SMTP Configuration
 *
 * Creates a transporter for sending emails via SMTP.
 * In development, falls back to Ethereal Email (test SMTP service) if no SMTP credentials provided.
 */

let transporter: Transporter | null = null;

/**
 * Create and configure nodemailer transporter
 * Uses environment variables for SMTP configuration
 * Falls back to Ethereal Email in development mode if SMTP vars are missing
 */
export async function createTransporter(): Promise<Transporter> {
  // Return cached transporter if already created
  if (transporter) {
    return transporter;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  // Check if all required SMTP credentials are provided
  if (smtpHost && smtpPort && smtpUser && smtpPassword) {
    // Production/configured SMTP
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    console.log('Nodemailer: Using configured SMTP server');
  } else {
    // Development mode - use Ethereal Email (test SMTP)
    console.warn('Nodemailer: SMTP credentials not configured, using Ethereal Email for testing');

    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('Nodemailer: Ethereal Email test account created');
    console.log('  User:', testAccount.user);
    console.log('  Pass:', testAccount.pass);
  }

  // Verify transporter connection
  try {
    await transporter.verify();
    console.log('Nodemailer: Transporter ready to send emails');
  } catch (error) {
    console.error('Nodemailer: Transporter verification failed:', error);
    throw new Error('Failed to initialize email transporter');
  }

  return transporter;
}

/**
 * Get the configured "from" address for emails
 */
export function getFromAddress(): string {
  return process.env.SMTP_FROM || 'Radio Platform <noreply@radioplatform.com>';
}

/**
 * Check if we're using Ethereal Email (test mode)
 */
export function isTestMode(): boolean {
  return !process.env.SMTP_HOST;
}
