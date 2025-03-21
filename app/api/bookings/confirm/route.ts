import { NextResponse } from "next/server";
import { createCompleteBooking } from "@/lib/bookingService";

export async function POST(req: Request) {
  try {
    const { userId, bookingData } = await req.json();

    if (!userId || !bookingData) {
      return NextResponse.json(
        { error: "Missing userId or bookingData" },
        { status: 400 }
      );
    }

    const booking = await createCompleteBooking(userId, bookingData);

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error: any) {
    console.error("Error in booking confirmation route:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
