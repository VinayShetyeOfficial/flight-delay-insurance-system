import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// Create a single PrismaClient instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

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
          { error: "User already exists" },
          { status: 400 }
        );
      }

      console.log("Hashing password...");
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log("Creating new user...");
      const user = await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password: hashedPassword,
          phoneNumber: phoneNumber || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        },
      });

      console.log("User created successfully:", user.id);

      return NextResponse.json(
        {
          message: "User created successfully",
          user: { id: user.id, email: user.email },
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
