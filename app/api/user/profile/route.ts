import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        walletAddress: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("API User Data:", user);

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, phoneNumber, walletAddress } = await req.json();
    let userId = (session.user as any).id;
    // Fallback: if id is not present, fetch by email
    if (!userId && session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      userId = user?.id;
    }
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phoneNumber,
        ...(walletAddress !== undefined ? { walletAddress } : {}),
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
