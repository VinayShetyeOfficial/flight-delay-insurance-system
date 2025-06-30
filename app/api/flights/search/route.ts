import { NextResponse } from "next/server";
import { amadeusService } from "@/lib/amadeus";
import { parseISODuration } from "@/lib/utils";

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  nonStop: boolean;
}

// Add type for flight data
interface FlightData {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  duration: number;
  status: string;
  aircraft: string;
  terminal: {
    departure: string;
    arrival: string;
  };
  currency: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Extract all booking fields from the request body.
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      class: travelClass, // rename "class" to travelClass
      currency,
      nonStop,
    } = body;

    if (process.env.USE_REAL_FLIGHT_API === "true") {
      const flights = await amadeusService.searchFlights({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departureDate,
        returnDate: returnDate,
        adults: adults,
        children: children,
        infants: infants,
        travelClass: travelClass,
        nonStop: nonStop,
        currencyCode: currency,
      });

      // Filter flights based on nonStop parameter.
      const filteredFlights = nonStop
        ? flights.filter((flight) => !flight.isLayover)
        : flights;

      return NextResponse.json(filteredFlights);
    }

    // For mock data, generate appropriate flights.
    const flights = generateMockFlights({
      origin,
      destination,
      departureDate,
      nonStop, // Pass nonStop to mock generator.
    });

    return NextResponse.json(flights);
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      { error: "Failed to search flights" },
      { status: 500 }
    );
  }
}

// Update the generateMockFlights function
const generateMockFlights = (params: FlightSearchParams) => {
  const airlines = [
    "American Airlines",
    "United Airlines",
    "Delta Airlines",
    "JetBlue Airways",
    "Southwest Airlines",
  ];

  const aircraftTypes = [
    "Boeing 737",
    "Airbus A320",
    "Boeing 787",
    "Airbus A350",
  ];
  const terminals = ["A", "B", "C", "D"];
  const statuses = ["scheduled", "active", "delayed"];

  // Generate 5-10 random flights
  const numberOfFlights = Math.floor(Math.random() * 6) + 5;
  const flights = [];

  for (let i = 0; i < numberOfFlights; i++) {
    // Generate departure time between 6 AM and 10 PM
    const departureHour = Math.floor(Math.random() * 16) + 6;
    const departureMinute = Math.floor(Math.random() * 60);
    const durationMinutes = Math.floor(Math.random() * 120) + 60; // 1-3 hours

    const departureTime = new Date(params.departureDate);
    departureTime.setHours(departureHour, departureMinute);

    const arrivalTime = new Date(
      departureTime.getTime() + durationMinutes * 60000
    );

    flights.push({
      id: `FL${Math.floor(Math.random() * 9000) + 1000}`,
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      airlineCode: airlines[Math.floor(Math.random() * airlines.length)]
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" "),
      flightNumber: `${Math.floor(Math.random() * 9000) + 1000}`,
      origin: params.origin,
      destination: params.destination,
      departureTime: departureTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      arrivalTime: arrivalTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      price: Math.floor(Math.random() * (800 - 200) + 200),
      duration: durationMinutes,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      aircraft: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
      terminal: {
        departure: terminals[Math.floor(Math.random() * terminals.length)],
        arrival: terminals[Math.floor(Math.random() * terminals.length)],
      },
      currency: "USD",
    });
  }

  // Sort by departure time
  return flights.sort((a, b) => {
    return (
      new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
    );
  });
};
