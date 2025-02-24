import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Building2,
  Clock,
  Plane,
  MapPin,
  Info,
  Luggage,
  Wifi,
  Power,
  Coffee,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCurrencySymbol, formatDuration } from "@/lib/utils";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// This interface is used for each flight segment in a layover flight.
interface FlightSegment {
  airline: string;
  airlineCode?: string;
  flightNumber: string;
  origin: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  terminal?: {
    departure: string;
    arrival: string;
  };
  aircraft?: string;
  status?: string;
}

// The FlightCardProps now optionally include layover flight details and a searchId.
interface FlightCardProps {
  // For direct flights
  airline: string;
  airlineCode?: string;
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  price: number;
  status?: string;
  terminal?: {
    departure: string;
    arrival: string;
  };
  aircraft?: string;
  currency: string;
  onSelect?: () => void;
  // For layover flights (optional)
  segments?: FlightSegment[];
  layoverTime?: number; // in minutes
  totalPrice?: number;
  isLayover: boolean;
  searchId?: number; // new prop to indicate a new search
  baggage?: {
    includedCheckedBags: number;
    includedCabinBags: number;
    checkedBagWeight?: number | null;
    checkedBagWeightUnit?: string | null;
  };
  cabinClass?: string;
}

// Debug function for direct flights.
const debugDirectFlightInfo = (props: FlightCardProps) => {
  const output = `
╔════════════════════════════════════════════════════════════╗
║                ✈  FLIGHT SEARCH RESULTS  ✈               
╠════════════════════════════════════════════════════════════╣
║ Airline: ${props.airline} (${props.airlineCode || "N/A"})
║ Flight Number: ${props.flightNumber}
╠════════════════════════════════════════════════════════════╣
║ Origin: ${props.origin}       🛫  Departure: ${
    props.departureTime
  }      Terminal: ${props.terminal?.departure || "-"}
║ Destination: ${props.destination}  🛬  Arrival: ${
    props.arrivalTime
  }        Terminal: ${props.terminal?.arrival || "-"}
╠════════════════════════════════════════════════════════════╣
║ Duration: ${formatDuration(props.duration)}
║ Aircraft Type: ${props.aircraft || "N/A"}
╠════════════════════════════════════════════════════════════╣
║ Status: ${props.status || "SCHEDULED"}
║ Price: ${getCurrencySymbol(props.currency)}${props.price.toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  )}
╚════════════════════════════════════════════════════════════╝
`;
  console.log(output);
};

// Debug function for layover flights.
const debugLayoverFlightInfo = (props: FlightCardProps) => {
  if (!props.segments || props.segments.length < 2) {
    console.warn("Incomplete layover flight data provided for debug output.");
    return;
  }

  const segments = props.segments;
  const totalPrice = props.totalPrice || props.price;
  const layoverTime = props.layoverTime || 0;

  let output = `
╔════════════════════════════════════════════════════════════╗
║                ✈  LAYOVER FLIGHT DETAILS  ✈                
╠════════════════════════════════════════════════════════════╣
║ Total Journey Summary:
║ From: ${segments[0].origin} To: ${segments[segments.length - 1].destination}
║ Total Duration: ${formatDuration(
    segments.reduce((acc, seg) => acc + seg.duration, 0) + layoverTime
  )}
║ Total Price: ${getCurrencySymbol(props.currency)}${totalPrice.toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  )}
╠════════════════════════════════════════════════════════════╣`;

  segments.forEach((segment, index) => {
    output += `
║ SEGMENT ${index + 1}:
║ Airline: ${segment.airline} (${segment.airlineCode || "N/A"})
║ Flight: ${segment.flightNumber}
║ From: ${segment.origin}    🛫  ${segment.departureTime}    Terminal: ${
      segment.terminal?.departure || "-"
    }
║ To: ${segment.destination}    🛬  ${segment.arrivalTime}    Terminal: ${
      segment.terminal?.arrival || "-"
    }
║ Duration: ${formatDuration(segment.duration)}
║ Aircraft: ${segment.aircraft || "N/A"}
║ Status: ${segment.status || "SCHEDULED"}`;

    if (index < segments.length - 1) {
      output += `
╠════════════════════════════════════════════════════════════╣
║ LAYOVER AT ${segment.destination}:
║ Duration: ${formatDuration(layoverTime)}
║ Next Flight Departs: ${segments[index + 1].departureTime}
╠════════════════════════════════════════════════════════════╣`;
    }
  });

  output += `
╚════════════════════════════════════════════════════════════╝`;

  console.log(output);
};

const getFlightClassLabel = (cabinClass: string) => {
  switch (cabinClass) {
    case "ECONOMY":
      return "Economy Class";
    case "PREMIUM_ECONOMY":
      return "Premium Economy Class";
    case "BUSINESS":
      return "Business Class";
    case "FIRST":
      return "First Class";
    default:
      return cabinClass;
  }
};

// Add this helper function at the top of the component
const formatDurationHM = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  // If duration is 24 hours or more, show in days
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (remainingHours === 0) {
      return `${days} ${days === 1 ? "day" : "days"}`;
    }

    return `${days} ${days === 1 ? "day" : "days"} ${remainingHours}h`;
  }

  // For durations less than 24 hours
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

// Add these interfaces at the top
interface TravelPayoutsLocation {
  type: string;
  code: string;
  name: string;
  city_name?: string;
  main_airport_name?: string;
}

export default function FlightCard(props: FlightCardProps) {
  const lastLoggedSearchId = useRef<number | undefined>(undefined);

  // Add these states in the component
  const [locationDetails, setLocationDetails] = useState<{
    [key: string]: TravelPayoutsLocation;
  }>({});

  useEffect(() => {
    // Only log debug info if the searchId has changed.
    if (props.searchId !== lastLoggedSearchId.current) {
      if (
        props.segments &&
        props.segments.length >= 2 &&
        props.layoverTime !== undefined &&
        props.totalPrice !== undefined
      ) {
        debugLayoverFlightInfo(props);
      } else {
        debugDirectFlightInfo(props);
      }
      lastLoggedSearchId.current = props.searchId;
    }
  }, [props.searchId]);

  useEffect(() => {
    const fetchLocationDetails = async () => {
      const fetchDetails = async (iataCode: string) => {
        try {
          const response = await fetch(
            `https://autocomplete.travelpayouts.com/places2?locale=en&types[]=airport&types[]=city&term=${iataCode}`
          );
          const data = await response.json();

          // Try to find airport result first
          const airportResult = data.find(
            (item: any) => item.type === "airport"
          );
          if (airportResult) return airportResult;

          // If no airport found, try city result
          const cityResult = data.find((item: any) => item.type === "city");
          if (cityResult) return cityResult;

          return null;
        } catch (error) {
          console.error(`Error fetching details for ${iataCode}:`, error);
          return null;
        }
      };

      const newLocationDetails: { [key: string]: TravelPayoutsLocation } = {};

      // Handle both layover and direct flights
      if (props.isLayover && props.segments) {
        // Existing layover logic
        for (const segment of props.segments) {
          if (!newLocationDetails[segment.origin]) {
            const details = await fetchDetails(segment.origin);
            if (details) newLocationDetails[segment.origin] = details;
          }
          if (!newLocationDetails[segment.destination]) {
            const details = await fetchDetails(segment.destination);
            if (details) newLocationDetails[segment.destination] = details;
          }
        }
      } else {
        // Direct flight logic
        const originDetails = await fetchDetails(props.origin);
        if (originDetails) newLocationDetails[props.origin] = originDetails;

        const destDetails = await fetchDetails(props.destination);
        if (destDetails) newLocationDetails[props.destination] = destDetails;
      }

      setLocationDetails(newLocationDetails);
    };

    fetchLocationDetails();
  }, [props.isLayover, props.segments, props.origin, props.destination]);

  // Helper function to generate route string
  const getRouteString = (props: FlightCardProps) => {
    if (props.segments && props.segments.length > 1) {
      // For flights with layovers
      return `Route: ${props.segments.map((seg) => seg.origin).join(" → ")} → ${
        props.segments[props.segments.length - 1].destination
      }`;
    }
    // For direct flights
    return `Route: ${props.origin} → ${props.destination}`;
  };

  return (
    <Card className="overflow-hidden">
      {/* Header with custom radial gradient background */}
      <div
        className="px-6 py-4"
        style={{
          backgroundImage:
            "radial-gradient(circle 248px at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%)",
        }}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-[0_0_0_2px_#1500ff9c]">
              {props.airlineCode ? (
                <div className="relative">
                  <img
                    src={`https://content.airhex.com/content/logos/airlines_${props.airlineCode}_200_200_s.png`}
                    alt={`${props.airline} logo`}
                    className="h-[100%] w-[100%] object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement
                        ?.querySelector(".fallback-icon")
                        ?.classList.remove("hidden");
                    }}
                  />
                  <Plane className="h-6 w-6 text-blue-500 fallback-icon hidden absolute inset-0 m-auto" />
                </div>
              ) : (
                <Plane className="h-6 w-6 text-blue-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">
                  {props.airline}
                </h3>
                {/* {props.cabinClass && (
                  <span className="px-2 py-0.5 bg-[#000000a6] rounded-full text-xs uppercase font-medium">
                    {getFlightClassLabel(props.cabinClass)}
                  </span>
                )} */}
              </div>
              <p className="text-sm text-white/80">
                Flight {props.flightNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {getCurrencySymbol(props.currency)}
              {props.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-sm text-white/80">Ticket Price</p>
          </div>
        </div>
      </div>

      {/* Card Content - Now with its own padding */}
      <div className="p-6 space-y-6">
        {/* Flight Timeline */}
        <div className="grid grid-cols-[1fr,2fr,1fr] items-center gap-4">
          {/* Departure */}
          <div>
            <p className="text-2xl font-bold">{props.departureTime}</p>
            <p className="font-medium">({props.origin})</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Building2 className="h-3.5 w-3.5" />
              Terminal: {props.terminal?.departure || "D"}
            </div>
          </div>

          {/* Flight Path */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-full flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-zinc-900" />
              <div className="h-[2px] flex-1 bg-gradient-to-r from-zinc-900 to-zinc-500" />
              <div className="rounded-full bg-zinc-100 p-1">
                <Plane className="h-3.5 w-3.5 text-zinc-900 rotate-45" />
              </div>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-zinc-500 to-zinc-900" />
              <div className="h-2 w-2 rounded-full bg-zinc-900" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(props.duration)}
              {props.segments && props.segments.length > 1
                ? ` • ${props.segments.length - 1} ${
                    props.segments.length - 1 === 1 ? "Stop" : "Stops"
                  }`
                : " • Direct"}
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <p className="text-2xl font-bold">{props.arrivalTime}</p>
            <p className="font-medium">({props.destination})</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 justify-end">
              <Building2 className="h-3.5 w-3.5" />
              Terminal: {props.terminal?.arrival || "B"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 pt-4 border-t">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex flex-col text-sm text-muted-foreground">
              <div className="flex items-center gap-1 ">
                <MapPin className="h-3.5 w-3.5" />
                <p>{getRouteString(props)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Plane className="h-3.5 w-3.5" />
                <p>Aircraft: {props.aircraft || "Boeing 737"}</p>
              </div>
            </div>
            <Button onClick={props.onSelect} className="w-full md:w-auto px-8">
              Select Flight
            </Button>
          </div>

          {/* Flight Details Accordion */}
          <Accordion type="single" collapsible className="pt-2">
            <AccordionItem value="details" className="border-none">
              <AccordionTrigger className="flex items-center gap-2 text-sm py-2 [&[data-state=open]>svg]:rotate-180 justify-start group">
                <Info className="h-4 w-4" />
                <span className="group-hover:underline">Flight Details</span>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                {/* Top Row: Journey Overview and Amenities */}
                <div className="grid grid-cols-2 gap-x-8 text-sm mb-6">
                  {/* Journey Overview */}
                  <div>
                    <h4 className="font-medium mb-1.5">Journey Overview</h4>
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 shrink-0" />
                        {props.isLayover
                          ? `${props.segments?.length - 1} stop(s)`
                          : "Non-stop flight"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        Total duration: {formatDurationHM(props.duration)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {props.origin} ({props.originCity}) →{" "}
                        {props.destination} ({props.destinationCity})
                      </div>
                      {/* Only show baggage info if props.baggage exists */}
                      {props.baggage && (
                        <div className="flex items-center gap-2">
                          <Luggage className="h-4 w-4 shrink-0" />
                          {`${props.baggage.includedCheckedBags}x Checked Bag`}
                          {props.baggage.includedCabinBags > 0 &&
                            ` • ${props.baggage.includedCabinBags}x Cabin Bag`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Onboard Amenities */}
                  <div>
                    <h4 className="font-medium mb-1.5">Onboard Amenities</h4>
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 shrink-0" />
                        In-flight Wi-Fi
                      </div>
                      <div className="flex items-center gap-2">
                        <Power className="h-4 w-4 shrink-0" />
                        Power outlets
                      </div>
                      <div className="flex items-center gap-2">
                        <Coffee className="h-4 w-4 shrink-0" />
                        Complimentary meals
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flight Details Section */}
                <div className="space-y-4">
                  {props.isLayover ? (
                    // Existing layover segments mapping
                    props.segments?.map((segment, index) => (
                      <div
                        key={index}
                        className="border-[1px] border-gray-300 rounded-lg overflow-hidden bg-white shadow-[inset_0_0_2px_#00000015]"
                        style={{ borderStyle: "dashed" }}
                      >
                        {/* Segment Header - With new linear gradient */}
                        <div
                          className="px-4 py-3"
                          style={{
                            backgroundImage:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          }}
                        >
                          <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-[0_0_0_2px_#1500ff9c]">
                                <div className="relative">
                                  <img
                                    src={`https://content.airhex.com/content/logos/airlines_${segment.airlineCode}_200_200_s.png`}
                                    alt={`${segment.airline} logo`}
                                    className="h-[100%] w-[100%] object-contain"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.style.display = "none";
                                      e.currentTarget.parentElement
                                        ?.querySelector(".fallback-icon")
                                        ?.classList.remove("hidden");
                                    }}
                                  />
                                  <Plane className="h-4 w-4 text-blue-500 fallback-icon hidden absolute inset-0 m-auto" />
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-white">
                                  {segment.airline} {segment.flightNumber}
                                </span>
                                {props.cabinClass && (
                                  <span className="ml-2 px-2 py-0.5 bg-[#000000a6] rounded-full text-xs uppercase font-medium whitespace-nowrap">
                                    {getFlightClassLabel(props.cabinClass)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-white/80">
                              {formatDurationHM(segment.duration)}
                            </span>
                          </div>
                        </div>

                        {/* Segment Content */}
                        <div className="p-4">
                          {/* Origin and Destination with Flight Path */}
                          <div className="flex items-center justify-between text-muted-foreground">
                            <div>
                              <div className="font-semibold text-base">
                                {segment.origin} (
                                {locationDetails[segment.origin]?.type ===
                                "city"
                                  ? locationDetails[segment.origin]?.name
                                  : locationDetails[segment.origin]
                                      ?.city_name || segment.origin}
                                )
                              </div>
                            </div>

                            {/* Flight Path Visualization - Moved here */}
                            <div className="flex-1 mx-4">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-gray-400" />
                                <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-400 to-gray-300" />
                                <div className="rounded-full bg-gray-100 p-1">
                                  <Plane className="h-3.5 w-3.5 text-zinc-900 rotate-45" />
                                </div>
                                <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-300 to-gray-400" />
                                <div className="h-2 w-2 rounded-full bg-gray-400" />
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-semibold text-base">
                                {segment.destination} (
                                {locationDetails[segment.destination]?.type ===
                                "city"
                                  ? locationDetails[segment.destination]?.name
                                  : locationDetails[segment.destination]
                                      ?.city_name || segment.destination}
                                )
                              </div>
                            </div>
                          </div>

                          {/* Airport Names and Terminal Info - Now in a separate row */}
                          <div className="flex justify-between text-muted-foreground">
                            <div>
                              <div className="text-sm">
                                {locationDetails[segment.origin]?.type ===
                                "city"
                                  ? locationDetails[segment.origin]
                                      ?.main_airport_name
                                  : locationDetails[segment.origin]?.name || ""}
                              </div>
                              <div className="text-xs mt-2">
                                Terminal: {segment.terminal?.departure || "-"}
                              </div>
                              <div className="text-xs">
                                {segment.departureTime}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm">
                                {locationDetails[segment.destination]?.type ===
                                "city"
                                  ? locationDetails[segment.destination]
                                      ?.main_airport_name
                                  : locationDetails[segment.destination]
                                      ?.name || ""}
                              </div>
                              <div className="text-xs mt-2">
                                Terminal: {segment.terminal?.arrival || "-"}
                              </div>
                              <div className="text-xs">
                                {segment.arrivalTime}
                              </div>
                            </div>
                          </div>

                          {/* Aircraft and Baggage - Now with conditional rendering */}
                          <div className="text-xs text-muted-foreground flex items-center gap-4 justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Plane className="h-3 w-3 shrink-0" />
                              {segment.aircraft}
                            </div>
                            {/* Only show baggage info if props.baggage exists */}
                            {props.baggage && (
                              <div className="flex items-center gap-2">
                                <Luggage className="h-3 w-3 shrink-0" />
                                {`${props.baggage.includedCheckedBags}x Checked Bag`}
                                {props.baggage.includedCabinBags > 0 &&
                                  ` • ${props.baggage.includedCabinBags}x Cabin Bag`}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Layover Information */}
                        {index < props.segments.length - 1 && (
                          <div
                            className="pt-4 border-t-[1px] border-gray-300 text-xs text-muted-foreground px-4 pb-4"
                            style={{ borderTopStyle: "dashed" }}
                          >
                            <Clock className="h-3 w-3 inline mr-1" />
                            Layover:{" "}
                            {formatDurationHM(
                              props.layoverTime / (props.segments.length - 1)
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    // New direct flight segment display
                    <div
                      className="border-[1px] border-gray-300 rounded-lg overflow-hidden bg-white shadow-[inset_0_0_2px_#00000015]"
                      style={{ borderStyle: "dashed" }}
                    >
                      {/* Segment Header - With same linear gradient */}
                      <div
                        className="px-4 py-3"
                        style={{
                          backgroundImage:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-[0_0_0_2px_#1500ff9c]">
                              <div className="relative">
                                <img
                                  src={`https://content.airhex.com/content/logos/airlines_${props.airlineCode}_200_200_s.png`}
                                  alt={`${props.airline} logo`}
                                  className="h-[100%] w-[100%] object-contain"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement
                                      ?.querySelector(".fallback-icon")
                                      ?.classList.remove("hidden");
                                  }}
                                />
                                <Plane className="h-4 w-4 text-blue-500 fallback-icon hidden absolute inset-0 m-auto" />
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-white">
                                {props.airline} {props.flightNumber}
                              </span>
                              {props.cabinClass && (
                                <span className="ml-2 px-2 py-0.5 bg-[#000000a6] rounded-full text-xs uppercase font-medium whitespace-nowrap">
                                  {getFlightClassLabel(props.cabinClass)}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-white/80">
                            {formatDurationHM(props.duration)}
                          </span>
                        </div>
                      </div>

                      {/* Segment Content */}
                      <div className="p-4">
                        {/* First row: IATA codes with city names and flight path */}
                        <div className="flex items-center justify-between text-muted-foreground">
                          <div className="font-semibold text-base">
                            {props.origin} (
                            {locationDetails[props.origin]?.type === "city"
                              ? locationDetails[props.origin]?.name
                              : locationDetails[props.origin]?.city_name ||
                                props.originCity}
                            )
                          </div>

                          {/* Flight Path Visualization */}
                          <div className="flex-1 mx-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-gray-400" />
                              <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-400 to-gray-300" />
                              <div className="rounded-full bg-gray-100 p-1">
                                <Plane className="h-3.5 w-3.5 text-zinc-900 rotate-45" />
                              </div>
                              <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-300 to-gray-400" />
                              <div className="h-2 w-2 rounded-full bg-gray-400" />
                            </div>
                          </div>

                          <div className="font-semibold text-base">
                            {props.destination} (
                            {locationDetails[props.destination]?.type === "city"
                              ? locationDetails[props.destination]?.name
                              : locationDetails[props.destination]?.city_name ||
                                props.destinationCity}
                            )
                          </div>
                        </div>

                        {/* Second row: Airport names, terminals and times */}
                        <div className="flex justify-between text-muted-foreground">
                          <div>
                            <div className="text-sm">
                              {locationDetails[props.origin]?.type === "city"
                                ? locationDetails[props.origin]
                                    ?.main_airport_name
                                : locationDetails[props.origin]?.name || ""}
                            </div>
                            <div className="text-xs mt-2">
                              Terminal: {props.terminal?.departure || "-"}
                            </div>
                            <div className="text-xs">{props.departureTime}</div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm">
                              {locationDetails[props.destination]?.type ===
                              "city"
                                ? locationDetails[props.destination]
                                    ?.main_airport_name
                                : locationDetails[props.destination]?.name ||
                                  ""}
                            </div>
                            <div className="text-xs mt-2">
                              Terminal: {props.terminal?.arrival || "-"}
                            </div>
                            <div className="text-xs">{props.arrivalTime}</div>
                          </div>
                        </div>

                        {/* Aircraft and Baggage info remains unchanged */}
                        <div className="text-xs text-muted-foreground flex items-center gap-4 justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <Plane className="h-3 w-3 shrink-0" />
                            {props.aircraft}
                          </div>
                          {props.baggage && (
                            <div className="flex items-center gap-2">
                              <Luggage className="h-3 w-3 shrink-0" />
                              {`${props.baggage.includedCheckedBags}x Checked Bag`}
                              {props.baggage.includedCabinBags > 0 &&
                                ` • ${props.baggage.includedCabinBags}x Cabin Bag`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </Card>
  );
}
