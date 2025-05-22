"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner"; // If you have a spinner
import { Button } from "@/components/ui/button";
import { BookingTicket } from "@/components/BookingTicket"; // We'll create this below
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    fetchBookingDetails(bookingId);
  }, [bookingId]);

  async function fetchBookingDetails(id: string) {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/bookings/${id}/detail`);
      if (!res.ok) {
        throw new Error("Failed to fetch booking details");
      }
      const data = await res.json();
      setBookingData(data.booking);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!bookingData) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Booking Not Found</CardTitle>
        </CardHeader>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Our custom ticket UI */}
      <BookingTicket booking={bookingData} />
    </div>
  );
}
