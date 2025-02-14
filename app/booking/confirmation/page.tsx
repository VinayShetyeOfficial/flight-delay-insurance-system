"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface BookingDetails {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  insurance: {
    coverageType: string;
    terms: string;
    price: number;
  };
}

export default function BookingConfirmationPage() {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      const checkBookingStatus = async () => {
        try {
          const response = await fetch(
            `/api/bookings/confirmation?session_id=${sessionId}`
          );
          const data = await response.json();

          if (response.status === 404 && data.processing) {
            // If booking is still processing, retry after 2 seconds
            setTimeout(checkBookingStatus, 2000);
            return;
          } else if (!response.ok) {
            throw new Error("Failed to fetch booking details");
          }
          if (data.id) {
            setBooking(data);
            setIsLoading(false);
          } else {
            // If booking not found, retry after 2 seconds
            setTimeout(checkBookingStatus, 2000);
          }
        } catch (error) {
          console.error("Error fetching booking:", error);
          toast({
            title: "Error",
            description: "Failed to load booking details. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      };

      checkBookingStatus();
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <LoadingSpinner />
              <p className="mt-4 text-lg">Processing your booking...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <p className="text-lg text-red-500">Booking not found</p>
              <Button onClick={() => router.push("/booking")} className="mt-4">
                Book a New Flight
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold mb-6">Booking Confirmation</h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Flight Details</h2>
              <p>Flight Number: {booking.flightNumber}</p>
              <p>From: {booking.origin}</p>
              <p>To: {booking.destination}</p>
              <p>
                Departure: {new Date(booking.departureTime).toLocaleString()}
              </p>
              <p>Arrival: {new Date(booking.arrivalTime).toLocaleString()}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Insurance Details</h2>
              <p>Coverage: {booking.insurance.coverageType}</p>
              <p>Terms: {booking.insurance.terms}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Price Breakdown</h2>
              <p>Flight: ${booking.price}</p>
              <p>Insurance: ${booking.insurance.price}</p>
              <p className="font-bold">
                Total: ${booking.price + booking.insurance.price}
              </p>
            </div>
          </div>
          <Button onClick={() => router.push("/dashboard")} className="mt-6">
            View Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
