"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Users,
  Package,
  Building2,
  Luggage,
  Wifi,
  UtensilsCrossed,
  Power,
  Clock,
} from "lucide-react";

// Mock data structure supporting both direct and layover flights
const bookingDetails = {
  flightType: "layover",
  price: 531.55,
  segments: [
    {
      airline: "ETIHAD AIRWAYS",
      flightNumber: "EY217",
      from: {
        code: "DEL",
        name: "Delhi",
        terminal: "3",
        airport: "Indira Gandhi International Airport",
      },
      to: {
        code: "AUH",
        name: "Abu Dhabi",
        terminal: "A",
        airport: "Abu Dhabi International Airport",
      },
      date: "2024-02-24",
      departureTime: "8:55:00 PM",
      arrivalTime: "11:25:00 PM",
      aircraft: "AIRBUS A350-1000",
      duration: "4h",
      class: "ECONOMY CLASS",
      baggage: {
        checked: "0x Checked Bag",
        cabin: "1x Cabin Bag",
      },
    },
    {
      airline: "ETIHAD AIRWAYS",
      flightNumber: "EY7",
      from: {
        code: "AUH",
        name: "Abu Dhabi",
        terminal: "A",
        airport: "Abu Dhabi International Airport",
      },
      to: {
        code: "BOS",
        name: "Boston",
        terminal: "E",
        airport: "Logan International Airport",
      },
      date: "2024-02-25",
      departureTime: "10:10:00 AM",
      arrivalTime: "3:20:00 PM",
      aircraft: "BOEING 787-9",
      duration: "14h 10m",
      class: "ECONOMY CLASS",
      baggage: {
        checked: "0x Checked Bag",
        cabin: "1x Cabin Bag",
      },
    },
  ],
  layover: {
    duration: "10h 45m",
    location: "AUH",
  },
  totalDuration: "28h 55m",
  passengers: [
    { name: "John Doe", type: "Adult" },
    { name: "Jane Doe", type: "Adult" },
  ],
  amenities: [
    { icon: <Wifi className="h-4 w-4" />, name: "In-flight Wi-Fi" },
    { icon: <Power className="h-4 w-4" />, name: "Power outlets" },
    {
      icon: <UtensilsCrossed className="h-4 w-4" />,
      name: "Complimentary meals",
    },
  ],
};

export default function Review() {
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
          <div className="text-sm text-muted-foreground">Ticket Price</div>
          <div className="text-3xl font-bold">${bookingDetails.price}</div>
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
          {/* Flight Route in Single Row */}
          <div className="space-y-4">
            {bookingDetails.segments.map((segment, index) => (
              <div
                key={index}
                className="border-[1px] border-gray-300 rounded-lg overflow-hidden bg-white shadow-[inset_0_0_2px_#00000015]"
                style={{ borderStyle: "dashed" }}
              >
                {/* Segment Header */}
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
                          src={`/airlines/${segment.airline.toLowerCase()}.png`}
                          alt={segment.airline}
                          className="h-6 w-6"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {segment.airline} {segment.flightNumber}
                        </span>
                        <span className="px-2 py-0.5 bg-[#000000a6] rounded-full text-xs uppercase font-medium whitespace-nowrap">
                          Economy Class
                        </span>
                      </div>
                    </div>
                    <span className="text-white/80">{segment.duration}</span>
                  </div>
                </div>

                {/* Segment Content */}
                <div className="p-4">
                  {/* Flight Route */}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <div>
                      <div className="font-semibold text-base">
                        {segment.from.code} ({segment.from.name})
                      </div>
                    </div>

                    {/* Flight Path */}
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
                        {segment.to.code} ({segment.to.name})
                      </div>
                    </div>
                  </div>

                  {/* Airport Details */}
                  <div className="flex justify-between text-muted-foreground mt-2">
                    <div>
                      <div className="text-sm">{segment.from.airport}</div>
                      <div className="text-xs mt-2">
                        Terminal: {segment.from.terminal}
                      </div>
                      <div className="text-xs">{segment.departureTime}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm">{segment.to.airport}</div>
                      <div className="text-xs mt-2">
                        Terminal: {segment.to.terminal}
                      </div>
                      <div className="text-xs">{segment.arrivalTime}</div>
                    </div>
                  </div>

                  {/* Aircraft and Baggage */}
                  <div className="text-xs text-muted-foreground flex items-center gap-4 justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Plane className="h-3 w-3 shrink-0" />
                      {segment.aircraft}
                    </div>
                    <div className="flex items-center gap-2">
                      <Luggage className="h-3 w-3 shrink-0" />
                      {segment.baggage.checked} • {segment.baggage.cabin}
                    </div>
                  </div>
                </div>

                {/* Layover Information */}
                {index < bookingDetails.segments.length - 1 && (
                  <div
                    className="pt-4 border-t-[1px] border-gray-300 text-xs text-muted-foreground px-4 pb-4 text-center"
                    style={{ borderTopStyle: "dashed" }}
                  >
                    <Clock className="h-3 w-3 inline mr-1" />
                    Layover: {bookingDetails.layover.duration}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total Duration and Amenities */}
          <Separator />
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div className="space-y-2">
              <div className="font-medium">Total Duration</div>
              <div className="text-sm text-muted-foreground">
                {bookingDetails.totalDuration}
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Onboard Amenities</div>
              <div className="flex gap-4">
                {bookingDetails.amenities.map((amenity, index) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
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
                  <Badge variant="secondary">{passenger.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Baggage Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookingDetails.segments.map((segment, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-sm font-medium">
                    {segment.from.code} → {segment.to.code}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Luggage className="h-4 w-4" />
                    {segment.baggage.checked} • {segment.baggage.cabin}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
