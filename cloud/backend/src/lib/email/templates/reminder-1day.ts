/**
 * 1-Day Subscription Reminder Email Template
 */

export interface Reminder1DayParams {
  stationName: string;
  subscriptionDueDate: Date;
  customMessage?: string;
}

export function getSubject(params: Reminder1DayParams): string {
  return `⚠️ URGENT: Your ${params.stationName} subscription expires TOMORROW`;
}

export function getHtmlBody(params: Reminder1DayParams): string {
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
  <title>Urgent Subscription Reminder</title>
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
      background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
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
    .urgent-box {
      background: #ffebee;
      border-left: 4px solid #f44336;
      padding: 20px;
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
      background: #f44336;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .countdown {
      font-size: 36px;
      font-weight: bold;
      color: #f44336;
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚨 URGENT: Subscription Expiring</h1>
  </div>

  <div class="content">
    <p>Hello,</p>

    <div class="countdown">
      ⏰ 1 DAY LEFT
    </div>

    <div class="urgent-box">
      <strong>🚨 URGENT ACTION REQUIRED:</strong> The subscription for <strong>${stationName}</strong> will expire <strong>TOMORROW</strong>.
    </div>

    <div class="info-box">
      <p><strong>Subscription Expires:</strong> ${formattedDate}</p>
      <p><strong>Time remaining:</strong> Less than 24 hours</p>
      <p>Please make your payment immediately to avoid service interruption.</p>
    </div>

    ${customMessage ? `<p><strong>Important Message:</strong> ${customMessage}</p>` : ''}

    <p><strong>⚠️ What happens if payment is not received?</strong></p>
    <ul>
      <li><strong style="color: #f44336;">Your station will be automatically suspended tomorrow</strong></li>
      <li>All streaming services will stop immediately</li>
      <li>Mobile apps will display "Service Unavailable"</li>
      <li>Listeners will be unable to access your station</li>
    </ul>

    <p style="color: #f44336; font-weight: bold;">If you have already made the payment, please contact us immediately to confirm and avoid suspension.</p>

    <p>To process your renewal payment or if you have any questions, please contact your account manager as soon as possible.</p>

    <p>Best regards,<br>
    <strong>Radio Streaming Platform Team</strong></p>
  </div>

  <div class="footer">
    <p>This is an urgent automated reminder. Please take immediate action.</p>
    <p>&copy; ${new Date().getFullYear()} Radio Streaming Platform. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

export function getTextBody(params: Reminder1DayParams): string {
  const { stationName, subscriptionDueDate, customMessage } = params;

  const formattedDate = subscriptionDueDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
⚠️ URGENT: SUBSCRIPTION EXPIRING IN 1 DAY ⚠️

Hello,

** URGENT ACTION REQUIRED **

The subscription for ${stationName} will expire TOMORROW.

Subscription Expires: ${formattedDate}
Time Remaining: Less than 24 hours

Please make your payment immediately to avoid service interruption.

${customMessage ? 'Important Message: ' + customMessage + '\n\n' : ''}

⚠️ What happens if payment is not received?
- Your station will be automatically suspended tomorrow
- All streaming services will stop immediately
- Mobile apps will display "Service Unavailable"
- Listeners will be unable to access your station

If you have already made the payment, please contact us immediately to confirm and avoid suspension.

To process your renewal payment or if you have any questions, please contact your account manager as soon as possible.

Best regards,
Radio Streaming Platform Team

---
This is an urgent automated reminder. Please take immediate action.
© ${new Date().getFullYear()} Radio Streaming Platform. All rights reserved.
  `.trim();
}
