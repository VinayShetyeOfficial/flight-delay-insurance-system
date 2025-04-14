import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP } from "@/lib/utils";
import { otpEmailTemplate } from "@/lib/emailTemplates";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        emailVerified: true,
        verificationTokenExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Check if existing token is still valid
    if (
      user.verificationTokenExpiry &&
      new Date() < user.verificationTokenExpiry
    ) {
      return NextResponse.json({
        message: "Existing verification code is still valid",
        expiryTime: user.verificationTokenExpiry.getTime(),
      });
    }

    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { email },
      data: {
        verificationToken: otp,
        verificationTokenExpiry: expiryTime,
      },
    });

    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: otpEmailTemplate(otp),
    });

    return NextResponse.json({
      message: "Verification email sent",
      expiryTime: expiryTime.getTime(),
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
