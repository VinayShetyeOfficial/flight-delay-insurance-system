import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    // Find valid reset token
    const resetEntry = await prisma.passwordReset.findFirst({
      where: {
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!resetEntry) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Verify token
    const isValidToken = await bcrypt.compare(token, resetEntry.token);
    if (!isValidToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and delete reset token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetEntry.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.deleteMany({
        where: { userId: resetEntry.userId },
      }),
    ]);

    return NextResponse.json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
