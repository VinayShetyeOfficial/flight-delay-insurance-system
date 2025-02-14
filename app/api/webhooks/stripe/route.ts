import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { bookingConfirmationTemplate } from "@/lib/emailTemplates";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});
const prisma = new PrismaClient();

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature");

  let event: Stripe.Event;

  try {
    console.log("Received webhook with signature:", sig);
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret!);
    console.log("Webhook verified, type:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Full session data:", session);
      console.log("Session metadata:", session.metadata);

      try {
        // Create booking in database
        const booking = await prisma.booking.create({
          data: {
            userId: session.metadata?.userId!,
            flightNumber: session.metadata?.flightNumber!,
            departureTime: new Date(session.metadata?.departureTime!),
            arrivalTime: new Date(session.metadata?.arrivalTime!),
            origin: session.metadata?.origin!,
            destination: session.metadata?.destination!,
            price: parseFloat(session.metadata?.flightPrice!),
            insurance: {
              create: {
                coverageType: session.metadata?.insuranceName!,
                price: parseFloat(session.metadata?.insurancePrice!),
                terms: `Coverage for ${session.metadata?.insuranceName}`,
              },
            },
          },
          include: {
            insurance: true,
          },
        });

        console.log("Successfully created booking:", booking);

        // Send confirmation email
        if (session.customer_details?.email) {
          await sendEmail({
            to: session.customer_details.email,
            subject: "Booking Confirmation",
            html: bookingConfirmationTemplate(booking),
          });
        }

        return NextResponse.json({ success: true, bookingId: booking.id });
      } catch (error) {
        console.error("Detailed error creating booking:", error);
        return NextResponse.json(
          {
            error: "Error creating booking",
            details: error instanceof Error ? error.message : "Unknown error",
            metadata: session.metadata,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook verification error:", err);
    return NextResponse.json(
      {
        error: `Webhook Error: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
        sig,
        endpointSecret,
      },
      { status: 400 }
    );
  }
}
