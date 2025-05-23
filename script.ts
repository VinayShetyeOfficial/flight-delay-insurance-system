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

// ================ DELETE ALL RECORDS =================
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient({
//   datasources: {
//     db: {
//       url: process.env.DATABASE_URL,
//     },
//   },
//   log: ["query", "info", "warn", "error"],
// });

// async function resetDatabase() {
//   try {
//     // Test connection first
//     await prisma.$connect();
//     console.log("✅ Database connection successful");

//     // Delete all records from all tables in the correct order to handle foreign key constraints
//     await prisma.$transaction([
//       prisma.verificationToken.deleteMany(),
//       prisma.session.deleteMany(),
//       prisma.passwordReset.deleteMany(),
//       prisma.payment.deleteMany(),
//       prisma.passenger.deleteMany(),
//       prisma.insurance.deleteMany(),
//       prisma.claim.deleteMany(),
//       prisma.booking.deleteMany(),
//       prisma.flight.deleteMany(),
//       prisma.account.deleteMany(),
//       prisma.user.deleteMany(),
//     ]);

//     console.log("✅ Database reset successful");
//   } catch (error) {
//     console.error("❌ Error details:", error);

//     // Check if it's a connection error
//     if (error.message.includes("Can't reach database server")) {
//       console.error("\n🔍 Troubleshooting steps:");
//       console.error("1. Check if your DATABASE_URL in .env is correct");
//       console.error(
//         "2. Verify if your IP is whitelisted in Supabase dashboard"
//       );
//       console.error("3. Ensure your database is online in Supabase");
//       console.error(
//         "4. Check if you can connect using psql or another SQL client"
//       );
//     }
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// resetDatabase();
