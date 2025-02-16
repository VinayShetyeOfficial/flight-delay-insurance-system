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
  Calendar,
  PlaneTakeoff,
  PlaneLanding,
  Users,
  Search,
  Filter,
  Clock,
  Star,
  Loader2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const bookingSchema = z.object({
  origin: z.string().min(3, "Origin must be at least 3 characters"),
  destination: z.string().min(3, "Destination must be at least 3 characters"),
  departureDate: z.date(),
  returnDate: z.date().optional(),
  passengers: z
    .number()
    .min(1, "At least 1 passenger is required")
    .max(10, "Maximum 10 passengers allowed"),
  class: z.enum(["economy", "business", "first"]),
});

type BookingForm = z.infer<typeof bookingSchema>;

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

const isPastDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

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

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  const departureDate = watch("departureDate");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (departureDate) {
      setValue("returnDate", departureDate);
    }
  }, [departureDate, setValue]);

  const onSubmit = async (data: BookingForm) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const flightData = await response.json();
        setFlights(flightData);
      } else {
        throw new Error("Failed to fetch flights");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch flights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        headers: {
          "Content-Type": "application/json",
        },
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

  const airlines = Array.from(
    new Set(flights.map((flight: any) => flight.airline))
  );

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[1024px] mx-auto">
        <div className="flex flex-col space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Flight Booking</h1>
          <p className="text-muted-foreground">
            Search and book flights with insurance coverage
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Departure Date</Label>
                  <div className="relative">
                    <Controller
                      name="departureDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          date={field.value}
                          setDate={(date) => field.onChange(date)}
                          disablePastDates={true}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Return Date (Optional)</Label>
                  <div className="relative">
                    <Controller
                      name="returnDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          date={field.value}
                          setDate={(date) => field.onChange(date)}
                          disablePastDates={true}
                          minDate={departureDate}
                          defaultMonth={departureDate}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Passengers & Class */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Number of Passengers</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      {...register("passengers", { valueAsNumber: true })}
                      min={1}
                      max={10}
                      className="pl-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Class</Label>
                  <div className="relative">
                    <Select {...register("class")} defaultValue="economy">
                      <option value="economy">Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First Class</option>
                    </Select>
                  </div>
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
                {filteredAndSortedFlights.map((flight: any) => (
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
                          <div>
                            <p className="font-medium">
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
                          <div className="flex-1 border-t border-dashed relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {flight.duration && (
                                <span className="text-xs text-muted-foreground mt-1">
                                  {Math.floor(flight.duration / 60)}h{" "}
                                  {flight.duration % 60}m
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">{flight.arrivalTime}</p>
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
