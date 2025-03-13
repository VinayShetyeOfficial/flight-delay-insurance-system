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
  Calendar,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCurrencySymbol, formatDuration, formatCurrency } from "@/lib/utils";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFlightStore } from "@/store/flightStore";

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
  departureDatetime: string;
  arrivalDatetime: string;
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
  isLoading?: boolean;
  id: string; // Add this to identify the selected flight
  passengerCounts?: {
    adults: number;
    children: number;
    infants: number;
  };
  departureDatetime: string;
  arrivalDatetime: string;
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

  // Use the same calculateLayoverTime function for layover calculations
  const layoverTimes: number[] = [];
  for (let i = 0; i < segments.length - 1; i++) {
    const currentLayover = calculateLayoverTime(segments[i], segments[i + 1]);
    layoverTimes.push(currentLayover);
  }
  const totalLayoverTime = layoverTimes.reduce((acc, time) => acc + time, 0);

  let output = `
╔════════════════════════════════════════════════════════════╗
║                ✈  LAYOVER FLIGHT DETAILS  ✈                
╠════════════════════════════════════════════════════════════╣
║ Total Journey Summary:
║ From: ${segments[0].origin} To: ${segments[segments.length - 1].destination}
║ Total Duration: ${formatDuration(
    segments.reduce((acc, seg) => acc + seg.duration, 0) + totalLayoverTime
  )}
║ Total Price: ${getCurrencySymbol(props.currency)}${totalPrice.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
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
      const layover = calculateLayoverTime(segment, segments[index + 1]);
      output += `
╠════════════════════════════════════════════════════════════╣
║ LAYOVER AT ${segment.destination}:
║ Duration: ${formatDuration(layover)}
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

// Update the layover time calculation helper function
const calculateLayoverTime = (
  currentSegment: FlightSegment,
  nextSegment: FlightSegment
): number => {
  // Parse times using 12-hour format (e.g., "2:30 PM")
  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    // Convert to 24-hour format
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  };

  const arrival = parseTime(currentSegment.arrivalTime);
  const departure = parseTime(nextSegment.departureTime);

  // Create Date objects for comparison
  const arrivalTime = new Date(2000, 0, 1, arrival.hours, arrival.minutes);
  const departureTime = new Date(
    2000,
    0,
    1,
    departure.hours,
    departure.minutes
  );

  // If departure is earlier than arrival, add 24 hours
  if (departureTime < arrivalTime) {
    departureTime.setDate(departureTime.getDate() + 1);
  }

  // Calculate difference in minutes
  const diffMinutes =
    (departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60);
  return Math.round(diffMinutes);
};

// Update the duration formatting function
const formatDurationHM = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Add these interfaces at the top
interface TravelPayoutsLocation {
  type: string;
  code: string;
  name: string;
  city_name?: string;
  main_airport_name?: string;
}

// Add this helper function at the top of the file
const formatCustomDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  // Add ordinal suffix
  const suffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${month} ${day}${suffix(day)}, ${year}`;
};

// Add this helper function near the top of the file
const AirlineLogo = ({
  airlineCode,
  airline,
  size = 48, // default size for the main card
}: {
  airlineCode?: string;
  airline: string;
  size?: number;
}) => {
  const [imgError, setImgError] = useState(false);

  if (!airlineCode || imgError) {
    return <Plane className={`h-${size / 16} w-${size / 16} text-blue-500`} />;
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={`https://assets.wego.com/image/upload/h_240,c_fill,f_auto,fl_lossy,q_auto:best,g_auto/v20250220/flights/airlines_square/${airlineCode}.png`}
        alt={`${airline} logo`}
        width={size}
        height={size}
        className="object-contain"
        onError={() => setImgError(true)}
        priority={true}
      />
    </div>
  );
};

export function FlightCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Header with gradient background */}
      <div
        className="p-4 flex items-center justify-between"
        style={{
          backgroundImage:
            "radial-gradient(circle 248px at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%)",
        }}
      >
        {/* Airline logo and name */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full bg-white/30" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 bg-white/30" />
            <Skeleton className="h-4 w-24 bg-white/30" />
          </div>
        </div>
        {/* Price */}
        <div className="text-right">
          <Skeleton className="h-8 w-28 bg-white/30 mb-1" />
          <Skeleton className="h-4 w-20 bg-white/30 ml-auto" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-6">
        {/* Flight Timeline */}
        <div className="grid grid-cols-[1fr,2fr,1fr] items-center gap-4">
          {/* Departure */}
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-6 w-16 mb-2" />
            <Skeleton className="h-4 w-28" />
          </div>

          {/* Flight Path */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-full flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-zinc-300" />
              <div className="h-[2px] flex-1 bg-gradient-to-r from-zinc-300 to-zinc-200" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="h-[2px] flex-1 bg-gradient-to-r from-zinc-200 to-zinc-300" />
              <div className="h-2 w-2 rounded-full bg-zinc-300" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Arrival */}
          <div className="text-right">
            <Skeleton className="h-8 w-24 ml-auto mb-2" />
            <Skeleton className="h-6 w-16 ml-auto mb-2" />
            <Skeleton className="h-4 w-28 ml-auto" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 pt-4 border-t">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-9 w-28" /> {/* Select Flight button */}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function FlightCard(props: FlightCardProps) {
  const lastLoggedSearchId = useRef<number | undefined>(undefined);
  const router = useRouter();

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

  const handleSelect = () => {
    const flightData = {
      segments: props.isLayover
        ? props.segments.map((segment) => ({
            ...segment,
            originCity:
              locationDetails[segment.origin]?.city_name || segment.originCity,
            destinationCity:
              locationDetails[segment.destination]?.city_name ||
              segment.destinationCity,
            locationDetails: locationDetails,
            baggage: {
              includedCheckedBags: props.baggage?.includedCheckedBags || 0,
              includedCabinBags: props.baggage?.includedCabinBags || 0,
            },
          }))
        : [
            {
              airline: props.airline,
              airlineCode: props.airlineCode,
              flightNumber: props.flightNumber,
              origin: props.origin,
              originCity:
                locationDetails[props.origin]?.city_name || props.originCity,
              destination: props.destination,
              destinationCity:
                locationDetails[props.destination]?.city_name ||
                props.destinationCity,
              departureTime: props.departureTime,
              arrivalTime: props.arrivalTime,
              duration: props.duration,
              terminal: props.terminal,
              aircraft: props.aircraft,
              locationDetails: locationDetails,
              baggage: {
                includedCheckedBags: props.baggage?.includedCheckedBags || 0,
                includedCabinBags: props.baggage?.includedCabinBags || 0,
              },
            },
          ],
      isLayover: props.isLayover,
      layoverDuration: props.layoverTime || 0,
      price: Number(props.price || 0),
      totalPrice: Number(props.totalPrice || props.price || 0),
      currency: props.currency || "USD",
      cabinClass: props.cabinClass || "ECONOMY",
      totalDuration: props.duration,
      locationDetails: locationDetails,
    };

    // Add null check for segments before mapping
    const completeFlightData = {
      ...flightData,
      segments: props.segments
        ? props.segments.map((segment) => ({
            ...segment,
            originDetails: locationDetails[segment.origin],
            destinationDetails: locationDetails[segment.destination],
            aircraft: {
              type: segment.aircraft,
              code: segment.airlineCode,
            },
            airline: {
              name: segment.airline,
              code: segment.airlineCode,
            },
            terminal: segment.terminal,
            baggage: props.baggage,
          }))
        : [flightData.segments[0]], // Use the single segment if no segments array
    };

    // Store complete data
    localStorage.setItem("selectedFlight", JSON.stringify(completeFlightData));
    useFlightStore.getState().setSelectedFlight(completeFlightData);

    // Ensure we have passengerCounts before proceeding
    if (props.passengerCounts) {
      const { adults, children, infants } = props.passengerCounts;

      // Add passenger counts to URL parameters
      const searchParams = new URLSearchParams({
        adults: adults.toString(),
        children: children.toString(),
        infants: infants.toString(),
      });

      // Navigate to booking page with passenger counts
      router.push(`/booking/${props.id}?${searchParams.toString()}`);
    } else {
      // Fallback to default values if no passenger counts provided
      router.push(`/booking/${props.id}?adults=1&children=0&infants=0`);
    }
  };

  if (props.isLoading) {
    return <FlightCardSkeleton />;
  }

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
              <AirlineLogo
                airlineCode={props.airlineCode}
                airline={props.airline}
              />
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
              {formatCurrency(Number(props.price || 0), props.currency)}
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
            <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                Terminal: {props.terminal?.departure || "D"}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatCustomDate(props.departureDatetime)}
              </div>
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
            <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-1 items-end">
              <div className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                Terminal: {props.terminal?.arrival || "B"}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatCustomDate(props.arrivalDatetime)}
              </div>
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
            <Button onClick={handleSelect} className="w-full md:w-auto">
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
                          ? `${props.segments?.length - 1} ${
                              props.segments?.length - 1 === 1
                                ? "Stop"
                                : "Stops"
                            }`
                          : "Non-stop flight"}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        Total duration: {formatDurationHM(props.duration)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {props.origin} → {props.destination}
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
                                <AirlineLogo
                                  airlineCode={segment.airlineCode}
                                  airline={segment.airline}
                                  size={32}
                                />
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
                              <div className="text-xs mt-2 flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                Terminal: {segment.terminal?.departure || "-"}
                              </div>
                              <div className="text-xs flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatCustomDate(segment.departureDatetime)}
                              </div>
                              <div className="text-xs flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
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
                              <div className="text-xs mt-2 flex items-center gap-1 justify-end">
                                <Building2 className="h-3.5 w-3.5" />
                                Terminal: {segment.terminal?.arrival || "-"}
                              </div>
                              <div className="text-xs flex items-center gap-1 justify-end">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatCustomDate(segment.arrivalDatetime)}
                              </div>
                              <div className="text-xs flex items-center gap-1 justify-end">
                                <Clock className="h-3.5 w-3.5" />
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
                            className="pt-4 border-t-[1px] border-gray-300 text-xs text-muted-foreground px-4 pb-4 text-center"
                            style={{ borderTopStyle: "dashed" }}
                          >
                            <Clock className="h-3 w-3 inline mr-1" />
                            Layover:{" "}
                            {formatDurationHM(
                              calculateLayoverTime(
                                segment,
                                props.segments[index + 1]
                              )
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
                              <AirlineLogo
                                airlineCode={props.airlineCode}
                                airline={props.airline}
                                size={32}
                              />
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
                            <div className="text-xs mt-2 flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              Terminal: {props.terminal?.departure || "-"}
                            </div>
                            <div className="text-xs flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatCustomDate(props.departureDatetime)}
                            </div>
                            <div className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {props.departureTime}
                            </div>
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
                            <div className="text-xs mt-2 flex items-center gap-1 justify-end">
                              <Building2 className="h-3 w-3" />
                              Terminal: {props.terminal?.arrival || "-"}
                            </div>
                            <div className="text-xs flex items-center gap-1 justify-end">
                              <Calendar className="h-3 w-3" />
                              {formatCustomDate(props.arrivalDatetime)}
                            </div>
                            <div className="text-xs flex items-center gap-1 justify-end">
                              <Clock className="h-3 w-3" />
                              {props.arrivalTime}
                            </div>
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
