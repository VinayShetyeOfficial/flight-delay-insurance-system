interface ClaimDetails {
  id: string;
  booking: {
    flightNumber: string;
  };
  delayDuration: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export function bookingConfirmationTemplate(booking: any) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
          }
          .content {
            padding: 20px 0;
          }
          .flight-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .insurance-details {
            background-color: #e8f4ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .price-breakdown {
            margin: 20px 0;
            border-top: 1px solid #f0f0f0;
            padding-top: 20px;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #f0f0f0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #0070f3;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Booking Confirmation</h1>
          <p>Thank you for booking your flight with us!</p>
        </div>
        
        <div class="content">
          <div class="flight-details">
            <h2>Flight Details</h2>
            <p><strong>Flight Number:</strong> ${booking.flightNumber}</p>
            <p><strong>From:</strong> ${booking.origin}</p>
            <p><strong>To:</strong> ${booking.destination}</p>
            <p><strong>Departure:</strong> ${booking.departureTime}</p>
            <p><strong>Arrival:</strong> ${booking.arrivalTime}</p>
          </div>

          <div class="insurance-details">
            <h2>Insurance Coverage</h2>
            <p><strong>Type:</strong> ${booking.insurance.coverageType}</p>
            <p><strong>Coverage Terms:</strong> ${booking.insurance.terms}</p>
          </div>

          <div class="price-breakdown">
            <h2>Price Breakdown</h2>
            <p>Flight: $${booking.price}</p>
            <p>Insurance: $${booking.insurance.price}</p>
            <p class="total">Total: $${
              booking.price + booking.insurance.price
            }</p>
          </div>

          <a href="${
            process.env.NEXTAUTH_URL
          }/dashboard" class="button">View Your Dashboard</a>
        </div>

        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 14px;">
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          <p>© ${new Date().getFullYear()} Flight Delay Insurance. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

export function insuranceClaimTemplate(claim: any) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Insurance Claim Received</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
          }
          .content {
            padding: 20px 0;
          }
          .claim-details {
            background-color: #fff3e0;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .status {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: bold;
            background-color: #ffebee;
            color: #d32f2f;
          }
          .status.approved {
            background-color: #e8f5e9;
            color: #2e7d32;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #0070f3;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Insurance Claim Update</h1>
          <p>We have received your insurance claim for flight delay.</p>
        </div>
        
        <div class="content">
          <div class="claim-details">
            <h2>Claim Details</h2>
            <p><strong>Claim ID:</strong> ${claim.id}</p>
            <p><strong>Flight:</strong> ${claim.booking.flightNumber}</p>
            <p><strong>Delay Duration:</strong> ${
              claim.delayDuration
            } minutes</p>
            <p><strong>Status:</strong> <span class="status ${claim.status.toLowerCase()}">${
    claim.status
  }</span></p>
          </div>

          <div style="margin-top: 20px;">
            <h2>Next Steps</h2>
            <p>Our team will review your claim and process it according to your insurance coverage terms. You will receive updates on the status of your claim via email.</p>
          </div>

          <a href="${
            process.env.NEXTAUTH_URL
          }/dashboard" class="button">View Claim Details</a>
        </div>

        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 14px;">
          <p>If you have any questions about your claim, please contact our support team.</p>
          <p>© ${new Date().getFullYear()} Flight Delay Insurance. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

export function otpEmailTemplate(otp: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify your email</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 36px; letter-spacing: 5px; color: #333;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </body>
    </html>
  `;
}

export const resetPasswordEmailTemplate = (resetUrl: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        padding: 20px;
        max-width: 600px;
        margin: 0 auto;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #0070f3;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 20px;
      }
      .button:link,
      .button:visited,
      .button:hover,
      .button:active {
        color: #ffffff !important;
      }
    </style>
  </head>
  <body>
    <h1>Reset Your Password</h1>
    <p>You requested to reset your password. Click the button below to set a new password:</p>
    <a href="${resetUrl}" class="button" style="color: #ffffff !important;">Reset Password</a>
    <p>This link will expire in 15 minutes.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p style="margin-top: 40px; color: #666; font-size: 14px;">
      © ${new Date().getFullYear()} Flight Delay Insurance. All rights reserved.
    </p>
  </body>
</html>
`;
