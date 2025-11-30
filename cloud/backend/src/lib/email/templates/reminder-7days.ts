/**
 * 7-Day Subscription Reminder Email Template
 */

export interface Reminder7DaysParams {
  stationName: string;
  subscriptionDueDate: Date;
  customMessage?: string;
}

export function getSubject(params: Reminder7DaysParams): string {
  return `Reminder: Your ${params.stationName} subscription expires in 7 days`;
}

export function getHtmlBody(params: Reminder7DaysParams): string {
  const { stationName, subscriptionDueDate, customMessage } = params;

  const formattedDate = subscriptionDueDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Reminder</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .alert-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #777;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📅 Subscription Reminder</h1>
  </div>

  <div class="content">
    <p>Hello,</p>

    <div class="alert-box">
      <strong>⚠️ Reminder:</strong> The subscription for <strong>${stationName}</strong> will expire in <strong>7 days</strong>.
    </div>

    <div class="info-box">
      <p><strong>Subscription Due Date:</strong> ${formattedDate}</p>
      <p>To ensure uninterrupted service for your radio station, please make your payment before this date.</p>
    </div>

    ${customMessage ? `<p>${customMessage}</p>` : ''}

    <p>If you have already made the payment, please disregard this reminder. Otherwise, please contact your account manager to process the renewal.</p>

    <p><strong>What happens if the subscription expires?</strong></p>
    <ul>
      <li>Your radio station will be temporarily suspended</li>
      <li>Mobile apps will show a "temporarily unavailable" message</li>
      <li>Streaming services will be interrupted</li>
      <li>Your schedule and analytics data will be preserved</li>
    </ul>

    <p>Thank you for using our platform to power your radio station!</p>

    <p>Best regards,<br>
    <strong>Radio Streaming Platform Team</strong></p>
  </div>

  <div class="footer">
    <p>This is an automated reminder. Please do not reply to this email.</p>
    <p>&copy; ${new Date().getFullYear()} Radio Streaming Platform. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

export function getTextBody(params: Reminder7DaysParams): string {
  const { stationName, subscriptionDueDate, customMessage } = params;

  const formattedDate = subscriptionDueDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
SUBSCRIPTION REMINDER - 7 DAYS

Hello,

This is a reminder that the subscription for ${stationName} will expire in 7 days.

Subscription Due Date: ${formattedDate}

To ensure uninterrupted service for your radio station, please make your payment before this date.

${customMessage ? customMessage + '\n\n' : ''}

If you have already made the payment, please disregard this reminder. Otherwise, please contact your account manager to process the renewal.

What happens if the subscription expires?
- Your radio station will be temporarily suspended
- Mobile apps will show a "temporarily unavailable" message
- Streaming services will be interrupted
- Your schedule and analytics data will be preserved

Thank you for using our platform to power your radio station!

Best regards,
Radio Streaming Platform Team

---
This is an automated reminder. Please do not reply to this email.
© ${new Date().getFullYear()} Radio Streaming Platform. All rights reserved.
  `.trim();
}
