"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Plane,
  Users,
  Package,
  CreditCard,
  CalendarDays,
  Clock,
} from "lucide-react";

export default function Review() {
  // Mock data - in a real app, this would come from your booking context/state
  const bookingDetails = {
    flight: {
      from: "New York (JFK)",
      to: "London (LHR)",
      date: "2023-12-15",
      time: "14:30",
      flightNumber: "BA178",
      duration: "7h 20m",
    },
    passengers: [
      { name: "John Doe", type: "Adult" },
      { name: "Jane Doe", type: "Adult" },
      { name: "Jimmy Doe", type: "Child" },
    ],
    addOns: ["Extra Baggage", "Wi-Fi Access", "Gourmet Meal"],
    totalPrice: 1250.0,
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Review Booking</h2>
        <p className="text-muted-foreground">
          Please review your booking details before proceeding to payment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
        {/* Flight Details */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Flight Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {bookingDetails.flight.from}
                </span>
              </div>
              <Plane className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <span className="font-medium">{bookingDetails.flight.to}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {bookingDetails.flight.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {bookingDetails.flight.time}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Flight Number</span>
                <span className="font-medium">
                  {bookingDetails.flight.flightNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-medium">
                  {bookingDetails.flight.duration}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passenger Details */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Passenger Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bookingDetails.passengers.map((passenger, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{passenger.name}</span>
                  <span className="text-muted-foreground">
                    {passenger.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add-ons */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Add-ons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bookingDetails.addOns.map((addon, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{addon}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Total Price */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Total Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold">
                ${bookingDetails.totalPrice.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                Including all taxes and fees
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
