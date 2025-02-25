"use client";

import { useEffect, useState, useCallback } from "react";
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
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Plane,
  Calendar,
  Loader2,
  Building2,
  Luggage,
  Timer,
  Terminal,
  CircleDot,
  CalendarClock,
  Fence,
  MountainSnow,
  Gauge,
  Compass,
} from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusColors: Record<string, { color: string; icon: React.ReactNode }> = {
  active: {
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: <Plane className="h-4 w-4" />,
  },
  scheduled: {
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    icon: <Calendar className="h-4 w-4" />,
  },
  landed: {
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  cancelled: {
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  diverted: {
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    icon: <AlertCircle className="h-4 w-4" />,
  },
};

const FlightStatus = ({ flight }: { flight: any }) => {
  const status = flight.flight_status || "unknown";
  const statusColor =
    statusColors[status]?.color ||
    "bg-gray-500/10 text-gray-500 border-gray-500/20";
  const StatusIcon = statusColors[status]?.icon || (
    <AlertCircle className="h-4 w-4" />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 relative overflow-hidden"
    >
      {/* Background Airline Logo */}
      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: flight.airline?.icao
            ? `url(https://www.flightaware.com/images/airline_logos/180px/${flight.airline.icao}.png)`
            : "none",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transform: "scale(1.5)",
        }}
      />

      <div className="relative z-10">
        <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">
                {flight.airline?.name || "Unknown Airline"} - Flight{" "}
                {flight.flight?.iata || "Unknown"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Flight Date:{" "}
                {flight.flight_date
                  ? format(new Date(flight.flight_date), "MMMM d, yyyy")
                  : "Unknown"}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-medium">
                Aircraft: {flight.aircraft?.iata || "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground">
                Reg: {flight.aircraft?.registration || "Unknown"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Badge
              variant="outline"
              className={cn("px-3 py-2 capitalize", statusColor)}
            >
              {StatusIcon}
              <span className="ml-1">{status}</span>
            </Badge>
          </div>
        </div>
        {/* Flight Route - Adjust spacing for mobile */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-y-1/2 w-px h-full bg-zinc-200 dark:bg-zinc-800" />

            {/* Departure */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="rounded-full bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3">
                  <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Departure
                  </p>
                  <h4 className="text-base sm:text-lg font-semibold mt-1 break-words">
                    {flight.departure.airport}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span>Terminal {flight.departure.terminal || "-"}</span>
                    {flight.departure.gate && (
                      <>
                        <CircleDot className="h-3 w-3 flex-shrink-0" />
                        <Fence className="h-4 w-4 flex-shrink-0" />
                        <span>Gate {flight.departure.gate}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Scheduled:{" "}
                      {format(new Date(flight.departure.scheduled), "HH:mm")}
                    </span>
                  </div>
                  {flight.departure.actual && (
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Actual:{" "}
                        {format(new Date(flight.departure.actual), "HH:mm")}
                      </span>
                    </div>
                  )}
                  {flight.departure.delay && (
                    <div className="flex items-center gap-2 text-sm text-red-500">
                      <Clock className="h-4 w-4" />
                      <span>Delay: {flight.departure.delay}min</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Arrival */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="rounded-full bg-green-50 dark:bg-green-900/20 p-2 sm:p-3">
                  <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 transform rotate-90" />
                </div>
                <div className="min-w-0 flex-1  space-y-1">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Arrival
                  </p>
                  <h4 className="text-base sm:text-lg font-semibold mt-1 break-words">
                    {flight.arrival.airport}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span>Terminal {flight.arrival.terminal || "-"}</span>
                    {flight.arrival.gate && (
                      <>
                        <CircleDot className="h-3 w-3 flex-shrink-0" />
                        <Fence className="h-4 w-4 flex-shrink-0" />
                        <span>Gate {flight.arrival.gate}</span>
                      </>
                    )}
                    {flight.arrival.baggage && (
                      <>
                        <CircleDot className="h-3 w-3 flex-shrink-0" />
                        <Luggage className="h-4 w-4 flex-shrink-0" />
                        <span>Baggage {flight.arrival.baggage}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Scheduled:{" "}
                      {format(new Date(flight.arrival.scheduled), "HH:mm")}
                    </span>
                  </div>
                  {flight.arrival.actual && (
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Actual:{" "}
                        {format(new Date(flight.arrival.actual), "HH:mm")}
                      </span>
                    </div>
                  )}
                  {flight.arrival.delay && (
                    <div className="flex items-center gap-2 text-sm text-red-500">
                      <Clock className="h-4 w-4" />
                      <span>Delay: {flight.arrival.delay}min</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Live Flight Data - Adjust grid for mobile */}
          {flight.live && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 sm:mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800"
            >
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MountainSnow className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Altitude</p>
                  </div>
                  <p className="text-base sm:text-lg font-semibold mt-1">
                    {Math.round(flight.live.altitude)}m
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Ground Speed
                    </p>
                  </div>
                  <p className="text-base sm:text-lg font-semibold mt-1">
                    {Math.round(flight.live.speed_horizontal)}km/h
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Direction</p>
                  </div>
                  <p className="text-base sm:text-lg font-semibold mt-1">
                    {Math.round(flight.live.direction)}°
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Last Updated
                    </p>
                  </div>
                  <p className="text-base sm:text-lg font-semibold mt-1">
                    {format(new Date(flight.live.updated), "HH:mm")}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [flightNumberToCheck, setFlightNumberToCheck] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { bookings, setBookings } = useBookingStore();
  const [flightStatus, setFlightStatus] = useState<any[] | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchBookings();
    }
  }, [status, router]);

  useEffect(() => {
    router.prefetch("/booking");
  }, [router]);

  const handleBookingNavigation = useCallback(() => {
    router.push("/booking");
  }, [router]);

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

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim the flight number and remove any whitespace
    const trimmedFlightNumber = flightNumberToCheck.trim();

    if (!trimmedFlightNumber) {
      toast({
        title: "Error",
        description: "Please enter a flight number",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingStatus(true);
    try {
      const response = await fetch(
        `/api/flight-status?flight=${trimmedFlightNumber}`
      );
      const result = await response.json();

      console.log("Flight Status Data:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch flight status");
      }

      const flightsArray = result.data || [];
      if (flightsArray.length === 0) {
        toast({
          title: "No Flights Found",
          description: "No matching flights were found for this flight number.",
          variant: "destructive",
        });
        setFlightStatus([]);
      } else {
        setFlightStatus(flightsArray);
        toast({
          title: "Flight Status",
          description: `Found ${flightsArray.length} flight(s).`,
        });
      }
    } catch (error: any) {
      console.error("Flight Status Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to check flight status",
        variant: "destructive",
      });
      setFlightStatus([]);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const formatDelay = (delay: number | null) => {
    if (!delay) return null;
    const hours = Math.floor(delay / 60);
    const minutes = delay % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${minutes}min`;
  };

  const formatDateTime = (dateString?: string | null) =>
    dateString ? new Date(dateString).toLocaleString() : "N/A";

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
          <TabsList className="grid w-full grid-cols-2 max-w-[500px] p-2 h-auto bg-[#5d5d5d0f]">
            <TabsTrigger
              value="bookings"
              className="flex items-center gap-3 py-4 text-base font-medium"
            >
              <Calendar className="h-5 w-5" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger
              value="flightStatus"
              className="flex items-center gap-3 py-4 text-base font-medium"
            >
              <Plane className="h-5 w-5" />
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
                  onClick={handleBookingNavigation}
                  size="lg"
                  className="flex items-center gap-2 bg-black hover:bg-black/90"
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
                        onClick={() => {
                          setFlightNumberToCheck(booking.flightNumber);
                          handleCheckStatus(new Event("submit") as any);
                        }}
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
            <Card>
              <CardHeader>
                <CardTitle>Check Flight Status</CardTitle>
                <CardDescription>
                  Enter your flight number to get real-time status updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckStatus} className="space-y-4">
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
                  <Button
                    type="submit"
                    disabled={isCheckingStatus}
                    className="flex items-center gap-2"
                  >
                    {isCheckingStatus ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Plane className="h-4 w-4" />
                        Check Status
                      </>
                    )}
                  </Button>
                </form>

                {flightStatus !== null && (
                  <>
                    {flightStatus.length > 0 ? (
                      <div className="mt-6 space-y-6">
                        {flightStatus.map((flight, index) =>
                          flight &&
                          flight.airline &&
                          flight.flight &&
                          flight.departure &&
                          flight.arrival ? (
                            <FlightStatus key={index} flight={flight} />
                          ) : null
                        )}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 text-center p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl"
                      >
                        <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
                        <p className="text-lg font-semibold mt-2">
                          No flight data available.
                        </p>
                      </motion.div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
