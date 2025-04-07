import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY;
const API_BASE_URL = "https://api.aviationstack.com/v1/flights";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const flightNumber = searchParams.get("flight");

  if (!flightNumber) {
    return NextResponse.json(
      { error: "Flight number is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}?access_key=${AVIATIONSTACK_API_KEY}&flight_iata=${flightNumber}`
    );

    const data = await response.json();
    console.log("Aviation Stack API Response:", JSON.stringify(data, null, 2));

    // Validate the data array exists and has items
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data: data.data });
  } catch (error) {
    console.error("Flight status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flight status" },
      { status: 500 }
    );
  }
}
