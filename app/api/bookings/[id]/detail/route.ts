import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Change from default import to named import
// Make sure ethers is installed: npm install ethers
import { ethers } from "ethers";
import contractJson from "@/lib/contracts/FlightDelayInsurance.json";

// GET /api/bookings/[id]/detail
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const bookingId = params.id;

  // Fetch the booking by ID, including related data
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        flights: true,
        passengers: true,
        payment: true,
        insurance: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error("Error fetching booking detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking details" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const bookingId = params.id;

  try {
    // Fetch the booking and insurance info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { insurance: true, user: true },
    });
    if (!booking || !booking.insurance) {
      return NextResponse.json(
        { error: "Booking or insurance not found" },
        { status: 404 }
      );
    }

    // Setup ethers provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const adminWallet = new ethers.Wallet(
      process.env.ADMIN_PRIVATE_KEY,
      provider
    );
    const contract = new ethers.Contract(
      process.env.FLIGHT_INSURANCE_CONTRACT_ADDRESS,
      contractJson.abi,
      adminWallet
    );

    // Call triggerPayout on the contract
    const tx = await contract.triggerPayout(bookingId);
    await tx.wait();

    return NextResponse.json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    console.error("Error triggering payout:", error);
    return NextResponse.json(
      { error: error.message || "Failed to trigger payout" },
      { status: 500 }
    );
  }
}
