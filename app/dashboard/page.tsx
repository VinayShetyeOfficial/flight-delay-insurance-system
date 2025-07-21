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
  ShieldCheck,
  Ticket,
  Users,
  XCircle,
  MapPin,
  User,
  Baby,
  Printer,
  UserRound,
  Check,
  CalendarDays,
} from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCustomDate } from "@/lib/utils";

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
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchUserBookings();
    }
  }, [status, router]);

  useEffect(() => {
    router.prefetch("/booking");
  }, [router]);

  const handleBookingNavigation = useCallback(() => {
    router.push("/booking");
  }, [router]);

  const fetchUserBookings = async () => {
    try {
      // Get user ID from localStorage
      const currentUser = localStorage.getItem("current_user");
      if (!currentUser) {
        console.error("No user found in localStorage");
        return;
      }

      const { id: userId } = JSON.parse(currentUser);

      // Fetch bookings for this user
      const response = await fetch(`/api/bookings?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch bookings");

      const data = await response.json();
      console.log("Fetched bookings:", data); // Debug log
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
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

  async function handleDemoTriggerDelay(bookingId: string) {
    setTriggeringId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/detail`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "Payout Triggered!",
          description: `Transaction Hash: ${data.txHash}`,
          variant: "success",
        });
      } else {
        toast({
          title: "Error triggering payout",
          description: data.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error triggering payout",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTriggeringId(null);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[1024px] mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">
              Manage your bookings and check flight status
            </p>
          </div>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <div className="flex items-center justify-between w-full">
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

            {bookings.length > 0 && (
              <Button
                variant="outline"
                onClick={() => router.push("/booking")}
                className="flex items-center gap-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Plane className="h-4 w-4" />
                Book New Flight
              </Button>
            )}
          </div>

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
              <div className="space-y-4 w-full">
                {bookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="w-full overflow-hidden transition-all border border-zinc-200/80 dark:border-zinc-800/80 group"
                  >
                    <CardContent className="p-0">
                      {/* Header Section */}
                      <div className="px-6 py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 relative overflow-hidden w-full">
                        {/* Decorative Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'/%3E%3C/svg%3E\")",
                            }}
                          />
                        </div>

                        {/* Status Badge - Vibrant green glassy design */}
                        <div
                          className={cn(
                            "absolute top-6 right-6 px-3.5 py-1.5 rounded-full text-sm font-medium",
                            "flex items-center gap-2 shadow-lg backdrop-blur-md",
                            "border border-white/10",
                            "transition-all duration-200",
                            booking.status === "CONFIRMED" && [
                              "bg-emerald-500/40",
                              "text-white",
                              "shadow-emerald-500/30",
                              "hover:bg-emerald-500/50",
                              "border-emerald-400/30",
                            ],
                            booking.status === "PENDING" && [
                              "bg-yellow-400/20",
                              "text-yellow-50",
                              "shadow-yellow-500/20",
                              "hover:bg-yellow-400/30",
                            ],
                            booking.status === "CANCELLED" && [
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
                          {booking.status === "CONFIRMED" && (
                            <div className="bg-emerald-500/40 p-0.5 rounded-full">
                              <Check
                                className="h-3.5 w-3.5 text-white"
                                strokeWidth={2.5}
                              />
                            </div>
                          )}
                          {booking.status === "PENDING" && (
                            <Clock className="h-3.5 w-3.5" />
                          )}
                          {booking.status === "CANCELLED" && (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          <span className="relative z-10 font-medium tracking-wide">
                            {booking.status}
                          </span>
                        </div>

                        {/* Main Flight Info */}
                        {/* 
                        ADD flex-wrap HERE to allow items to wrap on small screens
                      */}
                        <div className="flex flex-wrap items-center gap-5 text-white">
                          {/* <div className="h-16 w-16 rounded-2xl bg-white/95 p-3.5 flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">
                            <Plane className="h-full w-full text-primary rotate-45" />
                          </div> */}
                          <div className="h-16 w-16 rounded-2xl bg-white/95 p-2 flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-300 overflow-hidden">
                            {/* Airline Logo instead of Plane icon */}
                            <div
                              className="h-full w-full"
                              style={{
                                backgroundImage: booking?.flights?.[0]
                                  ?.airlineCode
                                  ? `url(https://assets.wego.com/image/upload/h_240,c_fill,f_auto,fl_lossy,q_auto:best,g_auto/v20250220/flights/airlines_square/${booking.flights[0].airlineCode}.png)`
                                  : "none",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                backgroundSize: "contain",
                              }}
                            />
                            {/* Commented out Plane icon */}
                            {/* <Plane className="h-full w-full text-primary rotate-45" /> */}
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Airline Name and Flight Number */}
                            {/* 
                            ADD flex-wrap HERE so airline name & badge can wrap 
                          */}
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-medium tracking-tight">
                                {booking?.flights?.[0]?.airline}
                              </h3>
                              <Badge
                                variant="outline"
                                className="bg-white/10 text-white border-white/20 px-3 py-1.5 text-sm"
                              >
                                {booking?.flights?.[0]?.flightNumber}
                              </Badge>
                            </div>

                            {/* Flight Route */}
                            {/* 
                            ADD flex-wrap if route is too long 
                          */}
                            <div className="flex flex-wrap items-center gap-4">
                              <h3 className="text-2xl font-bold tracking-tight flex items-center gap-4">
                                <span>{booking?.flights?.[0]?.origin}</span>
                                <Plane className="h-5 w-5 rotate-45" />
                                <span>
                                  {
                                    booking?.flights?.[
                                      booking.flights?.length - 1
                                    ]?.destination
                                  }
                                </span>
                              </h3>
                            </div>

                            {/* City Names */}
                            <p className="text-base text-white/90 flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {
                                booking?.flights?.[0]?.originDetails?.city_name
                              }{" "}
                              to{" "}
                              {
                                booking?.flights?.[booking.flights?.length - 1]
                                  ?.destinationDetails?.city_name
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Flight Card Body - Modern Redesign */}
                      <div className="p-8">
                        {/* 
                        Make this grid responsive:
                        - On small screens => 1 column (stacked)
                        - On md+ screens => 2 columns
                      */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Time and Location Block - Left */}
                          <div className="bg-zinc-100/80 dark:bg-zinc-900/80 rounded-2xl p-6 relative overflow-hidden">
                            {/* Departure & Arrival */}
                            <div className="relative h-full flex flex-col justify-between">
                              {/* Airline Logo Background */}
                              <div
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-48 h-48"
                                style={{
                                  backgroundImage: booking?.flights?.[0]
                                    ?.airlineCode
                                    ? `url(https://assets.wego.com/image/upload/h_240,c_fill,f_auto,fl_lossy,q_auto:best,g_auto/v20250220/flights/airlines_square/${booking.flights[0].airlineCode}.png)`
                                    : "none",
                                  backgroundPosition: "center",
                                  backgroundRepeat: "no-repeat",
                                  backgroundSize: "contain",
                                  filter: "opacity(0.15) grayscale(100%)",
                                }}
                              />

                              {/* Departure (top) */}
                              <div className="flex items-center justify-between relative z-10">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="bg-primary/10 rounded-full p-1.5">
                                      <Clock className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      Departure
                                    </span>
                                  </div>
                                  <div className="space-y-2.5">
                                    <div className="flex flex-col">
                                      <p className="text-lg font-semibold">
                                        {format(
                                          new Date(
                                            booking.flights[0].departureTime
                                          ),
                                          "hh:mm a"
                                        )}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {formatCustomDate(
                                          booking.flights[0].departureTime
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="bg-zinc-200 dark:bg-zinc-800/80 rounded-xl px-3 py-2">
                                    <p className="text-2xl font-bold tracking-tight text-center">
                                      {booking?.flights?.[0]?.origin}
                                    </p>
                                    <div className="flex items-center justify-end gap-1.5 mt-1">
                                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">
                                        Terminal{" "}
                                        {booking?.flights?.[0]
                                          ?.originTerminal || "-"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Flight Path Indicator */}
                              <div className="flex items-center gap-3 px-4 relative z-10 my-4">
                                <div className="h-[2px] bg-gradient-to-r from-primary/20 via-primary to-primary/20 flex-1" />
                                <div className="bg-primary/10 rounded-full p-1.5">
                                  <Plane className="h-3.5 w-3.5 text-primary rotate-45" />
                                </div>
                                <div className="h-[2px] bg-gradient-to-r from-primary/20 via-primary to-primary/20 flex-1" />
                              </div>

                              {/* Arrival (bottom) */}
                              <div className="flex items-center justify-between relative z-10">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="bg-primary/10 rounded-full p-1.5">
                                      <Clock className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      Arrival
                                    </span>
                                  </div>
                                  <div className="space-y-2.5">
                                    <div className="flex flex-col">
                                      <p className="text-lg font-semibold">
                                        {format(
                                          new Date(
                                            booking.flights[
                                              booking.flights.length - 1
                                            ].arrivalTime
                                          ),
                                          "hh:mm a"
                                        )}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {formatCustomDate(
                                          booking.flights[
                                            booking.flights.length - 1
                                          ].arrivalTime
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="bg-zinc-200 dark:bg-zinc-800/80 rounded-xl px-3 py-2">
                                    <p className="text-2xl font-bold tracking-tight text-center">
                                      {
                                        booking?.flights?.[
                                          booking.flights.length - 1
                                        ]?.destination
                                      }
                                    </p>
                                    <div className="flex items-center justify-end gap-1.5 mt-1">
                                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">
                                        Terminal{" "}
                                        {booking?.flights?.[
                                          booking.flights.length - 1
                                        ]?.destTerminal || "-"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Insurance and Passengers Block - Right */}
                          <div className="grid grid-rows-2 gap-4">
                            {/* Insurance Card */}
                            <div className="bg-zinc-100/80 dark:bg-zinc-900/80 rounded-2xl p-6 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-[100px]" />
                              <div className="relative">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="bg-primary/10 rounded-full p-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    Insurance
                                  </span>
                                </div>
                                <p className="text-xl font-semibold capitalize mb-1">
                                  {booking?.insurance?.coverageType
                                    ?.split("-")
                                    .join(" ") || "No Insurance"}
                                </p>
                                {/* Insurance Coverage Badge */}
                                {booking?.insurance?.price && (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800/80 rounded-full text-sm font-medium">
                                    <span>
                                      Coverage: {booking.insurance.price}{" "}
                                      {booking.currency}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Passengers Card */}
                            <div className="bg-zinc-100/80 dark:bg-zinc-900/80 rounded-2xl p-6 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-[100px]" />
                              <div className="relative">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="bg-primary/10 rounded-full p-1.5">
                                    <Users className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    Passengers
                                  </span>
                                </div>
                                <p className="text-xl font-semibold mb-3">
                                  {booking?.passengers?.length || 0}{" "}
                                  {booking?.passengers?.length === 1
                                    ? "Person"
                                    : "People"}
                                </p>
                                {/* Passenger Type Badges */}
                                <div className="flex flex-wrap gap-2">
                                  {booking?.passengers?.some(
                                    (p) => p.passengerType === "ADULT"
                                  ) && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800/80 rounded-full">
                                      <UserRound className="h-3.5 w-3.5 text-primary" />
                                      <span className="text-sm font-medium">
                                        {
                                          booking.passengers.filter(
                                            (p) => p.passengerType === "ADULT"
                                          ).length
                                        }
                                      </span>
                                    </div>
                                  )}
                                  {booking?.passengers?.some(
                                    (p) => p.passengerType === "CHILD"
                                  ) && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800/80 rounded-full">
                                      <User className="h-3.5 w-3.5 text-primary" />
                                      <span className="text-sm font-medium">
                                        {
                                          booking.passengers.filter(
                                            (p) => p.passengerType === "CHILD"
                                          ).length
                                        }
                                      </span>
                                    </div>
                                  )}
                                  {booking?.passengers?.some(
                                    (p) => p.passengerType === "INFANT"
                                  ) && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800/80 rounded-full">
                                      <Baby className="h-3.5 w-3.5 text-primary" />
                                      <span className="text-sm font-medium">
                                        {
                                          booking.passengers.filter(
                                            (p) => p.passengerType === "INFANT"
                                          ).length
                                        }
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="px-6 pb-6 flex justify-between items-center gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                        {/* Demo: Trigger Delay Button on the left */}
                        <Button
                          style={{ minWidth: 160 }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                          size="sm"
                          onClick={() => handleDemoTriggerDelay(booking.id)}
                          disabled={triggeringId === booking.id}
                        >
                          {triggeringId === booking.id
                            ? "Triggering..."
                            : "Demo: Trigger Delay"}
                        </Button>
                        {/* Print and View Ticket buttons on the right */}
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 text-sm"
                            onClick={() => window.print()}
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Print
                          </Button>
                          <Button
                            onClick={() =>
                              router.push(`/dashboard/${booking.id}`)
                            }
                            size="sm"
                            className="flex items-center gap-2 text-sm bg-black hover:bg-black/90"
                          >
                            <Ticket className="h-3.5 w-3.5" />
                            View Ticket
                          </Button>
                        </div>
                      </div>
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
