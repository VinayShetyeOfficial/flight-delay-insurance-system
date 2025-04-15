import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

// This is a mock function. In a real application, you would integrate with a flight status API.
function mockFlightStatus(flightNumber: string) {
  const statuses = ["On Time", "Delayed", "Cancelled"]
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
  return { status: randomStatus }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const flightNumber = searchParams.get("flightNumber")

  if (!flightNumber) {
    return NextResponse.json({ error: "Flight number is required" }, { status: 400 })
  }

  try {
    // In a real application, you would call an actual flight status API here
    const flightStatus = mockFlightStatus(flightNumber)

    return NextResponse.json(flightStatus)
  } catch (error) {
    console.error("Error fetching flight status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

