"use client";

import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import {
  Plane,
  Luggage,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Users,
  Baby,
  Wallet,
  ShieldAlert,
  Gift,
  Wifi,
  Ticket,
  ArrowLeft,
  Power,
  Coffee,
  Tv,
  Usb,
  Check,
  XCircle,
  Building2,
  Building,
  MapPin,
  Timer,
  Package,
  Utensils,
  Headphones,
  Car,
  Sofa,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCustomDate, formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface BookingTicketProps {
  booking: any; // You can create a proper TypeScript interface if desired
}

export function BookingTicket({ booking }: BookingTicketProps) {
  const router = useRouter();

  if (!booking) {
    return (
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50">
        <LoadingSpinner />
      </div>
    );
  }

  const {
    id,
    flights = [],
    passengers = [],
    payment,
    insurance,
    addOnsData = {},
    status,
    user,
    currency,
    totalPrice,
    createdAt,
    // baseFare,
    // taxesAndFees,
    // addOnsTotal,
    price, // Use booking.price as your base fare
    addOns,
  } = booking;

  // 1) Use booking.price for base fare
  const baseFareValue = Number(price) || 0;

  // 2) Calculate addOnsTotal by summing all addOnsData values
  const addOnsTotalValue = Object.values(addOnsData).reduce(
    (acc: number, val) => {
      return acc + (Number(val) || 0);
    },
    0
  );

  // A small helper for passenger icons
  const getPassengerIcon = (type: string) => {
    switch (type) {
      case "ADULT":
        return <User className="w-4 h-4" />;
      case "CHILD":
        return <Users className="w-4 h-4" />;
      case "INFANT":
        return <Baby className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded">
            <CheckCircle className="w-4 h-4" />
            Confirmed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded">
            <AlertCircle className="w-4 h-4" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
            <Clock className="w-4 h-4" />
            {status || "Pending"}
          </span>
        );
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return format(new Date(dateStr), "HH:mm");
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return formatCustomDate(dateStr);
  };

  const calculateDuration = (
    departureTime: string,
    arrivalTime: string,
    departureDateStr: string,
    arrivalDateStr: string
  ) => {
    // Create Date objects for departure and arrival
    const departureDate = new Date(departureDateStr);
    const arrivalDate = new Date(arrivalDateStr);

    // Set the hours and minutes from the 24hr time strings
    const [depHours, depMinutes] = departureTime.split(":").map(Number);
    const [arrHours, arrMinutes] = arrivalTime.split(":").map(Number);

    departureDate.setHours(depHours, depMinutes, 0);
    arrivalDate.setHours(arrHours, arrMinutes, 0);

    // Calculate the difference in minutes
    const diffInMinutes = Math.round(
      (arrivalDate.getTime() - departureDate.getTime()) / (1000 * 60)
    );

    // Format the duration
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .container {
            max-width: 100% !important;
            outline: 1px solid rgb(228 228 231 / 0.8); !important;
            width: 99.9% !important;
            padding: 0 !important;
            margin: 2px 0 0 0 !important;
          }
          .max-w-\\[1024px\\] {
            max-width: 100% !important;
          }
          .card-container {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: white !important;
          }
          .bg-zinc-50,
          .dark\\:bg-zinc-900\\/50,
          .bg-white,
          .dark\\:bg-zinc-800\\/50 {
            background: white !important;
          }
          .border {
            border: none !important;
          }
          .px-4,
          .py-8,
          .p-8 {
            padding: 0 !important;
          }
          .header-gradient {
            padding: 14px 20px !important;
            background: #7e57c2 !important;
            position: relative !important;
            color: white !important;
          }
          .header-content {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          .header-gradient h2 {
            font-size: 1.25rem !important;
            line-height: 1.5rem !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .status-badge {
            position: absolute !important;
            top: 0px !important;
            right: 0px !important;
            padding: 8px 10px !important;
            font-size: 0.75rem !important;
          }
          .check-icon-container {
            padding: 0.2rem !important;
          }
          .check-icon {
            height: 0.875rem !important;
            width: 0.875rem !important;
          }
          .ticket-icon-container {
            height: 2.5rem !important;
            width: 2.5rem !important;
            margin-right: 10px !important;
          }
          .ticket-icon {
            height: 1.25rem !important;
            width: 1.25rem !important;
          }
          .date-line {
            font-size: 0.75rem !important;
            margin-top: 0.25rem !important;
          }
          .content-container {
            padding: 16px 20px !important;
          }
          .space-y-8 > * + * {
            margin-top: 1rem !important;
          }
          .action-buttons {
            display: none !important;
          }
        }
      `}</style>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[1024px] mx-auto">
          <Card className="overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 card-container">
            {/* Header Section with Gradient */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 p-8 relative overflow-hidden header-gradient">
              {/* Simple Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'/%3E%3C/svg%3E\")",
                  }}
                />
              </div>

              {/* Header Content */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 header-content">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center ticket-icon-container">
                    <Ticket className="h-7 w-7 text-white ticket-icon" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Booking #{id}
                    </h2>
                    <p className="text-sm text-white/80 mt-1 flex items-center gap-2 date-line">
                      <Clock className="h-4 w-4" />
                      {formatDateTime(createdAt)}
                    </p>
                  </div>
                </div>

                {/* Status Badge - For print, we're using header-content to position it */}
                <div
                  className={cn(
                    "absolute top-0 right-0 px-3.5 py-2.5 rounded-full text-sm font-medium status-badge",
                    "flex items-center gap-2 shadow-lg backdrop-blur-md",
                    "border border-white/10",
                    "transition-all duration-200",
                    status === "CONFIRMED" && [
                      "bg-emerald-500/40",
                      "text-white",
                      "shadow-emerald-500/30",
                      "hover:bg-emerald-500/50",
                      "border-emerald-400/30",
                    ],
                    status === "PENDING" && [
                      "bg-yellow-400/20",
                      "text-yellow-50",
                      "shadow-yellow-500/20",
                      "hover:bg-yellow-400/30",
                    ],
                    status === "CANCELLED" && [
                      "bg-red-400/20",
                      "text-red-50",
                      "shadow-red-500/20",
                      "hover:bg-red-400/30",
                    ]
                  )}
                  style={{
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }}
                >
                  {status === "CONFIRMED" && (
                    <div className="bg-emerald-500/40 p-0.5 rounded-full check-icon-container">
                      <Check
                        className="h-4.5 w-4.5 text-white check-icon"
                        strokeWidth={2.5}
                      />
                    </div>
                  )}
                  {status === "PENDING" && <Clock className="h-4.5 w-4.5" />}
                  {status === "CANCELLED" && (
                    <XCircle className="h-4.5 w-4.5" />
                  )}
                  <span className="relative z-10 font-medium tracking-wide">
                    {status}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-8 content-container">
              {/* Flights Section without Hover */}
              <div className="space-y-6">
                {flights.map((flight: any, index: number) => (
                  <div
                    key={flight.id}
                    className="relative bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800/80"
                  >
                    {/* Flight Content */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-xl bg-white dark:bg-zinc-800 p-2.5 flex items-center justify-center shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05),_inset_0px_0px_0px_1px_rgb(209,213,219)]">
                          <div
                            className="h-full w-full"
                            style={{
                              backgroundImage: flight?.airlineCode
                                ? `url(https://assets.wego.com/image/upload/h_240,c_fill,f_auto,fl_lossy,q_auto:best,g_auto/v20250220/flights/airlines_square/${flight.airlineCode}.png)`
                                : "none",
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                              backgroundSize: "contain",
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base">
                            {flight.airline} {flight.flightNumber}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                              {flight.cabinClass || "ECONOMY"}
                            </span>
                            <span>•</span>
                            <span>{flight.aircraft || "N/A"}</span>
                          </div>
                          {/* Add Duration Display */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Timer className="h-3.5 w-3.5" />
                            <span>
                              {calculateDuration(
                                formatTime(flight.departureTime),
                                formatTime(flight.arrivalTime),
                                flight.departureTime,
                                flight.arrivalTime
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Flight Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Origin */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {/* Departure plane icon with darker circular background and black icon */}
                          <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                            <Plane className="h-3.5 w-3.5 transform rotate-0 text-black dark:text-white" />
                          </div>
                          <span>Departure</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-2xl font-bold">
                              {flight.origin}
                            </p>
                            <div className="space-y-2 mt-2">
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {flight.originDetails?.city_name || ""}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {flight.originDetails?.airport_name || ""}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Terminal {flight.originTerminal || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">
                              {formatTime(flight.departureTime)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTime(flight.departureTime)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Destination */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {/* Arrival plane icon with darker circular background and black icon */}
                          <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                            <Plane className="h-3.5 w-3.5 transform rotate-90 text-black dark:text-white" />
                          </div>
                          <span>Arrival</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-2xl font-bold">
                              {flight.destination}
                            </p>
                            <div className="space-y-2 mt-2">
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {flight.destinationDetails?.city_name || ""}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {flight.destinationDetails?.airport_name || ""}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Terminal {flight.destTerminal || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">
                              {formatTime(flight.arrivalTime)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTime(flight.arrivalTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Amenities & Baggage */}
                    <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Amenities */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Gift className="h-4 w-4 text-primary" />
                          Amenities
                        </h4>
                        <div className="space-y-2 text-sm">
                          {flight.amenities?.wifi && (
                            <div className="flex items-center gap-2">
                              <Wifi className="h-3.5 w-3.5 text-primary" />
                              In-flight Wi-Fi
                            </div>
                          )}
                          {flight.amenities?.power && (
                            <div className="flex items-center gap-2">
                              <Power className="h-3.5 w-3.5 text-primary" />
                              Power outlets
                            </div>
                          )}
                          {flight.amenities?.meals && (
                            <div className="flex items-center gap-2">
                              <Coffee className="h-3.5 w-3.5 text-primary" />
                              Complimentary meals
                            </div>
                          )}
                          {flight.amenities?.entertainment && (
                            <div className="flex items-center gap-2">
                              <Tv className="h-3.5 w-3.5 text-primary" />
                              Entertainment
                            </div>
                          )}
                          {flight.amenities?.usb && (
                            <div className="flex items-center gap-2">
                              <Usb className="h-3.5 w-3.5 text-primary" />
                              USB Ports
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Baggage */}
                      {flight.baggage && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Luggage className="h-4 w-4 text-primary" />
                            Baggage
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">
                                {flight.baggage.includedCheckedBags}
                              </span>
                              Checked Bag ({flight.baggage.checkedBagWeight}{" "}
                              {flight.baggage.checkedBagWeightUnit})
                            </div>
                            {flight.baggage.includedCabinBags > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">
                                  {flight.baggage.includedCabinBags}
                                </span>
                                Cabin Bag ({flight.baggage.cabinBagWeight}{" "}
                                {flight.baggage.cabinBagWeightUnit})
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Sections Grid without Hover */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Passengers Section */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800/80">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Passengers
                  </h3>
                  <div className="space-y-3">
                    {passengers.map((p: any) => (
                      <div
                        key={p.id}
                        className="p-3 bg-white dark:bg-zinc-800/50 rounded-xl"
                      >
                        {/* Top row: Icon and Name */}
                        <div className="flex items-start gap-3">
                          {/* Icon aligned with name */}
                          <div className="mt-1">
                            {getPassengerIcon(p.passengerType)}
                          </div>
                          <div className="flex-1">
                            {/* Name and basic info */}
                            <p className="font-medium text-base">
                              {p.firstName} {p.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {p.passengerType} • {p.nationality}
                            </p>
                            {/* Passport info */}
                            {p.passportNumber && (
                              <p className="text-sm text-muted-foreground">
                                Passport: {p.passportNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add-ons Grid */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800/80">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Add-ons
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(addOnsData || {}).map(([key, value]) => {
                      // Map the keys to their respective icons
                      const getIcon = (key: string) => {
                        switch (key.toLowerCase()) {
                          case "wifi-access":
                            return <Wifi className="h-4 w-4 text-primary" />;
                          case "gourmet-meal":
                            return (
                              <Utensils className="h-4 w-4 text-primary" />
                            );
                          case "entertainment":
                            return (
                              <Headphones className="h-4 w-4 text-primary" />
                            );
                          case "extra-baggage":
                            return <Luggage className="h-4 w-4 text-primary" />;
                          case "airport-transfer":
                            return <Car className="h-4 w-4 text-primary" />;
                          case "lounge-access":
                            return <Sofa className="h-4 w-4 text-primary" />;
                          default:
                            return <Package className="h-4 w-4 text-primary" />;
                        }
                      };

                      return (
                        <div
                          key={key}
                          className="p-3 bg-white dark:bg-zinc-800/50 rounded-xl"
                        >
                          <div className="flex items-center gap-2">
                            {getIcon(key)}
                            <p className="text-sm font-medium capitalize">
                              {key.replace(/-/g, " ")}
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-primary mt-1">
                            {formatCurrency(Number(value || 0), currency)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Price Details Section */}
              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800/80">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Price Details
                </h3>

                <div className="space-y-3">
                  {/* Base Fare */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Base Fare</span>
                    <span className="font-medium">
                      {formatCurrency(baseFareValue, currency)}
                    </span>
                  </div>

                  {/* Add-ons Total */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Add-ons Total</span>
                    <span className="font-medium">
                      {formatCurrency(addOnsTotalValue, currency)}
                    </span>
                  </div>

                  {/* Insurance */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Travel Insurance
                    </span>
                    <span className="font-medium">
                      {booking?.insurance
                        ? formatCurrency(
                            booking.insurance.price,
                            booking.currency
                          )
                        : "—"}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-zinc-200 dark:border-zinc-800 my-3"></div>

                  {/* Total Price */}
                  <div className="flex justify-between items-center relative">
                    <span className="font-semibold">Total Price</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(totalPrice, currency)}
                    </span>
                    <div className="absolute right-0 -bottom-4 text-xs text-muted-foreground">
                      Including all taxes and fees
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Back to Dashboard and Print buttons */}
              <div className="flex justify-between items-center mt-8 action-buttons">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
