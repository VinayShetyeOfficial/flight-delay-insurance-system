import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Clock, Plane } from "lucide-react";
import { useEffect, useRef } from "react";
import { getCurrencySymbol, formatDuration } from "@/lib/utils";

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

export default function FlightCard(props: FlightCardProps) {
  const lastLoggedSearchId = useRef<number | undefined>(undefined);

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

  return (
    <Card className="overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden shadow-[rgba(3,102,214,0.3)_0px_0px_0px_2px]">
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
                  <Plane className="h-6 w-6 text-zinc-900 fallback-icon hidden absolute inset-0 m-auto" />
                </div>
              ) : (
                <Plane className="h-6 w-6 text-zinc-900" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{props.airline}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs uppercase font-medium">
                  {/* {props.status || "SCHEDULED"} */}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Flight {props.flightNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {getCurrencySymbol(props.currency)}
              {props.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-sm text-muted-foreground">Ticket Price</p>
          </div>
        </div>

        {/* Flight Timeline */}
        <div className="grid grid-cols-[1fr,2fr,1fr] items-center gap-4">
          {/* Departure */}
          <div>
            <p className="text-2xl font-bold">{props.departureTime}</p>
            <p className="font-medium">({props.origin})</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Building2 className="h-3 w-3" />
              Terminal {props.terminal?.departure || "D"}
            </div>
          </div>

          {/* Flight Path */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-full flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-zinc-900" />
              <div className="h-[2px] flex-1 bg-gradient-to-r from-zinc-900 to-zinc-500" />
              <div className="rounded-full bg-zinc-100 p-1">
                <Plane className="h-3 w-3 text-zinc-900 rotate-45" />
              </div>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-zinc-500 to-zinc-900" />
              <div className="h-2 w-2 rounded-full bg-zinc-900" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDuration(props.duration)}
              {props.segments
                ? ` • ${props.segments.length - 1} ${
                    props.segments.length - 1 === 1 ? "Layover" : "Layovers"
                  }`
                : " • Direct"}
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <p className="text-2xl font-bold">{props.arrivalTime}</p>
            <p className="font-medium">({props.destination})</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 justify-end">
              <Building2 className="h-3 w-3" />
              Terminal {props.terminal?.arrival || "B"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Aircraft: {props.aircraft || "Boeing 737"}
          </p>
          <Button onClick={props.onSelect} className="px-8">
            Select Flight
          </Button>
        </div>
      </div>
    </Card>
  );
}
