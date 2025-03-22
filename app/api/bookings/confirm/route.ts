import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookingData = await req.json();

    // Create booking with all related data in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create the main booking record
      const booking = await tx.booking.create({
        data: {
          userId: session.user.id,
          status: "CONFIRMED",
          ...bookingData.pricing,
          flight: {
            create: bookingData.search,
          },
          passengers: {
            createMany: {
              data: bookingData.passengers,
            },
          },
          addOns:
            bookingData.addons.length > 0
              ? {
                  createMany: {
                    data: bookingData.addons,
                  },
                }
              : undefined,
          insurance: bookingData.insurance
            ? {
                create: bookingData.insurance,
              }
            : undefined,
        },
        include: {
          flight: true,
          passengers: true,
          addOns: true,
          insurance: true,
        },
      });

      return booking;
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error confirming booking:", error);
    return NextResponse.json(
      { error: "Failed to confirm booking" },
      { status: 500 }
    );
  }
}
