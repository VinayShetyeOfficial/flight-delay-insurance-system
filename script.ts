import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get all Accounts
  const accounts = await prisma.account.findMany();
  console.log("\nAccounts:", accounts);

  // Get all Users
  const users = await prisma.user.findMany();
  console.log("\nUsers:", users);

  // Get all Bookings with related data
  const bookings = await prisma.booking.findMany({
    include: {
      flights: true,
      passengers: true,
      payment: true,
      insurance: true,
      user: true,
    },
  });
  console.log("\nBookings:", JSON.stringify(bookings, null, 2));

  // Get all Flights
  const flights = await prisma.flight.findMany();
  console.log("\nFlights:", flights);

  // Get all Passengers
  const passengers = await prisma.passenger.findMany();
  console.log("\nPassengers:", passengers);

  // Get all Payments
  const payments = await prisma.payment.findMany();
  console.log("\nPayments:", payments);

  // Get all Insurance records
  const insurance = await prisma.insurance.findMany();
  console.log("\nInsurance:", insurance);

  // Get all Claims
  const claims = await prisma.claim.findMany();
  console.log("\nClaims:", claims);

  // Get all Sessions
  const sessions = await prisma.session.findMany();
  console.log("\nSessions:", sessions);

  // Get all PasswordResets
  const passwordResets = await prisma.passwordReset.findMany();
  console.log("\nPasswordResets:", passwordResets);

  // Get all VerificationTokens
  const verificationTokens = await prisma.verificationToken.findMany();
  console.log("\nVerificationTokens:", verificationTokens);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
