// bookingService.ts
import {
  PrismaClient,
  BookingStatus,
  PaymentStatus,
  PassengerType,
  Gender,
} from "@prisma/client";

const prisma = new PrismaClient();

// Client-side data interfaces

interface FlightSegmentData {
  airline: string;
  airlineCode?: string;
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureDatetime: string; // ISO string
  arrivalDatetime: string; // ISO string
  departureTime: string;
  arrivalTime: string;
  duration: number;
  terminal?: { departure: string; arrival: string };
  aircraft?: string;
  status?: string;
  baggage: any;
  amenities: any;
  originDetails: any;
  destinationDetails: any;
}

interface SelectedFlight {
  id: string;
  isLayover: boolean;
  price: number;
  totalPrice: number;
  currency: string;
  cabinClass: string;
  totalDuration: number;
  segments: FlightSegmentData[];
  layoverTimes: number[]; // from localStorage
  fullLocationDetails: Record<string, any>;
}

interface PassengerData {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  gender: string;
  passportNumber?: string;
  nationality?: string;
  email?: string;
  phone?: string;
  specialRequests?: string;
  type: string; // "ADULT", "CHILD", "INFANT"
}

interface PriceBreakdown {
  baseTicketPrice: number;
  addOnsTotal: number;
  insurancePrice: number;
  totalPrice: number;
  currency: string;
  addOnsPrices: Record<string, number>;
}

interface BookingData {
  passengers: PassengerData[];
  lastUpdated: string;
  selectedInsurance: string;
  priceBreakdown: PriceBreakdown;
}

interface CompleteBookingData {
  flight: SelectedFlight;
  passengers: PassengerData[];
  selectedInsurance: string;
  priceBreakdown: PriceBreakdown;
}

/**
 * createCompleteBooking
 *
 * Creates a Booking record in the Prisma database using the data
 * provided from localStorage.
 */
export async function createCompleteBooking(
  userId: string,
  completeBookingData: CompleteBookingData
) {
  const { flight, passengers, selectedInsurance, priceBreakdown } =
    completeBookingData;

  // Build Flight records using the provided segments.
  const flightRecords = flight.segments.map((segment) => ({
    airlineCode: segment.airlineCode || "",
    flightNumber: segment.flightNumber,
    cabinClass: flight.cabinClass,
    departureTime: new Date(segment.departureDatetime),
    arrivalTime: new Date(segment.arrivalDatetime),
    origin: segment.origin,
    destination: segment.destination,
    originTerminal: segment.terminal?.departure || null,
    destTerminal: segment.terminal?.arrival || null,
    duration: segment.duration,
    price: flight.price,
    currency: flight.currency,
    airline: segment.airline,
    amenities: segment.amenities,
    baggage: segment.baggage,
    destinationDetails: segment.destinationDetails,
    originDetails: segment.originDetails,
    isLayover: flight.isLayover,
    layoverDuration: null, // We are not recomputing individual layover durations.
    status: segment.status || "SCHEDULED",
    aircraft: segment.aircraft || undefined, // Store as a plain JSON value
  }));

  // Consolidate add‑on data into one JSON field.
  const addOnsData = priceBreakdown.addOnsPrices;

  // Create the Booking record with nested writes.
  const booking = await prisma.booking.create({
    data: {
      userId,
      price: priceBreakdown.baseTicketPrice,
      insuranceType: selectedInsurance || null,
      currency: priceBreakdown.currency,
      status: BookingStatus.CONFIRMED,
      totalPrice: priceBreakdown.totalPrice,
      cabinClass: flight.cabinClass,
      layoverTimes: flight.layoverTimes,
      totalDuration: flight.totalDuration,
      addOnsData: addOnsData,
      flights: {
        create: flightRecords,
      },
      passengers: {
        create: passengers.map((p) => ({
          passengerType: p.type as PassengerType,
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: new Date(p.dateOfBirth),
          gender: p.gender as Gender,
          passportNumber: p.passportNumber || null,
          nationality: p.nationality || null,
          specialRequests: p.specialRequests || null,
          email: p.email || null,
          phone: p.phone || null,
        })),
      },
      insurance: selectedInsurance
        ? {
            create: {
              coverageType: selectedInsurance,
              price: priceBreakdown.insurancePrice,
              terms: "",
              packageType: selectedInsurance,
            },
          }
        : undefined,
      payment: {
        create: {
          amount: priceBreakdown.totalPrice,
          currency: priceBreakdown.currency,
          status: PaymentStatus.COMPLETED,
          paymentMethod: "TEST",
        },
      },
    },
    include: {
      flights: true,
      passengers: true,
      insurance: true,
      payment: true,
    },
  });

  return booking;
}
