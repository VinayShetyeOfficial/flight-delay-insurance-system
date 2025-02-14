import { NextResponse } from "next/server";

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, departureDate } = body;

    if (process.env.USE_REAL_FLIGHT_API === "false") {
      const mockFlights = generateMockFlights({
        origin,
        destination,
        departureDate,
      });
      return NextResponse.json(mockFlights);
    }

    // Format date to YYYY-MM-DD
    const formattedDate = new Date(departureDate).toISOString().split("T")[0];

    // Construct API URL with parameters
    const apiUrl = new URL("https://api.aviationstack.com/v1/flights");
    const params = {
      access_key: process.env.FLIGHT_API_KEY || "",
      dep_iata: origin,
      arr_iata: destination,
      flight_date: formattedDate,
      limit: "10",
    };

    // Add parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      apiUrl.searchParams.append(key, value);
    });

    console.log("Fetching flights from:", apiUrl.toString());

    const response = await fetch(apiUrl.toString());
    const data = await response.json();

    // Log the raw API response to help understand the structure
    console.log("Aviation Stack API Response:", JSON.stringify(data, null, 2));

    if (data.error) {
      throw new Error(data.error.message || "Failed to fetch flights");
    }

    // Transform the API response to match our frontend expectations
    const transformedFlights = data.data.map((flight: any) => ({
      id: flight.flight.number,
      airline: flight.airline.name,
      flightNumber: flight.flight.iata,
      origin: `${flight.departure.airport} (${flight.departure.iata})`,
      destination: `${flight.arrival.airport} (${flight.arrival.iata})`,
      departureTime: new Date(flight.departure.scheduled).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      ),
      arrivalTime: new Date(flight.arrival.scheduled).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      ),
      price: Math.floor(Math.random() * (800 - 200) + 200), // Still using random price as API doesn't provide it
      duration:
        flight.flight.duration ||
        Math.floor(
          (new Date(flight.arrival.scheduled).getTime() -
            new Date(flight.departure.scheduled).getTime()) /
            60000
        ),
      status: flight.flight_status,
      aircraft: flight.aircraft?.icao || "Information not available",
      terminal: {
        departure: flight.departure.terminal || "-",
        arrival: flight.arrival.terminal || "-",
      },
    }));

    // Log the transformed flights data
    console.log(
      "Transformed Flights Data:",
      JSON.stringify(transformedFlights, null, 2)
    );

    return NextResponse.json(transformedFlights);
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flights" },
      { status: 500 }
    );
  }
}

// Keep the existing generateMockFlights function as fallback
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
