"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { loadStripe } from "@stripe/stripe-js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  User,
  Users,
  Baby,
  Search,
  Filter,
  Clock,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { flightService } from "../../lib/flightService";

// AI-Suggested imports
import { format } from "date-fns";

// -----------------------------------------------------------------------------
// Updated Zod Schema to match AI suggestion
// -----------------------------------------------------------------------------
const bookingSchema = z.object({
  origin: z.string().min(3, "Origin must be at least 3 characters"),
  destination: z.string().min(3, "Destination must be at least 3 characters"),
  departureDate: z.date(),
  returnDate: z.date().optional(),
  adults: z.number().min(1, "At least 1 adult is required").max(9),
  children: z.number().min(0).max(9),
  infants: z.number().min(0).max(9),
  class: z.enum(["Economy", "Business", "First"]),
  currency: z.string().default("USD"),
});

type BookingForm = z.infer<typeof bookingSchema>;

// Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

//
// Insurance Options
//
const insuranceOptions = [
  {
    id: "basic",
    name: "Basic Coverage",
    price: 20,
    description: "Covers up to 2 hours of delay",
  },
  {
    id: "standard",
    name: "Standard Coverage",
    price: 40,
    description: "Covers up to 4 hours of delay",
  },
  {
    id: "premium",
    name: "Premium Coverage",
    price: 60,
    description: "Covers any delay and cancellation",
  },
];

export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const { toast } = useToast();
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(
    null
  );
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("price");
  const [tripType, setTripType] = useState<"oneWay" | "roundTrip">("roundTrip");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      // Default values for new fields
      adults: 1,
      children: 0,
      infants: 0,
      currency: "USD",
    },
  });

  // Watchers
  const departureDate = watch("departureDate");

  //
  // If user is not logged in, redirect
  //
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  //
  // If departure date changes, default return date to the same day
  // (only if we don't have a value already).
  //
  useEffect(() => {
    if (departureDate && tripType === "roundTrip") {
      setValue("returnDate", departureDate);
    }
  }, [departureDate, setValue, tripType]);

  // ---------------------------------------------------------------------------
  // AI-Suggested: Updated searchFlights function with new fields & URL
  // ---------------------------------------------------------------------------
  const searchFlights = async (data: BookingForm) => {
    setIsLoading(true);
    try {
      // Format the date to YYYY-MM-DD
      const formattedDate = data.departureDate.toISOString().split("T")[0];

      const searchParams = {
        origin: data.origin.toUpperCase(),
        destination: data.destination.toUpperCase(),
        departureDate: formattedDate,
        adults: data.adults,
        children: data.children,
        infants: data.infants,
        class: data.class,
        currency: data.currency,
      };

      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const flightData = await response.json();

      if (flightData.error) {
        throw new Error(flightData.error);
      }

      setFlights(flightData);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch flights",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  //
  // onSubmit
  //
  const onSubmit = async (data: BookingForm) => {
    setIsLoading(true);

    try {
      // Format the date to YYYY-MM-DD
      const formattedDate = data.departureDate.toISOString().split("T")[0];

      const searchParams = {
        origin: data.origin.toUpperCase(),
        destination: data.destination.toUpperCase(),
        departureDate: formattedDate,
        adults: data.adults,
        children: data.children,
        infants: data.infants,
        class: data.class,
        currency: data.currency,
      };

      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const flightData = await response.json();

      if (flightData.error) {
        throw new Error(flightData.error);
      }

      setFlights(flightData);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch flights",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  //
  // Handle booking: create Stripe session
  //
  const handleBooking = async (flight: any) => {
    if (status !== "authenticated") {
      toast({
        title: "Error",
        description: "Please log in to book a flight",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    try {
      setIsLoading(true);
      const insuranceOption = insuranceOptions.find(
        (option) => option.id === selectedInsurance
      );
      if (!insuranceOption) {
        throw new Error("Please select an insurance option");
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flight: {
            id: flight.id,
            number: flight.flightNumber,
            origin: flight.origin,
            destination: flight.destination,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            price: flight.price,
          },
          insurance: {
            id: insuranceOption.id,
            name: insuranceOption.name,
            price: insuranceOption.price,
            description: insuranceOption.description,
          },
          totalAmount: flight.price + insuranceOption.price,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { sessionId } = data;
      if (!sessionId) {
        throw new Error("No session ID returned from server");
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  //
  // Filter + Sort flights
  //
  const filteredAndSortedFlights = flights
    .filter(
      (flight: any) =>
        flight.price >= priceRange[0] &&
        flight.price <= priceRange[1] &&
        (selectedAirlines.length === 0 ||
          selectedAirlines.includes(flight.airline))
    )
    .sort((a: any, b: any) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "duration") return a.duration - b.duration;
      return 0;
    });

  //
  // Gather unique airlines
  //
  const airlines = Array.from(
    new Set(flights.map((flight: any) => flight.airline))
  );

  //
  // Loading state
  //
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  //
  // Render
  //
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[1024px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Flight Booking</h1>
          <p className="text-muted-foreground">
            Search and book flights with insurance coverage
          </p>
        </div>

        {/* Booking Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Trip Type Selection */}
              <div className="space-y-2">
                <Label>Trip Type</Label>
                <div className="flex space-x-2 p-1.5 bg-muted rounded-lg w-fit">
                  <Button
                    type="button"
                    className={`px-4 py-2 transition-colors
                      ${
                        tripType === "roundTrip"
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-foreground hover:bg-transparent"
                      }`}
                    onClick={() => {
                      setTripType("roundTrip");
                      setValue("tripType", "roundTrip");
                    }}
                  >
                    <Plane className="mr-2 h-4 w-4 rotate-45" />
                    Round Trip
                  </Button>
                  <Button
                    type="button"
                    className={`px-4 py-2 transition-colors
                      ${
                        tripType === "oneWay"
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-foreground hover:bg-transparent"
                      }`}
                    onClick={() => {
                      setTripType("oneWay");
                      setValue("tripType", "oneWay");
                      setValue("returnDate", null);
                    }}
                  >
                    <Plane className="mr-2 h-4 w-4" />
                    One Way
                  </Button>
                </div>
              </div>

              {/* Origin & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <div className="relative">
                    <PlaneTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="origin"
                      {...register("origin")}
                      placeholder="Enter origin city"
                      className="pl-10"
                    />
                  </div>
                  {errors.origin && (
                    <p className="text-destructive text-sm">
                      {errors.origin.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <div className="relative">
                    <PlaneLanding className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="destination"
                      {...register("destination")}
                      placeholder="Enter destination city"
                      className="pl-10"
                    />
                  </div>
                  {errors.destination && (
                    <p className="text-destructive text-sm">
                      {errors.destination.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Departure Date */}
                <div className="space-y-2">
                  <Label>Departure Date</Label>
                  <Controller
                    name="departureDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        setDate={(val) => field.onChange(val)}
                        disablePastDates
                      />
                    )}
                  />
                  {errors.departureDate && (
                    <p className="text-destructive text-sm">
                      {errors.departureDate.message}
                    </p>
                  )}
                </div>

                {/* Return Date */}
                <div className="space-y-2">
                  <Label
                    className={
                      tripType === "oneWay" ? "text-muted-foreground" : ""
                    }
                  >
                    Return Date
                  </Label>
                  <div className={tripType === "oneWay" ? "opacity-100" : ""}>
                    <Controller
                      name="returnDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          date={field.value}
                          setDate={(val) => field.onChange(val)}
                          disablePastDates
                          minDate={watch("departureDate")}
                          defaultMonth={watch("departureDate")}
                          disabled={tripType === "oneWay"}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Passengers: Adults, Children, Infants */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Adults */}
                <div className="space-y-2">
                  <Label>Adults</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      {...register("adults", { valueAsNumber: true })}
                      min={1}
                      max={9}
                      className="pl-10"
                    />
                  </div>
                  {errors.adults && (
                    <p className="text-destructive text-sm">
                      {errors.adults.message}
                    </p>
                  )}
                </div>

                {/* Children */}
                <div className="space-y-2">
                  <Label>Children (2-12)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      {...register("children", { valueAsNumber: true })}
                      min={0}
                      max={9}
                      defaultValue={0}
                      className="pl-10"
                    />
                  </div>
                  {errors.children && (
                    <p className="text-destructive text-sm">
                      {errors.children.message}
                    </p>
                  )}
                </div>

                {/* Infants */}
                <div className="space-y-2">
                  <Label>Infants (0-2)</Label>
                  <div className="relative">
                    <Baby className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      {...register("infants", { valueAsNumber: true })}
                      min={0}
                      max={9}
                      defaultValue={0}
                      className="pl-10"
                    />
                  </div>
                  {errors.infants && (
                    <p className="text-destructive text-sm">
                      {errors.infants.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Class & Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class */}
                <div className="space-y-2">
                  <Label>Class</Label>
                  <div className="relative">
                    <Select {...register("class")} defaultValue="Economy">
                      <option value="Economy">Economy</option>
                      <option value="Business">Business</option>
                      <option value="First">First</option>
                    </Select>
                  </div>
                  {errors.class && (
                    <p className="text-destructive text-sm">
                      {errors.class.message}
                    </p>
                  )}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    type="text"
                    {...register("currency")}
                    defaultValue="USD"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex justify-center pt-2">
                <Button
                  type="submit"
                  className="w-[200px]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Flights
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Flight Results */}
        {flights.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Available Flights</h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </div>

            <Card className="border shadow-sm">
              <div className="p-4 space-y-4">
                {filteredAndSortedFlights.map((flight) => (
                  <Card
                    key={flight.id}
                    className="p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Plane className="h-5 w-5 text-primary" />
                            {flight.airline}
                          </h3>
                          <div className="flex items-center gap-2">
                            <p className="text-muted-foreground">
                              Flight {flight.flightNumber}
                            </p>
                            {flight.status && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  flight.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : flight.status === "scheduled"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {flight.status.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          {/* Left side: Departure */}
                          <div className="flex flex-col items-start">
                            <p className="text-2xl font-semibold">
                              {flight.departureTime}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {flight.origin}
                            </p>
                            {flight.terminal?.departure && (
                              <p className="text-xs text-muted-foreground">
                                Terminal {flight.terminal.departure}
                              </p>
                            )}
                          </div>

                          {/* Middle: Flight duration line with plane */}
                          <div className="flex-1 flex flex-col items-center self-baseline mt-[3px]">
                            <div className="w-full flex items-center gap-2 text-muted-foreground">
                              •
                              <div className="h-[1px] w-[100px] flex-1 border-t-[2.5px] border-dashed border-gray-300" />
                              <Plane className="h-4 w-4 text-muted-foreground rotate-45" />
                              <div className="h-[1px] w-[100px] flex-1 border-t-[2.5px] border-dashed border-gray-300" />
                              •
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              {Math.floor(flight.duration / 60)}h{" "}
                              {flight.duration % 60}m • Direct
                            </span>
                          </div>

                          {/* Right side: Arrival */}
                          <div className="flex flex-col items-end">
                            <p className="text-2xl font-semibold">
                              {flight.arrivalTime}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {flight.destination}
                            </p>
                            {flight.terminal?.arrival && (
                              <p className="text-xs text-muted-foreground">
                                Terminal {flight.terminal.arrival}
                              </p>
                            )}
                          </div>
                        </div>

                        {flight.aircraft && (
                          <p className="text-sm text-muted-foreground">
                            Aircraft: {flight.aircraft}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-3xl font-bold text-primary">
                          ${flight.price}
                        </p>
                        <Button
                          onClick={() => handleBooking(flight)}
                          className="mt-4"
                          size="lg"
                        >
                          Select Flight
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <h4 className="font-medium">Insurance Options</h4>
                      <RadioGroup
                        onValueChange={setSelectedInsurance}
                        value={selectedInsurance || undefined}
                        className="grid grid-cols-3 gap-4"
                      >
                        {insuranceOptions.map((option) => (
                          <Card
                            key={option.id}
                            className={`p-4 cursor-pointer transition-all ${
                              selectedInsurance === option.id
                                ? "border-primary shadow-md"
                                : "hover:border-primary/50"
                            }`}
                            onClick={() => setSelectedInsurance(option.id)}
                          >
                            <RadioGroupItem
                              value={option.id}
                              id={option.id}
                              className="hidden"
                            />
                            <div className="space-y-2">
                              <h5 className="font-medium">{option.name}</h5>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                              <p className="font-bold">${option.price}</p>
                            </div>
                          </Card>
                        ))}
                      </RadioGroup>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
