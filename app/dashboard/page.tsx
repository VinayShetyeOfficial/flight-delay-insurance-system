"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Clock, Plane, Calendar } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [flightNumberToCheck, setFlightNumberToCheck] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { bookings, setBookings, updateBookingStatus } = useBookingStore();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkFlightStatus = async (flightNumber: string) => {
    try {
      const response = await fetch(
        `/api/flight-status?flightNumber=${flightNumber}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch flight status");
      }
      const data = await response.json();
      updateBookingStatus(flightNumber, data.status);
      toast({
        title: "Flight Status Updated",
        description: `Flight ${flightNumber} status: ${data.status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check flight status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (flightNumberToCheck) {
      checkFlightStatus(flightNumberToCheck);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[1024px] mx-auto">
        <div className="flex flex-col space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Manage your bookings and check flight status
          </p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger
              value="flightStatus"
              className="flex items-center gap-2"
            >
              <Plane className="h-4 w-4" />
              Flight Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Plane className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground text-center mb-8 max-w-sm">
                  Start your journey by booking a flight with insurance coverage
                </p>
                <Button
                  onClick={() => router.push("/booking")}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Book a New Flight
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>
                          {booking.origin} to {booking.destination}
                        </span>
                        {booking.status && (
                          <span
                            className={`text-sm px-2 py-1 rounded ${
                              booking.status === "On Time"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "Delayed"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {booking.status === "On Time" && (
                              <CheckCircle className="inline-block mr-1 h-4 w-4" />
                            )}
                            {booking.status === "Delayed" && (
                              <Clock className="inline-block mr-1 h-4 w-4" />
                            )}
                            {booking.status === "Cancelled" && (
                              <AlertCircle className="inline-block mr-1 h-4 w-4" />
                            )}
                            {booking.status}
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Flight: {booking.flightNumber}</p>
                      <p>Departure: {booking.departureTime}</p>
                      <p>Arrival: {booking.arrivalTime}</p>
                      <p>Insurance: {booking.insuranceType || "None"}</p>
                      <Button
                        className="mt-4"
                        onClick={() => checkFlightStatus(booking.flightNumber)}
                      >
                        Check Status
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="flightStatus">
            <Card className="border shadow-sm transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" />
                  Check Flight Status
                </CardTitle>
                <CardDescription>
                  Enter your flight number to get real-time status updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckStatus} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="flightNumber">Flight Number</Label>
                    <Input
                      id="flightNumber"
                      value={flightNumberToCheck}
                      onChange={(e) => setFlightNumberToCheck(e.target.value)}
                      placeholder="e.g., AA1234"
                      className="max-w-sm"
                    />
                  </div>
                  <Button type="submit" className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Check Status
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
