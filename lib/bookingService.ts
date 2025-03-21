import { prisma } from "@/lib/prisma";
import { BookingStatus, PaymentStatus, PassengerType } from "@prisma/client";

export async function createCompleteBooking(userId: string, bookingData: any) {
  try {
    // Extract data from the booking payload
    const { flight, passengers, addons, insurance, priceBreakdown } =
      bookingData;

    // Detailed validation
    if (!flight) throw new Error("Flight data is missing");
    if (!flight.segments?.length)
      throw new Error("Flight segments are missing");
    if (!passengers?.length) throw new Error("Passenger data is missing");
    if (!priceBreakdown) throw new Error("Price breakdown is missing");
    if (!userId) throw new Error("User ID is missing");

    console.log("Validation passed, creating booking with data:", {
      userId,
      flightId: flight.id,
      passengerCount: passengers.length,
      addonsCount: addons?.length || 0,
      hasInsurance: !!insurance,
    });

    // Create the main booking record using transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId: userId,
          price: Number(flight.price) || 0,
          totalPrice: Number(priceBreakdown.totalPrice) || 0,
          currency: flight.currency || "USD",
          status: "CONFIRMED" as BookingStatus,
          cabinClass: flight.cabinClass || "ECONOMY",
          totalDuration: Number(flight.totalDuration) || 0,
          layoverTimes: Array.isArray(flight.layoverTimes)
            ? flight.layoverTimes
            : [],
          insuranceType: insurance || null,

          // Create payment record
          payment: {
            create: {
              amount: Number(priceBreakdown.totalPrice) || 0,
              currency: priceBreakdown.currency || "USD",
              status: "COMPLETED" as PaymentStatus,
              paymentMethod: "CARD",
            },
          },

          // Create insurance record if selected
          insurance: insurance
            ? {
                create: {
                  coverageType: insurance,
                  packageType: insurance,
                  price: Number(priceBreakdown.insurancePrice) || 0,
                  terms: "Standard Terms Apply",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              }
            : undefined,

          // Create passengers
          passengers: {
            create: passengers.map((passenger: any) => ({
              firstName: passenger.firstName || "",
              lastName: passenger.lastName || "",
              dateOfBirth: new Date(passenger.dateOfBirth),
              gender: passenger.gender || "OTHER",
              passportNumber: passenger.passportNumber || null,
              nationality: passenger.nationality || null,
              email: passenger.email || null,
              phone: passenger.phone || null,
              specialRequests: passenger.specialRequests || null,
              passengerType: (passenger.type || "ADULT") as PassengerType,
            })),
          },

          // Create flight segments
          flights: {
            create: flight.segments.map((segment: any) => ({
              airlineCode: segment.airlineCode || "",
              airline: segment.airline || "",
              flightNumber: segment.flightNumber || "",
              departureTime: new Date(segment.departureDatetime),
              arrivalTime: new Date(segment.arrivalDatetime),
              origin: segment.origin || "",
              destination: segment.destination || "",
              originTerminal: segment.terminal?.departure || null,
              destTerminal: segment.terminal?.arrival || null,
              duration: Number(segment.duration) || 0,
              price: Number(flight.price) / flight.segments.length,
              currency: flight.currency || "USD",
              isLayover: Boolean(flight.isLayover),
              layoverDuration: Number(segment.layoverDuration) || null,
              status: segment.status || "SCHEDULED",
              aircraft: segment.aircraft || {},
              amenities: segment.amenities || {},
              baggage: segment.baggage || {},
              originDetails: segment.originDetails || {},
              destinationDetails: segment.destinationDetails || {},
            })),
          },

          // Create add-ons if any
          addOns: addons?.length
            ? {
                create: addons.map((addon: string) => ({
                  name: addon || "",
                  type: addon || "",
                  price: Number(priceBreakdown.addOnsPrices?.[addon]) || 0,
                  currency: priceBreakdown.currency || "USD",
                  description: `${(addon || "")
                    .split("-")
                    .join(" ")
                    .toUpperCase()} Service`,
                })),
              }
            : undefined,
        },
        include: {
          passengers: true,
          flights: true,
          addOns: true,
          insurance: true,
          payment: true,
        },
      });

      console.log("Booking created successfully:", newBooking.id);
      return newBooking;
    });

    return booking;
  } catch (error) {
    console.error("Detailed error in createCompleteBooking:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}
