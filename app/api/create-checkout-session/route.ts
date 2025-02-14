import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { bookingConfirmationTemplate } from "@/lib/emailTemplates";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  console.log("Session in checkout:", session);

  if (!session?.user) {
    console.log("No session or user found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { flight, insurance, totalAmount } = await req.json();
    console.log("Creating checkout session with data:", {
      flight,
      insurance,
      totalAmount,
      userId: session.user.id,
      userEmail: session.user.email,
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Flight ${flight.number} with ${insurance.name}`,
              description: `${flight.origin} to ${flight.destination} with ${insurance.description}`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/booking`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        flightNumber: flight.number,
        origin: flight.origin,
        destination: flight.destination,
        departureTime: new Date(flight.departureTime).toISOString(),
        arrivalTime: new Date(flight.arrivalTime).toISOString(),
        flightPrice: flight.price.toString(),
        insuranceName: insurance.name,
        insurancePrice: insurance.price.toString(),
      },
    });

    console.log("Created checkout session:", checkoutSession.id);
    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
