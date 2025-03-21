"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, CheckCircle, TriangleAlert } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { ClassicSpinner } from "react-spinners-kit";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  cardHolder: z.string().min(2, "Cardholder name is required"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

export default function Payment() {
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession({ required: true });
  const { temporaryBooking } = useBookingStore();
  const router = useRouter();

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "4242424242424242",
      cardHolder: "Test User",
      expiryDate: "12/25",
      cvv: "123",
    },
  });

  // Autofill with the first passenger's name if available
  useEffect(() => {
    if (temporaryBooking.passengers.length > 0) {
      const firstPassenger = temporaryBooking.passengers[0];
      form.setValue(
        "cardHolder",
        `${firstPassenger.firstName} ${firstPassenger.lastName}`.trim() ||
          "Test User"
      );
    }
  }, [temporaryBooking.passengers, form]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/booking/payment");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <ClassicSpinner size={30} color="#000" />
      </div>
    );
  }

  // Helper function to safely parse localStorage JSON data.
  // It handles data that may be double-stringified.
  const safeParse = (key: string) => {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    try {
      let parsed = JSON.parse(raw);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      return parsed;
    } catch (error) {
      console.error(`Error parsing localStorage key ${key}:`, error);
      return {};
    }
  };

  // Call the API endpoint to confirm the booking using stored data.
  const handleBookingConfirmation = async () => {
    try {
      if (status !== "authenticated" || !session?.user?.id) {
        router.push("/auth/signin?callbackUrl=/booking/payment");
        throw new Error("Please sign in to complete your booking");
      }

      // Use keys that include the current session's user ID.
      const bookingKey = `user_data_${session.user.id}_booking`;
      const flightKey = `user_data_${session.user.id}_selectedFlight`;

      const bookingDataRaw = localStorage.getItem(bookingKey);
      const selectedFlightRaw = localStorage.getItem(flightKey);

      if (!bookingDataRaw || !selectedFlightRaw) {
        throw new Error(
          `Booking data or selected flight not found in localStorage for user ${session.user.id}.`
        );
      }

      const bookingData = safeParse(bookingKey);
      const selectedFlight = safeParse(flightKey);

      const completeBookingData = {
        flight: selectedFlight,
        ...bookingData,
      };

      console.log("Complete Booking Data:", completeBookingData);

      if (
        !completeBookingData ||
        Object.keys(completeBookingData).length === 0 ||
        !completeBookingData.flight ||
        !completeBookingData.passengers ||
        !completeBookingData.priceBreakdown
      ) {
        throw new Error("Incomplete booking data. Please complete all steps.");
      }

      const response = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          bookingData: completeBookingData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }
      const booking = await response.json();

      // Clear stored data upon successful booking
      localStorage.removeItem(bookingKey);
      localStorage.removeItem(flightKey);

      setIsPaymentComplete(true);
      return booking;
    } catch (error) {
      console.error("Booking creation failed:", error);
      throw error;
    }
  };

  async function onSubmit(values: z.infer<typeof paymentSchema>) {
    setIsProcessing(true);
    setError(null);

    try {
      console.log("Payment data:", {
        selectedFlight: localStorage.getItem(
          `user_data_${session?.user?.id}_selectedFlight`
        ),
        bookingData: localStorage.getItem(
          `user_data_${session?.user?.id}_booking`
        ),
      });

      // Simulate payment processing delay (5-12 seconds)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * (12000 - 5000) + 5000)
      );

      const booking = await handleBookingConfirmation();
      console.log("Booking confirmed:", booking);

      setIsPaymentComplete(true);
    } catch (error) {
      console.error("Payment processing failed:", error);
      setError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  }

  if (isProcessing) {
    return (
      <div className="relative min-h-[350px]">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
          <div className="text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <ClassicSpinner size={50} color="#0066FF" loading={true} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Payment Processing</h2>
            <p className="text-muted-foreground mb-6">
              Please hold on, while we securely process your transaction
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isPaymentComplete) {
    return (
      <div className="relative min-h-[350px]">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
          <div className="text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your booking. Your flight is confirmed.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-black hover:bg-black/90 text-white"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-[350px]">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
          <div className="text-center">
            <TriangleAlert className="h-20 w-20 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Payment Failed</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button
              onClick={() => setError(null)}
              className="bg-black hover:bg-black/90 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payment</h2>
        <p className="text-muted-foreground">
          Enter your payment details to complete your booking
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Details
          </CardTitle>
          <CardDescription>
            This is a test payment environment with pre-filled Stripe test card
            details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="4242 4242 4242 4242"
                        {...field}
                        readOnly
                        className="cursor-not-allowed bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardHolder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        readOnly
                        className="cursor-not-allowed bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="MM/YY"
                          {...field}
                          readOnly
                          className="cursor-not-allowed bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123"
                          type="password"
                          maxLength={4}
                          {...field}
                          readOnly
                          className="cursor-not-allowed bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Complete Payment
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
