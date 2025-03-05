"use client";

import { useFlightStore } from "@/store/flightStore";
import { useBookingStore } from "@/store/bookingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Users,
  Package,
  Luggage,
  Wifi,
  Utensils,
  Power,
  Clock,
  UserRound,
  User,
  Baby,
  Ticket,
  ReceiptText,
  Clock3,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { addOns, CURRENCY_RATES } from "@/lib/constants";

// Add the formatDurationHM function
const formatDurationHM = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days} ${days === 1 ? "day" : "days"}`;
    }
    return `${days} ${days === 1 ? "day" : "days"} ${remainingHours}h`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

export default function Review() {
  const { selectedFlight } = useFlightStore();
  const { temporaryBooking } = useBookingStore();
  const currency = selectedFlight?.currency || "USD";

  const convertPrice = (basePrice: number, targetCurrency: string): number => {
    const rate =
      CURRENCY_RATES[targetCurrency as keyof typeof CURRENCY_RATES] || 1;
    return Math.round(basePrice * rate);
  };

  // Get selected add-ons with converted prices
  const selectedAddOnsWithPrices = temporaryBooking.selectedAddOns
    .map((addonId) => {
      const addon = addOns.find((a) => a.id === addonId);
      if (!addon) return null;
      return {
        ...addon,
        convertedPrice: convertPrice(addon.basePrice, currency),
      };
    })
    .filter(Boolean);

  if (!selectedFlight) {
    return <div>No flight selected</div>;
  }

  const amenities = [
    { icon: <Wifi className="h-4 w-4" />, name: "In-flight Wi-Fi" },
    { icon: <Power className="h-4 w-4" />, name: "Power outlets" },
    {
      icon: <Utensils className="h-4 w-4" />,
      name: "Complimentary meals",
    },
  ];

  const getCityName = (
    segment: FlightSegment,
    type: "origin" | "destination"
  ) => {
    const code = type === "origin" ? segment.origin : segment.destination;
    const locationDetail = segment.locationDetails?.[code];

    // Use the same logic as FlightCard
    if (locationDetail?.type === "city") {
      return locationDetail.name;
    }
    return (
      locationDetail?.city_name ||
      (type === "origin" ? segment.originCity : segment.destinationCity)
    );
  };

  const renderAircraftAndBaggageInfo = (segment: FlightSegment) => {
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-4 justify-between mt-4">
        <div className="flex items-center gap-2">
          <Plane className="h-3 w-3 shrink-0" />
          {segment.aircraft}
        </div>
        {segment.baggage && (
          <div className="flex items-center gap-2">
            <Luggage className="h-3 w-3 shrink-0" />
            {`${segment.baggage.includedCheckedBags}x Checked Bag`}
            {segment.baggage.includedCabinBags > 0 &&
              ` • ${segment.baggage.includedCabinBags}x Cabin Bag`}
          </div>
        )}
      </div>
    );
  };

  const getPassengerIcon = (type: string) => {
    switch (type) {
      case "ADULT":
        return <UserRound className="h-4 w-4" />;
      case "CHILD":
        return <User className="h-4 w-4" />;
      case "INFANT":
        return <Baby className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Review Booking</h2>
          <p className="text-muted-foreground">
            Please review your booking details before proceeding to payment
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground flex items-center justify-end gap-2">
            <Ticket className="h-4 w-4" />
            Ticket Price
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(
              temporaryBooking.totalPrice ||
                selectedFlight.totalPrice ||
                selectedFlight.price ||
                0,
              selectedFlight.currency
            )}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Flight Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {selectedFlight.segments.map((segment, index) => (
              <div
                key={index}
                className="border-[1px] border-gray-300 rounded-lg overflow-hidden bg-white shadow-[inset_0_0_2px_#00000015]"
                style={{ borderStyle: "dashed" }}
              >
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
                        <img
                          src={`https://assets.wego.com/image/upload/h_240,c_fill,f_auto,fl_lossy,q_auto:best,g_auto/v20250220/flights/airlines_square/${segment.airlineCode.toLowerCase()}.png`}
                          alt={segment.airline}
                          className="h-8 w-8 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `/airlines/${segment.airlineCode.toLowerCase()}.png`;
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {segment.airline} {segment.flightNumber}
                        </span>
                        <span className="px-2 py-0.5 bg-[#000000a6] rounded-full text-xs uppercase font-medium whitespace-nowrap">
                          {selectedFlight.cabinClass}
                        </span>
                      </div>
                    </div>
                    <span className="text-white/80 flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {formatDurationHM(segment.duration)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {/* First row: IATA codes with city names and flight path */}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <div>
                      <div className="font-semibold text-base">
                        {segment.origin} ({getCityName(segment, "origin")})
                      </div>
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

                    <div>
                      <div className="font-semibold text-base">
                        {segment.destination} (
                        {getCityName(segment, "destination")})
                      </div>
                    </div>
                  </div>

                  {/* Second row: Airport names, terminals and times */}
                  <div className="flex justify-between text-muted-foreground">
                    <div>
                      <div className="text-sm">
                        {segment.locationDetails?.[segment.origin]?.type ===
                        "city"
                          ? segment.locationDetails[segment.origin]
                              ?.main_airport_name
                          : segment.locationDetails?.[segment.origin]?.name ||
                            ""}
                      </div>
                      <div className="text-xs mt-2">
                        Terminal: {segment.terminal?.departure || "-"}
                      </div>
                      <div className="text-xs">{segment.departureTime}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm">
                        {segment.locationDetails?.[segment.destination]
                          ?.type === "city"
                          ? segment.locationDetails[segment.destination]
                              ?.main_airport_name
                          : segment.locationDetails?.[segment.destination]
                              ?.name || ""}
                      </div>
                      <div className="text-xs mt-2">
                        Terminal: {segment.terminal?.arrival || "-"}
                      </div>
                      <div className="text-xs">{segment.arrivalTime}</div>
                    </div>
                  </div>

                  {renderAircraftAndBaggageInfo(segment)}
                </div>

                {index < selectedFlight.segments.length - 1 &&
                  selectedFlight.isLayover && (
                    <div
                      className="pt-4 border-t-[1px] border-gray-300 text-xs text-muted-foreground px-4 pb-4 text-center"
                      style={{ borderTopStyle: "dashed" }}
                    >
                      <Clock className="h-3 w-3 inline mr-1" />
                      Layover:{" "}
                      {formatDurationHM(selectedFlight.layoverDuration || 0)}
                    </div>
                  )}
              </div>
            ))}
          </div>

          <Separator />
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div className="space-y-2">
              <div className="font-medium">Total Duration</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatDurationHM(selectedFlight.totalDuration)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Onboard Amenities</div>
              <div className="flex gap-4">
                {amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 text-sm text-muted-foreground"
                  >
                    {amenity.icon}
                    {amenity.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Passenger Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {temporaryBooking.passengers.map((passenger, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPassengerIcon(passenger.type)}
                    <span className="font-medium">
                      {passenger.firstName} {passenger.lastName}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="min-w-[80px] text-center justify-center"
                  >
                    {passenger.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Baggage Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedFlight.segments.map((segment, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-sm font-medium">
                    {segment.origin} → {segment.destination}
                  </div>
                  {renderAircraftAndBaggageInfo(segment)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Selected Add-ons
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            {selectedAddOnsWithPrices.length > 0 ? (
              <div className="space-y-4 flex flex-col flex-1">
                <div className="flex-1">
                  {selectedAddOnsWithPrices.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between mb-4"
                    >
                      <div className="flex items-center gap-2">
                        <addon.icon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{addon.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {formatCurrency(addon.convertedPrice, currency)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t mt-auto">
                  <div className="flex justify-between font-medium">
                    <span>Add-ons Total</span>
                    <span>
                      {formatCurrency(
                        selectedAddOnsWithPrices.reduce(
                          (total, addon) => total + addon.convertedPrice,
                          0
                        ),
                        currency
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                No add-ons selected
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Price Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Base Ticket Price
                </div>
                <div className="font-medium">
                  {formatCurrency(temporaryBooking.basePrice, currency)}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Add-ons Total
                </div>
                <div className="font-medium">
                  {formatCurrency(
                    selectedAddOnsWithPrices.reduce(
                      (total, addon) => total + addon.convertedPrice,
                      0
                    ),
                    currency
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-auto relative">
              <div className="flex justify-between items-center">
                <div className="font-semibold">Total Price</div>
                <div className="text-xl font-bold text-primary">
                  {formatCurrency(temporaryBooking.totalPrice, currency)}
                </div>
              </div>
              <div className="absolute right-0 -bottom-3.5 text-xs text-muted-foreground">
                Including all taxes and fees
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
