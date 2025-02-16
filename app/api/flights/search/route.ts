import { NextResponse } from "next/server";

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
}

// Mock flight data generator
const generateMockFlights = (params: FlightSearchParams) => {
  const airlines = [
    "American Airlines",
    "United Airlines",
    "Delta Air Lines",
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
    });
  }

  // Sort by departure time
  return flights.sort((a, b) => {
    return (
      new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
    );
  });
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, departureDate } = body;

    // Generate mock flights instead of calling the real API
    const mockFlights = generateMockFlights({
      origin,
      destination,
      departureDate,
    });

    return NextResponse.json(mockFlights);
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flights" },
      { status: 500 }
    );
  }
}
