import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Payment update schema
const PaymentUpdateSchema = z.object({
  paymentMethod: z.string(),
  status: z.enum(["COMPLETED", "FAILED"]),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookingId = params.id;
    const paymentData = await req.json();

    // Validate payment data
    try {
      PaymentUpdateSchema.parse(paymentData);
    } catch (validationError: any) {
      return NextResponse.json(
        { error: "Invalid payment data", details: validationError.errors },
        { status: 400 }
      );
    }

    // Update booking and payment status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify booking exists and belongs to user
      const booking = await tx.booking.findFirst({
        where: {
          id: bookingId,
          userId: session.user.id,
        },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      // 2. Update payment status
      const payment = await tx.payment.update({
        where: { bookingId },
        data: {
          status: paymentData.status,
          paymentMethod: paymentData.paymentMethod,
          updatedAt: new Date(),
        },
      });

      // 3. Update booking status based on payment status
      const booking_status =
        paymentData.status === "COMPLETED" ? "CONFIRMED" : "PAYMENT_FAILED";
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: booking_status },
        include: {
          flight: true,
          insurance: true,
          passengers: true,
          addOns: true,
          payment: true,
        },
      });

      return { booking: updatedBooking, payment };
    });

    console.log("Payment processed:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
