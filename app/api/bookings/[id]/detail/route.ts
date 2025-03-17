import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Change from default import to named import

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
