import { NextResponse } from "next/server";
import { amadeusService } from "@/lib/amadeus";
import { parseISODuration } from "@/lib/utils";

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      class: travelClass,
      currency,
      maxPrice,
    } = body;

    if (process.env.USE_REAL_FLIGHT_API === "true") {
      const amadeusResponse = await amadeusService.searchFlights({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        returnDate,
        adults,
        children,
        infants,
        travelClass,
        currencyCode: currency,
        maxPrice,
        max: 250,
        nonStop: false,
      });

      // Add console.log to see the raw response
      console.log(
        "Amadeus Raw Response:",
        JSON.stringify(amadeusResponse, null, 2)
      );

      // Transform Amadeus response to match our frontend format
      const transformedFlights = amadeusResponse.data.map((offer: any) => {
        // Log individual offer for debugging
        console.log("Processing offer:", JSON.stringify(offer, null, 2));

        const { hours, minutes } = parseISODuration(
          offer.itineraries[0].duration
        );
        const durationInMinutes = hours * 60 + minutes;

        return {
          id: offer.id,
          airline: offer.validatingAirlineCodes[0],
          flightNumber: offer.itineraries[0].segments[0].number,
          origin: offer.itineraries[0].segments[0].departure.iataCode,
          destination: offer.itineraries[0].segments[0].arrival.iataCode,
          departureTime: new Date(
            offer.itineraries[0].segments[0].departure.at
          ).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          arrivalTime: new Date(
            offer.itineraries[0].segments[0].arrival.at
          ).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          price: parseFloat(offer.price.total),
          duration: durationInMinutes, // Now passing minutes as a number
          status: "SCHEDULED", // Amadeus doesn't provide real-time status
          aircraft: offer.itineraries[0].segments[0].aircraft.code,
          terminal: {
            departure:
              offer.itineraries[0].segments[0].departure.terminal || "-",
            arrival: offer.itineraries[0].segments[0].arrival.terminal || "-",
          },
        };
      });

      // Log transformed flights
      console.log(
        "Transformed Flights:",
        JSON.stringify(transformedFlights, null, 2)
      );

      return NextResponse.json(transformedFlights);
    }

    // Fallback to mock data if USE_REAL_FLIGHT_API is false
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

// Keep the existing generateMockFlights function as fallback
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
