import { NextResponse } from "next/server";
import { amadeusService } from "@/lib/amadeus";
import { parseISODuration } from "@/lib/utils";

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
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
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      class: travelClass,
      currency = "USD",
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

      // Log the total number of flights
      console.log(`Total flights found: ${amadeusResponse.data.length}`);

      // Get unique airline codes from all flights
      const airlineCodes = Array.from(
        new Set(
          amadeusResponse.data.map(
            (offer: any) => offer.validatingAirlineCodes[0]
          )
        )
      );

      console.log(
        `Unique airline codes found: ${airlineCodes.length}`,
        airlineCodes
      );

      // Fetch all airline names at once
      const airlineCache = await amadeusService.batchGetAirlineDetails(
        airlineCodes
      );

      console.log("Airline name cache:", airlineCache);

      // Transform flights with cached airline names
      const transformedFlights = await Promise.all(
        amadeusResponse.data.map(async (offer: any) => {
          const airlineCode = offer.validatingAirlineCodes[0];
          const airlineName = airlineCache[airlineCode] || airlineCode;

          console.log(
            `Processing flight with airline: ${airlineCode} => ${airlineName}`
          );

          const { hours, minutes } = parseISODuration(
            offer.itineraries[0].duration
          );
          const durationInMinutes = hours * 60 + minutes;

          return {
            id: offer.id,
            airline: airlineName,
            airlineCode: airlineCode,
            flightNumber: offer.itineraries[0].segments[0].number,
            origin: offer.itineraries[0].segments[0].departure.iataCode,
            originCity: await amadeusService.getLocationDetails(
              offer.itineraries[0].segments[0].departure.iataCode
            ),
            destination: offer.itineraries[0].segments[0].arrival.iataCode,
            destinationCity: await amadeusService.getLocationDetails(
              offer.itineraries[0].segments[0].arrival.iataCode
            ),
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
            currency: offer.price.currency || currency,
          };
        })
      );

      // Verify all flights have airline names
      const missingAirlines = transformedFlights.filter(
        (flight) => flight.airline === flight.airlineCode
      );
      if (missingAirlines.length > 0) {
        console.warn(
          "Flights with missing airline names:",
          missingAirlines.map((f) => f.airlineCode)
        );
      }

      return NextResponse.json(transformedFlights);
    }

    // Generate 10-30 flights for variety
    const numberOfFlights = Math.floor(Math.random() * 20) + 10;
    const flights: FlightData[] = [];

    // Update the mock airlines array
    const airlines = [
      { code: "UA", name: "United Airlines" },
      { code: "AA", name: "American Airlines" },
      { code: "DL", name: "Delta Air Lines" },
      { code: "B6", name: "JetBlue Airways" },
      { code: "WN", name: "Southwest Airlines" },
      { code: "F9", name: "Frontier Airlines" },
    ];

    // Pre-fetch all airline names
    await amadeusService.batchGetAirlineDetails(
      airlines.map((airline) => airline.code)
    );

    for (let i = 0; i < numberOfFlights; i++) {
      // Generate departure time between 6 AM and 10 PM
      const departureHour = Math.floor(Math.random() * 16) + 6;
      const departureMinute = Math.floor(Math.random() * 60);
      const durationMinutes = Math.floor(Math.random() * 120) + 60; // 1-3 hours

      const departureTime = new Date(departureDate);
      departureTime.setHours(departureHour, departureMinute);

      const arrivalTime = new Date(
        departureTime.getTime() + durationMinutes * 60000
      );

      // Get city names
      const originCity = await amadeusService.getLocationDetails(origin);
      const destinationCity = await amadeusService.getLocationDetails(
        destination
      );

      const randomAirline =
        airlines[Math.floor(Math.random() * airlines.length)];

      flights.push({
        id: `FL${Math.floor(Math.random() * 9000) + 1000}`,
        airline: randomAirline.name,
        airlineCode: randomAirline.code,
        flightNumber: `${Math.floor(Math.random() * 9000) + 1000}`,
        origin: origin,
        originCity: originCity,
        destination: destination,
        destinationCity: destinationCity,
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
        status: "scheduled",
        aircraft: "Mock Aircraft",
        terminal: {
          departure: "Mock Terminal",
          arrival: "Mock Terminal",
        },
        currency: currency,
      });
    }

    // Sort flights by departure time and price
    flights.sort((a, b) => {
      // First sort by departure time
      const timeCompare =
        new Date(a.departureTime).getTime() -
        new Date(b.departureTime).getTime();

      // If departure times are equal, sort by price
      if (timeCompare === 0) {
        return a.price - b.price;
      }
      return timeCompare;
    });

    return NextResponse.json(flights);
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flights" },
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
      currency: currency,
    });
  }

  // Sort by departure time
  return flights.sort((a, b) => {
    return (
      new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
    );
  });
};
