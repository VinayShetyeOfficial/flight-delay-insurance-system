import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Clock, Plane } from "lucide-react";
import { useEffect } from "react";
import { getCurrencySymbol } from "@/lib/utils";

// Add status styles helper
const getStatusStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800"; // Green for active flights
    case "scheduled":
      return "bg-blue-100 text-blue-800"; // Blue for scheduled flights
    case "delayed":
      return "bg-amber-100 text-amber-800"; // Amber/Yellow for delayed flights
    default:
      return "bg-gray-100 text-gray-800"; // Gray for unknown status
  }
};

interface FlightCardProps {
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
}

export default function FlightCard({
  airline,
  airlineCode,
  flightNumber,
  origin,
  originCity,
  destination,
  destinationCity,
  departureTime,
  arrivalTime,
  duration,
  price,
  status = "ACTIVE",
  terminal,
  aircraft,
  currency = "USD",
  onSelect,
}: FlightCardProps) {
  // Add console log when the card is rendered
  useEffect(() => {
    console.group(`Flight Details: ${flightNumber}`);
    console.log("Airline IATA Code:", airlineCode);
    console.log({
      airline,
      airlineCode,
      flightNumber,
      origin,
      destination,
      departureTime,
      arrivalTime,
      duration,
      price,
      status,
      terminal,
      aircraft,
    });
    console.groupEnd();
  }, [
    airline,
    airlineCode,
    flightNumber,
    origin,
    destination,
    departureTime,
    arrivalTime,
    duration,
    price,
    status,
    terminal,
    aircraft,
  ]);

  const formatDuration = (durationMinutes: number) => {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden">
              {airlineCode ? (
                <div className="relative">
                  <img
                    src={`https://content.airhex.com/content/logos/airlines_${airlineCode}_200_200_s.png`}
                    alt={`${airline} logo`}
                    className="h-10 w-10 object-contain"
                    onError={(e) => {
                      // Fallback to Plane icon if image fails to load
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
                <h3 className="text-lg font-semibold">{airline}</h3>
                {/* {airlineCode && (
                  <span className="text-sm text-muted-foreground">
                    ({airlineCode})
                  </span>
                )} */}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs uppercase font-medium ${getStatusStyles(
                    status
                  )}`}
                >
                  {status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Flight {flightNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {getCurrencySymbol(currency)}
              {price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-sm text-muted-foreground">per person</p>
          </div>
        </div>

        {/* Flight Timeline */}
        <div className="grid grid-cols-[1fr,2fr,1fr] items-center gap-4">
          {/* Departure */}
          <div>
            <p className="text-2xl font-bold">{departureTime}</p>
            <p className="font-medium">
              {originCity} ({origin})
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Building2 className="h-3 w-3" />
              Terminal {terminal?.departure || "D"}
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
              {formatDuration(duration)} • Direct
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <p className="text-2xl font-bold">{arrivalTime}</p>
            <p className="font-medium">
              {destinationCity} ({destination})
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 justify-end">
              <Building2 className="h-3 w-3" />
              Terminal {terminal?.arrival || "B"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Aircraft: {aircraft || "Boeing 737"}
          </p>
          <Button onClick={onSelect} className="px-8">
            Select Flight
          </Button>
        </div>
      </div>
    </Card>
  );
}
