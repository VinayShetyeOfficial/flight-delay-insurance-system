interface BookingDetails {
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  insurance: {
    coverageType: string;
    terms: string;
    price: number;
  };
}

export function bookingConfirmationTemplate(booking: BookingDetails) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .booking-details, .insurance-details, .price-breakdown {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .total {
            font-size: 1.2em;
            font-weight: bold;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmation</h1>
            <p>Thank you for booking with us!</p>
          </div>

          <div class="booking-details">
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
