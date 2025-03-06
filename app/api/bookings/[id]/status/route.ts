import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const StatusUpdateSchema = z.object({
  status: z.enum(["INITIATED", "PAYMENT_PENDING", "CONFIRMED", "CANCELLED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookingId = params.id;
    const { status } = await req.json();

    // Validate status
    try {
      StatusUpdateSchema.parse({ status });
    } catch (validationError: any) {
      return NextResponse.json(
        { error: "Invalid status", details: validationError.errors },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
        userId: session.user.id, // Ensure booking belongs to user
      },
      data: { status },
      include: {
        flight: true,
        insurance: true,
        passengers: true,
        addOns: true,
        payment: true,
      },
    });

    console.log("Booking status updated:", updatedBooking.id, status);
    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  }
}
