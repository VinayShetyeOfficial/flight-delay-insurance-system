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
import { CreditCard, CheckCircle } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { ClassicSpinner } from "react-spinners-kit";
import { useRouter } from "next/navigation";

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
  const { temporaryBooking } = useBookingStore();
  const router = useRouter();

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "4242424242424242", // Stripe test card number
      cardHolder: "Test User", // Default cardholder name
      expiryDate: "12/25", // Future expiry date
      cvv: "123", // Default CVV
    },
  });

  // Autofill with passenger name if available
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

  const handleBookingConfirmation = async () => {
    // Gather ALL booking data from localStorage
    const bookingFormData = localStorage.getItem("bookingFormData");
    const selectedFlight = localStorage.getItem("selectedFlight");
    const passengerData = localStorage.getItem("passengerData");
    const addonsData = localStorage.getItem("addonsData");
    const selectedInsurance = localStorage.getItem("selectedInsurance");

    // Parse all stored data
    const completeBookingData = {
      flight: JSON.parse(localStorage.getItem("selectedFlight") || "{}"),
      passengers: JSON.parse(localStorage.getItem("passengerData") || "[]"),
      addons: JSON.parse(localStorage.getItem("addonsData") || "[]"),
      insurance: localStorage.getItem("selectedInsurance"),
      bookingDetails: JSON.parse(
        localStorage.getItem("bookingFormData") || "{}"
      ),
    };

    try {
      // Send complete booking data to API
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeBookingData),
      });

      if (!response.ok) throw new Error("Failed to create booking");

      // Clear localStorage after successful booking
      localStorage.removeItem("selectedFlight");
      localStorage.removeItem("passengerData");
      localStorage.removeItem("addonsData");
      localStorage.removeItem("selectedInsurance");
      localStorage.removeItem("bookingFormData");

      setIsPaymentComplete(true);
    } catch (error) {
      console.error("Booking creation failed:", error);
      // Handle error appropriately
    }
  };

  function onSubmit(values: z.infer<typeof paymentSchema>) {
    setIsProcessing(true); // Start processing state

    // Generate random time between 5000ms (5s) and 12000ms (12s)
    const randomProcessingTime = Math.floor(
      Math.random() * (12000 - 5000 + 1) + 5000
    );

    // Simulate payment processing with random delay
    setTimeout(async () => {
      await handleBookingConfirmation();
      setIsProcessing(false); // End processing state
      setIsPaymentComplete(true);
    }, randomProcessingTime);
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
