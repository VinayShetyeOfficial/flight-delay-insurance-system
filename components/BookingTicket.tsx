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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingTicketProps {
  booking: any; // You can create a proper TypeScript interface if desired
}

export function BookingTicket({ booking }: BookingTicketProps) {
  if (!booking) return null;

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
  } = booking;

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const dt = new Date(dateStr);
    return format(dt, "PPpp"); // e.g., Mar 2, 2025, 4:35 PM
  };

  return (
    <Card className="p-6 shadow-md border relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Booking #{id}</h2>
          <p className="text-sm text-muted-foreground">
            Created: {formatDate(createdAt)}
          </p>
        </div>
        <div>{getStatusBadge(status)}</div>
      </div>

      {/* Flights */}
      <div className="space-y-4 mb-8">
        {flights.map((flight: any, index: number) => (
          <div
            key={flight.id}
            className="border-l-4 border-primary/50 bg-muted/10 p-4 rounded-md"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-base">
                  {flight.airline} {flight.flightNumber}
                </h3>
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                  {flight.cabinClass || "ECONOMY"}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Aircraft: {flight.aircraft || "N/A"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-primary">Origin</p>
                <p>{flight.origin}</p>
                <p className="text-xs text-muted-foreground">
                  Terminal {flight.originTerminal || "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Departure: {formatDate(flight.departureTime)}
                </p>
              </div>
              <div>
                <p className="font-medium text-primary">Destination</p>
                <p>{flight.destination}</p>
                <p className="text-xs text-muted-foreground">
                  Terminal {flight.destTerminal || "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Arrival: {formatDate(flight.arrivalTime)}
                </p>
              </div>
            </div>

            {/* Amenities, baggage, etc. */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs">
              {flight.amenities && (
                <div>
                  <p className="font-medium mb-1">Amenities:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {flight.amenities.wifi && <li>Wi-Fi</li>}
                    {flight.amenities.meals && <li>Meals</li>}
                    {flight.amenities.power && <li>Power Outlets</li>}
                    {flight.amenities.entertainment && <li>Entertainment</li>}
                    {flight.amenities.lounge && <li>Lounge Access</li>}
                  </ul>
                </div>
              )}
              {flight.baggage && (
                <div>
                  <p className="font-medium mb-1">Baggage:</p>
                  <p>
                    {flight.baggage.includedCheckedBags}x Checked Bag
                    {flight.baggage.checkedBagWeight}{" "}
                    {flight.baggage.checkedBagWeightUnit} each
                  </p>
                  <p>
                    {flight.baggage.includedCabinBags}x Cabin Bag
                    {flight.baggage.cabinBagWeight}{" "}
                    {flight.baggage.cabinBagWeightUnit} each
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Passengers */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Passengers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {passengers.map((p: any) => (
            <div
              key={p.id}
              className="border rounded-md p-3 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2 font-medium">
                {getPassengerIcon(p.passengerType)}
                <span>
                  {p.firstName} {p.lastName}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {p.passengerType} • {p.nationality}
              </p>
              {p.specialRequests && (
                <p className="text-xs text-muted-foreground">
                  Requests: {p.specialRequests}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add-ons (from addOnsData) */}
      {Object.keys(addOnsData).length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Add-ons Purchased</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {Object.entries(addOnsData).map(([addonKey, price]) => (
              <div key={addonKey} className="bg-primary/5 px-3 py-2 rounded-md">
                <p className="capitalize">
                  {addonKey.replace("-", " ")}: {price} {currency}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insurance */}
      {insurance && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Insurance Coverage
          </h3>
          <p className="text-sm">
            <span className="font-medium capitalize">
              {insurance.coverageType}
            </span>{" "}
            - {insurance.price} {currency}
          </p>
        </div>
      )}

      {/* Payment */}
      {payment && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Payment Details
          </h3>
          <p className="text-sm">
            Method: {payment.paymentMethod} • Status: {payment.status}
          </p>
          <p className="text-sm">
            Amount: {payment.amount} {payment.currency}
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="border-t pt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Booked by: {user?.name} ({user?.email})
        </div>
        <div className="text-lg font-semibold">
          Total: {totalPrice} {currency}
        </div>
      </div>
    </Card>
  );
}
