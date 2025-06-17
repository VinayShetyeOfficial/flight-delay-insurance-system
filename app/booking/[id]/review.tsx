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
  Calendar,
  Building2,
} from "lucide-react";
import { formatCurrency, formatCustomDate } from "@/lib/utils";
import { addOns, CURRENCY_RATES, insuranceOptions } from "@/lib/constants";
import { useState, useEffect } from "react";
import { TravelPayoutsLocation } from "@/types";

// Add the formatDurationHM function
const formatDurationHM = (minutes: number): string => {
  const days = Math.floor(minutes / (24 * 60));
  const remainingMinutes = minutes % (24 * 60);
  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;

  let durationString = "";

  if (days > 0) {
    durationString += `${days} day${days > 1 ? "s" : ""} `;
  }

  if (hours > 0 || days > 0) {
    durationString += `${hours}h `;
  }

  if (mins > 0 || (hours === 0 && days === 0)) {
    durationString += `${mins}m`;
  }

  return durationString.trim();
};

// Add this helper function at the top level
const getAircraftName = (aircraft: any) => {
  if (!aircraft) return "";
  if (typeof aircraft === "string") return aircraft;
  return aircraft.type || aircraft.name || "";
};

export default function Review() {
  const { selectedFlight } = useFlightStore();
  const { temporaryBooking } = useBookingStore();
  const [localFlight, setLocalFlight] = useState<any>(null);

  // Load flight details from localStorage if not available in store
  useEffect(() => {
    if (!selectedFlight) {
      const currentUser = JSON.parse(
        localStorage.getItem("current_user") || "{}"
      );
      if (currentUser.id) {
        const savedFlightData = localStorage.getItem(
          `user_data_${currentUser.id}_selectedFlight`
        );
        if (savedFlightData) {
          try {
            const parsedFlight = JSON.parse(savedFlightData);
            setLocalFlight(parsedFlight);
          } catch (error) {
            console.error("Error parsing saved flight data:", error);
          }
        }
      }
    }
  }, [selectedFlight]);

  // Use selectedFlight from store or localStorage
  const flightData = selectedFlight || localFlight;

  const currency = flightData?.currency || "USD";
  const rate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;

  // Update useEffect to store price breakdown in user-specific booking data
  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("current_user") || "{}"
    );
    if (!currentUser.id) return;

    // Calculate add-ons prices
    const addOnsPrices = temporaryBooking.selectedAddOns.reduce(
      (acc, addonId) => {
        const addon = addOns.find((a) => a.id === addonId);
        if (addon) {
          acc[addonId] = Number((addon.basePrice * rate).toFixed(3));
        }
        return acc;
      },
      {} as { [key: string]: number }
    );

    // Calculate insurance price
    const insurancePrice = temporaryBooking.selectedInsurance
      ? Number(
          (
            insuranceOptions.find(
              (i) => i.id === temporaryBooking.selectedInsurance
            )?.basePrice * rate
          ).toFixed(3)
        )
      : 0;

    // Create price breakdown object
    const priceBreakdown = {
      baseTicketPrice: Number(temporaryBooking.basePrice.toFixed(3)),
      addOnsTotal: Number(temporaryBooking.addOnsTotal.toFixed(3)),
      insurancePrice: insurancePrice,
      totalPrice: Number(temporaryBooking.totalPrice.toFixed(3)),
      currency: currency,
      addOnsPrices: addOnsPrices,
    };

    // Get existing booking data
    const existingBookingData = JSON.parse(
      localStorage.getItem(`user_data_${currentUser.id}_booking`) || "{}"
    );

    // Update booking data with price breakdown
    const updatedBookingData = {
      ...existingBookingData,
      priceBreakdown,
      lastUpdated: new Date().toISOString(),
    };

    // Store updated booking data
    localStorage.setItem(
      `user_data_${currentUser.id}_booking`,
      JSON.stringify(updatedBookingData)
    );
  }, [temporaryBooking, flightData, currency, rate]);

  // Add back the getPassengerIcon function
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

  // Get selected add-ons with converted prices
  const selectedAddOnsWithPrices = temporaryBooking.selectedAddOns
    .map((addonId) => {
      const addon = addOns.find((a) => a.id === addonId);
      if (!addon) return null;
      return {
        ...addon,
        convertedPrice: addon.basePrice * rate,
      };
    })
    .filter(Boolean);

  // Get selected insurance with converted price
  const selectedInsuranceWithPrice = temporaryBooking.selectedInsurance
    ? insuranceOptions.find(
        (option) => option.id === temporaryBooking.selectedInsurance
      )
    : null;

  const amenities = [
    { icon: <Wifi className="h-4 w-4" />, name: "In-flight Wi-Fi" },
    { icon: <Power className="h-4 w-4" />, name: "Power outlets" },
    {
      icon: <Utensils className="h-4 w-4" />,
      name: "Complimentary meals",
    },
  ];

  const getLocationName = (segment: any, originOrDestination: string) => {
    if (!segment) return "";

    const details =
      originOrDestination === "origin"
        ? segment.originDetails
        : segment.destinationDetails;

    if (!details)
      return originOrDestination === "origin"
        ? segment.origin
        : segment.destination;

    return (
      details.city_name ||
      details.name ||
      (originOrDestination === "origin" ? segment.origin : segment.destination)
    );
  };

  const getAirportName = (segment: any, originOrDestination: string) => {
    if (!segment) return "";

    const details =
      originOrDestination === "origin"
        ? segment.originDetails
        : segment.destinationDetails;

    if (!details) return "";

    return (
      details.airport_name || details.main_airport_name || details.name || ""
    );
  };

  const renderFlightSegment = (segment: any, index: number) => {
    if (!segment) return null;

    return (
      <div
        key={index}
        className="border-[1px] border-gray-300 rounded-lg overflow-hidden bg-white shadow-[inset_0_0_2px_#00000015]"
        style={{ borderStyle: "dashed" }}
      >
        {/* Header */}
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
                  src={`https://assets.wego.com/image/upload/h_240,c_fill,f_auto,fl_lossy,q_auto:best,g_auto/v20250220/flights/airlines_square/${String(
                    segment.airlineCode
                  ).toLowerCase()}.png`}
                  alt={String(segment.airline)}
                  className="h-8 w-8 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `/airlines/${String(
                      segment.airlineCode
                    ).toLowerCase()}.png`;
                  }}
                />
              </div>
              <div>
                <span className="font-medium text-white">
                  {typeof segment.airline === "object"
                    ? segment.airline.name
                    : segment.airline}{" "}
                  {segment.flightNumber}
                </span>
                <span className="ml-2 px-2 py-0.5 bg-[#000000a6] rounded-full text-xs uppercase font-medium">
                  {String(flightData?.cabinClass || "ECONOMY")}
                </span>
              </div>
            </div>
            <span className="text-white/80">
              {formatDurationHM(segment.duration)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Cities and Flight Path */}
          <div className="flex items-center justify-between text-muted-foreground">
            <div>
              <div className="font-semibold text-base">
                {segment.origin} ({getLocationName(segment, "origin")})
              </div>
            </div>

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
                {segment.destination} ({getLocationName(segment, "destination")}
                )
              </div>
            </div>
          </div>

          {/* Airport Details - Updated with icons */}
          <div className="flex justify-between text-muted-foreground">
            <div>
              <div className="text-sm">{getAirportName(segment, "origin")}</div>
              <div className="text-xs mt-2 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Terminal: {String(segment.terminal?.departure || "-")}
              </div>
              <div className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatCustomDate(segment.departureDatetime)}
              </div>
              <div className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {String(segment.departureTime)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm">
                {getAirportName(segment, "destination")}
              </div>
              <div className="text-xs mt-2 flex items-center gap-1 justify-end">
                <Building2 className="h-3 w-3" />
                Terminal: {String(segment.terminal?.arrival || "-")}
              </div>
              <div className="text-xs flex items-center gap-1 justify-end">
                <Calendar className="h-3 w-3" />
                {formatCustomDate(segment.arrivalDatetime)}
              </div>
              <div className="text-xs flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3" />
                {String(segment.arrivalTime)}
              </div>
            </div>
          </div>

          {/* Aircraft and Baggage */}
          <div className="text-xs text-muted-foreground flex items-center gap-4 justify-between mt-4">
            <div className="flex items-center gap-2">
              <Plane className="h-3 w-3 shrink-0" />
              {getAircraftName(segment.aircraft)}
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
        </div>

        {/* Layover */}
        {index < flightData?.segments.length - 1 && flightData.isLayover && (
          <div
            className="pt-4 border-t-[1px] border-gray-300 text-xs text-muted-foreground px-4 pb-4 text-center"
            style={{ borderTopStyle: "dashed" }}
          >
            <Clock className="h-3 w-3 inline mr-1" />
            Layover: {formatDurationHM(flightData.layoverTimes[index])}
          </div>
        )}
      </div>
    );
  };

  if (!flightData) {
    return <div>No flight selected</div>;
  }

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
                flightData.totalPrice ||
                flightData.price ||
                0,
              flightData.currency
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
            {flightData.segments.map((segment: any, index: number) =>
              renderFlightSegment(segment, index)
            )}
          </div>

          <Separator />
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div className="space-y-2">
              <div className="font-medium">Total Duration</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatDurationHM(flightData.totalDuration)}
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
              {flightData.segments.map((segment, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-sm font-medium">
                    {segment.origin} → {segment.destination}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className="h-3 w-3 shrink-0" />
                      {getAircraftName(segment.aircraft)}
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
            {temporaryBooking.selectedInsurance ||
            selectedAddOnsWithPrices.length > 0 ? (
              <>
                {/* Show add-ons first */}
                {selectedAddOnsWithPrices.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between py-2"
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

                {/* Show selected insurance after add-ons */}
                {selectedInsuranceWithPrice && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <selectedInsuranceWithPrice.icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">
                        {selectedInsuranceWithPrice.name}
                      </span>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(
                        selectedInsuranceWithPrice.basePrice * rate,
                        currency
                      )}
                    </div>
                  </div>
                )}

                {/* Add-ons Total */}
                <div className="mt-auto pt-4 border-t flex justify-between items-center">
                  <span className="font-medium">Add-ons Total</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(temporaryBooking.addOnsTotal, currency)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mb-2 opacity-50" />
                <p>No add-ons selected</p>
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
                  {formatCurrency(temporaryBooking.addOnsTotal, currency)}
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
