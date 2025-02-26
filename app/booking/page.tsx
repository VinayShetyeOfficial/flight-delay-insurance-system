"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
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
  Loader2,
  ArrowLeft,
  LayoutDashboard,
  Package,
  ClipboardCheck,
  CreditCard,
} from "lucide-react";
import { addDays } from "date-fns";
import { cn } from "@/lib/utils";

import FlightCard from "@/components/flight-card";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { LocationSuggestions } from "@/components/location-suggestions";
import { FlightCardSkeleton } from "@/components/flight-card";
import { FlightFilters, FilterOptions } from "@/components/flight-filters";

// Import default select components (using Radix UI)
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Updated Zod Schema with better validation messages
const bookingSchema = z
  .object({
    origin: z
      .string()
      .min(
        1,
        "Please enter an airport code (e.g., LAX) or city name (e.g., London)"
      ),
    originName: z.string().optional(),
    destination: z
      .string()
      .min(
        1,
        "Please enter an airport code (e.g., JFK) or city name (e.g., Paris)"
      ),
    destinationName: z.string().optional(),
    departureDate: z.date({
      required_error: "Departure date is required",
    }),
    returnDate: z.date().optional(),
    adults: z
      .number()
      .min(1, "At least 1 adult is required")
      .max(9, "Maximum 9 adults allowed"),
    children: z
      .number()
      .min(0, "Cannot be negative")
      .max(9, "Maximum 9 children allowed"),
    infants: z
      .number()
      .min(0, "Cannot be negative")
      .max(9, "Maximum 9 infants allowed"),
    class: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
    currency: z.string().nonempty("Currency is required").default("USD"),
    tripType: z.enum(["oneWay", "roundTrip"]),
  })
  .refine((data) => data.origin !== data.destination, {
    message: "Origin and destination airports cannot be the same",
    path: ["destination"],
  })
  .refine(
    (data) => {
      if (data.origin.length === 3) {
        return data.origin.toUpperCase() === data.origin;
      }
      return true;
    },
    {
      message: "Airport code must be 3 uppercase letters (e.g., LAX)",
      path: ["origin"],
    }
  )
  .refine(
    (data) => {
      if (data.destination.length === 3) {
        return data.destination.toUpperCase() === data.destination;
      }
      return true;
    },
    {
      message: "Airport code must be 3 uppercase letters (e.g., JFK)",
      path: ["destination"],
    }
  );

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

const steps = [
  {
    id: "passengers",
    name: "Passenger Info",
    icon: Users,
  },
  {
    id: "addons",
    name: "Add-ons",
    icon: Package,
  },
  {
    id: "review",
    name: "Review",
    icon: ClipboardCheck,
  },
  {
    id: "payment",
    name: "Payment",
    icon: CreditCard,
  },
];

export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const { toast } = useToast();
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(
    null
  );
  // State for Flight Mode (Direct or Layover)
  const [nonStop, setNonStop] = useState<boolean>(false);
  // State for searchId to force re‑logging on each search
  const [searchId, setSearchId] = useState(0);
  // State for pagination: initial display count of 5
  const [displayCount, setDisplayCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // State for last search parameters & error message
  const [lastSearchParams, setLastSearchParams] = useState<{
    origin: string;
    destination: string;
    class: string;
    nonStop: boolean;
  } | null>(null);
  const [currentErrorMessage, setCurrentErrorMessage] = useState<string>("");
  const [originSearchEnabled, setOriginSearchEnabled] = useState(true);
  const [destinationSearchEnabled, setDestinationSearchEnabled] =
    useState(true);
  const [filteredFlights, setFilteredFlights] = useState<any[]>([]);
  const [uniqueAirlines, setUniqueAirlines] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      adults: 1,
      children: 0,
      infants: 0,
      currency: "USD",
      tripType: "roundTrip",
    },
    mode: "onChange",
  });

  // Watch dates, trip type, origin, and destination
  const departureDate = watch("departureDate");
  const returnDate = watch("returnDate");
  const currentTripType = watch("tripType");
  const originValue = watch("origin") || "";
  const destinationValue = watch("destination") || "";

  // Redirect if not logged in.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Handle trip type change.
  const handleTripTypeChange = (type: "oneWay" | "roundTrip") => {
    setValue("tripType", type);
    if (type === "oneWay") {
      setValue("returnDate", undefined);
    } else if (type === "roundTrip" && departureDate) {
      setValue("returnDate", addDays(departureDate, 1));
    }
  };

  // Handle flight mode change.
  const handleFlightModeChange = (isNonStop: boolean) => {
    setNonStop(isNonStop);
    console.log("Flight Mode (nonStop):", isNonStop);
  };

  // Update return date when departure date changes (for round trip only)
  useEffect(() => {
    if (currentTripType === "roundTrip" && departureDate) {
      if (returnDate && returnDate < departureDate) {
        setValue("returnDate", addDays(departureDate, 1));
      }
      if (!returnDate) {
        setValue("returnDate", addDays(departureDate, 1));
      }
    } else if (currentTripType === "oneWay") {
      setValue("returnDate", undefined);
    }
  }, [departureDate, returnDate, currentTripType, setValue]);

  // Helper function for empty-state messages.
  const getFlightClassLabel = (flightClass: string) => {
    switch (flightClass) {
      case "ECONOMY":
        return "Economy Class";
      case "PREMIUM_ECONOMY":
        return "Premium Economy Class";
      case "BUSINESS":
        return "Business Class";
      case "FIRST":
        return "First Class";
      default:
        return flightClass;
    }
  };

  const generateEmptySearchMessage = (params: {
    origin: string;
    destination: string;
    class: string;
    nonStop: boolean;
  }) => {
    const flightClassLabel = getFlightClassLabel(params.class);
    const originUpper = params.origin.toUpperCase();
    const destinationUpper = params.destination.toUpperCase();

    if (params.nonStop) {
      const messages = [
        `No direct ${flightClassLabel} flights available from ${originUpper} to ${destinationUpper}.`,
        `Sorry, no direct ${flightClassLabel} flights found from ${originUpper} to ${destinationUpper}.`,
        `There are no direct ${flightClassLabel} flight options for your route from ${originUpper} to ${destinationUpper}.`,
        `Unfortunately, we couldn't find any direct ${flightClassLabel} flights from ${originUpper} to ${destinationUpper}.`,
        `Direct ${flightClassLabel} flights from ${originUpper} to ${destinationUpper} are currently unavailable.`,
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = [
        `No ${flightClassLabel} flights available from ${originUpper} to ${destinationUpper}.`,
        `Sorry, no ${flightClassLabel} flights found from ${originUpper} to ${destinationUpper}.`,
        `There are no ${flightClassLabel} flight options available for your route from ${originUpper} to ${destinationUpper}.`,
        `Unfortunately, we couldn't find any ${flightClassLabel} flights from ${originUpper} to ${destinationUpper}.`,
        `We regret that there are no ${flightClassLabel} flights between ${originUpper} and ${destinationUpper} at this time.`,
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  };

  // Function to search flights – passes all form inputs directly to the API.
  const searchFlights = async (data: BookingForm) => {
    setIsLoading(true);
    try {
      console.clear();
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: data.origin.trim(),
          destination: data.destination.trim(),
          departureDate: data.departureDate.toISOString().split("T")[0],
          returnDate: data.returnDate
            ? data.returnDate.toISOString().split("T")[0]
            : undefined,
          adults: data.adults,
          children: data.children || 0,
          infants: data.infants || 0,
          class: data.class,
          currency: data.currency,
          nonStop: nonStop,
        }),
      });

      const flights = await response.json();

      console.group("Flight Search Results");
      console.log("Search Parameters:", data);
      console.log("Raw API Response:", flights);
      console.groupEnd();

      if (!response.ok) {
        throw new Error("Flight search failed");
      }

      setFlights(flights);
      // Reset pagination to initial count of 5 when new search is performed.
      setDisplayCount(5);
    } catch (error) {
      console.error("Flight Search Error:", error);
      toast({
        title: "Error",
        description: "Failed to search flights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // onSubmit handler – passes form values to the API.
  const onSubmit = async (data: BookingForm) => {
    setIsLoading(true);
    try {
      console.clear();
      const formattedDepartureDate = data.departureDate
        .toISOString()
        .split("T")[0];

      // Ensure trimmed values for origin and destination
      const searchParams = {
        origin: data.origin.trim().toUpperCase(),
        destination: data.destination.trim().toUpperCase(),
        departureDate: formattedDepartureDate,
        returnDate: data.returnDate
          ? data.returnDate.toISOString().split("T")[0]
          : undefined,
        adults: data.adults,
        children: data.children,
        infants: data.infants,
        class: data.class,
        currency: data.currency,
        nonStop: nonStop,
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
      // Increment searchId so FlightCards know a new search occurred.
      setSearchId((prev) => prev + 1);
      // Reset pagination to initial count of 5.
      setDisplayCount(5);

      // Store search parameters and display error message if no flights are returned.
      const newSearchParams = {
        origin: data.origin,
        destination: data.destination,
        class: data.class,
        nonStop: nonStop,
      };

      setLastSearchParams(newSearchParams);

      if (flightData.length === 0) {
        const newErrorMessage = generateEmptySearchMessage(newSearchParams);
        setCurrentErrorMessage(newErrorMessage);
      } else {
        setCurrentErrorMessage("");
      }
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

  // Handle Show More button – increment displayCount while preserving pagination.
  const handleShowMore = async () => {
    setIsLoadingMore(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDisplayCount((prevCount) => Math.min(prevCount + 8, flights.length));
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Function to render a FlightCard
  const renderFlightCard = (flight: any) => {
    const flightKey = `${flight.id}-${flight.flightNumber}-${searchId}`;
    return <FlightCard key={flightKey} searchId={searchId} {...flight} />;
  };

  // Update filtered flights when the main flights array changes
  useEffect(() => {
    setFilteredFlights(flights);
    const airlines = Array.from(
      new Set(flights.map((flight) => flight.airline))
    );
    setUniqueAirlines(airlines);
  }, [flights]);

  // Handle filter changes
  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = [...flights];

    // Apply airline filters
    if (filters.airlines.length > 0) {
      filtered = filtered.filter((flight) =>
        filters.airlines.includes(flight.airline)
      );
    }

    // Apply non-stop filter
    if (filters.nonStop) {
      filtered = filtered.filter((flight) => !flight.isLayover);
    }

    // Apply cabin class filter
    if (filters.cabinClass.length > 0) {
      filtered = filtered.filter((flight) =>
        filters.cabinClass.includes(flight.cabinClass)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        case "duration_short":
          return a.duration - b.duration;
        case "departure_early":
          return (
            new Date(a.departureTime).getTime() -
            new Date(b.departureTime).getTime()
          );
        case "arrival_early":
          return (
            new Date(a.arrivalTime).getTime() -
            new Date(b.arrivalTime).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredFlights(filtered);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[1024px] mx-auto">
        {/* Page Header with Dashboard Button */}
        <div className="flex flex-col space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Flight Booking
              </h1>
              <p className="text-muted-foreground">
                Search and book flights with insurance coverage
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>

        {/* Booking Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* IMPORTANT: autoComplete="off" on the form + each input */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              autoComplete="off"
            >
              {/* Trip Type & Flight Mode Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Trip Type */}
                <div className="space-y-2">
                  <Label>Trip Type</Label>
                  <div className="flex space-x-2 p-1.5 bg-muted rounded-lg w-fit">
                    <Button
                      type="button"
                      className={`px-4 py-2 transition-colors ${
                        currentTripType === "roundTrip"
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-foreground hover:bg-transparent"
                      }`}
                      onClick={() => handleTripTypeChange("roundTrip")}
                    >
                      <Plane className="mr-2 h-4 w-4 rotate-45" />
                      Round Trip
                    </Button>
                    <Button
                      type="button"
                      className={`px-4 py-2 transition-colors ${
                        currentTripType === "oneWay"
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-foreground hover:bg-transparent"
                      }`}
                      onClick={() => handleTripTypeChange("oneWay")}
                    >
                      <Plane className="mr-2 h-4 w-4" />
                      One Way
                    </Button>
                  </div>
                </div>

                {/* Flight Mode */}
                <div className="space-y-2">
                  <Label>Flight Mode</Label>
                  <div className="flex space-x-2 p-1.5 bg-muted rounded-lg w-fit">
                    <Button
                      type="button"
                      className={`px-4 py-2 transition-colors ${
                        !nonStop
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-foreground hover:bg-transparent"
                      }`}
                      onClick={() => handleFlightModeChange(false)}
                    >
                      Layover
                    </Button>
                    <Button
                      type="button"
                      className={`px-4 py-2 transition-colors ${
                        nonStop
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-foreground hover:bg-transparent"
                      }`}
                      onClick={() => handleFlightModeChange(true)}
                    >
                      Direct
                    </Button>
                  </div>
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
                      autoComplete="off"
                      {...register("origin", {
                        onChange: (e) => {
                          if (!originSearchEnabled) {
                            setOriginSearchEnabled(true);
                          }
                          setValue("origin", e.target.value.trim());
                        },
                      })}
                      placeholder="Enter origin city or airport"
                      className="pl-10"
                    />
                    <LocationSuggestions
                      searchTerm={watch("origin")}
                      onSelect={({ code, name }) => {
                        setValue("origin", code);
                        setValue("originName", name);
                      }}
                      isEnabled={originSearchEnabled}
                      onSearchStateChange={setOriginSearchEnabled}
                    />
                  </div>
                  {errors.origin && (touchedFields.origin || isSubmitted) && (
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
                      autoComplete="off"
                      {...register("destination", {
                        onChange: (e) => {
                          if (!destinationSearchEnabled) {
                            setDestinationSearchEnabled(true);
                          }
                          setValue("destination", e.target.value.trim());
                        },
                      })}
                      placeholder="Enter destination city or airport"
                      className="pl-10"
                    />
                    <LocationSuggestions
                      searchTerm={watch("destination")}
                      onSelect={({ code, name }) => {
                        setValue("destination", code);
                        setValue("destinationName", name);
                      }}
                      isEnabled={destinationSearchEnabled}
                      onSearchStateChange={setDestinationSearchEnabled}
                    />
                  </div>
                  {errors.destination &&
                    (touchedFields.destination || isSubmitted) && (
                      <p className="text-destructive text-sm">
                        {errors.destination.message}
                      </p>
                    )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departure Date</Label>
                  <Controller
                    name="departureDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        setDate={(date) => field.onChange(date)}
                        disablePastDates
                        clearable={false}
                      />
                    )}
                  />
                  {errors.departureDate &&
                    (touchedFields.departureDate || isSubmitted) && (
                      <p className="text-destructive text-sm">
                        {errors.departureDate.message}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Controller
                    name="returnDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        setDate={(date) => field.onChange(date)}
                        disablePastDates
                        disabled={currentTripType === "oneWay"}
                        minDate={departureDate || undefined}
                        clearable={false}
                        placeholder={
                          currentTripType === "oneWay"
                            ? "Not Applicable"
                            : "Pick a date"
                        }
                      />
                    )}
                  />
                </div>
              </div>

              {/* Passengers: Adults, Children, Infants */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Adults</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      autoComplete="off"
                      {...register("adults", { valueAsNumber: true })}
                      min={1}
                      max={9}
                      className="pl-10"
                    />
                  </div>
                  {errors.adults && (touchedFields.adults || isSubmitted) && (
                    <p className="text-destructive text-sm">
                      {errors.adults.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Children (2-12)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      autoComplete="off"
                      {...register("children", { valueAsNumber: true })}
                      min={0}
                      max={9}
                      defaultValue={0}
                      className="pl-10"
                    />
                  </div>
                  {errors.children &&
                    (touchedFields.children || isSubmitted) && (
                      <p className="text-destructive text-sm">
                        {errors.children.message}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label>Infants (0-2)</Label>
                  <div className="relative">
                    <Baby className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      autoComplete="off"
                      {...register("infants", { valueAsNumber: true })}
                      min={0}
                      max={9}
                      defaultValue={0}
                      className="pl-10"
                    />
                  </div>
                  {errors.infants && (touchedFields.infants || isSubmitted) && (
                    <p className="text-destructive text-sm">
                      {errors.infants.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Class & Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Controller
                    name="class"
                    control={control}
                    defaultValue="ECONOMY"
                    render={({ field }) => (
                      <div className="relative">
                        <Select
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ECONOMY">Economy</SelectItem>
                            <SelectItem value="PREMIUM_ECONOMY">
                              Premium Economy
                            </SelectItem>
                            <SelectItem value="BUSINESS">Business</SelectItem>
                            <SelectItem value="FIRST">First</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                  {errors.class && (touchedFields.class || isSubmitted) && (
                    <p className="text-destructive text-sm">
                      {errors.class.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Controller
                    name="currency"
                    control={control}
                    defaultValue="USD"
                    render={({ field }) => (
                      <CurrencySelector
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                  />
                  {errors.currency &&
                    (touchedFields.currency || isSubmitted) && (
                      <p className="text-destructive text-sm">
                        {errors.currency.message}
                      </p>
                    )}
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
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <FlightCardSkeleton key={i} />
            ))}
          </div>
        ) : flights.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Available Flights - Showing{" "}
                {Math.min(displayCount, filteredFlights.length)} of{" "}
                {filteredFlights.length} flights
              </h2>
              <FlightFilters
                airlines={uniqueAirlines}
                onFilterChange={handleFilterChange}
              />
            </div>

            <div className="space-y-4">
              {filteredFlights.slice(0, displayCount).map(renderFlightCard)}
            </div>

            {displayCount < filteredFlights.length && (
              <div className="text-center mt-6">
                <Button
                  onClick={handleShowMore}
                  disabled={isLoadingMore}
                  className="w-full max-w-sm"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Show More Flights"
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          !isLoading &&
          watch("origin")?.length === 3 &&
          watch("destination")?.length === 3 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">
                {currentErrorMessage || "Please search for flights."}
              </p>
            </div>
          )
        )}

        {/* Insurance Options */}
        <Card className="mt-8">
          <div className="p-6 space-y-4">
            <h4 className="font-medium">Insurance Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insuranceOptions.map((option) => (
                <div
                  key={option.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedInsurance === option.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedInsurance(option.id)}
                >
                  <div className="space-y-2">
                    <h5 className="font-medium">{option.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                    <p className="text-lg font-bold">${option.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
