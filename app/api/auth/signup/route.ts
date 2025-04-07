import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateOTP } from "@/lib/utils";
import { otpEmailTemplate } from "@/lib/emailTemplates";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  if (req.method === "POST") {
    try {
      // Log the request body
      const body = await req.json();
      console.log("Received signup request:", body);

      const { firstName, lastName, email, password, phoneNumber, dateOfBirth } =
        body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      console.log("Checking for existing user...");

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }

      console.log("Generating OTP...");
      const otp = generateOTP();
      const expiryTime = new Date(Date.now() + 60 * 1000); // 1 minute

      console.log("Hashing password...");
      const hashedPassword = await bcrypt.hash(password, 12);

      console.log("Creating new user...");
      const user = await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password: hashedPassword,
          phoneNumber: phoneNumber || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          emailVerified: false,
          verificationToken: otp,
          verificationTokenExpiry: expiryTime,
        },
      });

      console.log("User created successfully:", user.id);
      console.log("Sending OTP email...");

      const emailResult = await sendEmail({
        to: email,
        subject: "Verify your email",
        html: otpEmailTemplate(otp),
      });

      if (!emailResult.success) {
        console.error("Failed to send OTP email:", emailResult.error);
        return NextResponse.json(
          { error: "Failed to send verification email" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: "User created successfully",
          expiryTime: expiryTime.getTime(),
          user: { id: user.id, email: user.email },
          redirect: `/verify?email=${encodeURIComponent(email)}`,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Detailed signup error:", error);
      return NextResponse.json(
        {
          error: "Internal server error",
          details: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}
