import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingData = await req.json();

    // Create booking record with all related data
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        status: "CONFIRMED",
        bookingReference: generateBookingReference(),
        totalAmount: bookingData.flight.pricing.totalPrice,
        currency: bookingData.flight.pricing.currency,

        // Create flight segments
        flightSegments: {
          create: bookingData.flight.segments.map((segment: any) => ({
            airline: segment.airline.name,
            airlineCode: segment.airline.code,
            flightNumber: segment.flightNumber,
            aircraft: segment.aircraft.type,
            aircraftCode: segment.aircraft.code,
            origin: segment.origin,
            destination: segment.destination,
            departureTime: new Date(segment.departureTime),
            arrivalTime: new Date(segment.arrivalTime),
            cabin: bookingData.flight.class,
            terminal: segment.terminal,
          })),
        },

        // Create passengers
        passengers: {
          create: bookingData.passengers.map((passenger: any) => ({
            firstName: passenger.firstName,
            lastName: passenger.lastName,
            dateOfBirth: new Date(passenger.dateOfBirth),
            gender: passenger.gender,
            passportNumber: passenger.passportNumber,
            nationality: passenger.nationality,
            email: passenger.email,
            phone: passenger.phone,
            type: passenger.type,
          })),
        },

        // Create addons
        addons: {
          create: bookingData.addons.map((addon: string) => ({
            type: addon,
          })),
        },

        // Add insurance if selected
        insurance: bookingData.insurance
          ? {
              create: {
                type: bookingData.insurance,
              },
            }
          : undefined,
      },
      include: {
        flightSegments: true,
        passengers: true,
        addons: true,
        insurance: true,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

function generateBookingReference(): string {
  return `BK${Date.now().toString(36).toUpperCase()}`;
}
