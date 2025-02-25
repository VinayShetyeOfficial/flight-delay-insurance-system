"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { OTPInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { useOTPStore } from "@/lib/store/otpStore";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const {
    getTimeLeft,
    setExpiryTime,
    email: storedEmail,
    setEmail,
  } = useOTPStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTimeLeft(getTimeLeft());
  }, [getTimeLeft]);

  useEffect(() => {
    if (!email) {
      router.push("/signup");
      return;
    }

    // Update stored email if it's different
    if (email !== storedEmail) {
      setEmail(email);
    }

    const timer = setInterval(() => {
      const remaining = getTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setExpiryTime(null);
        setEmail(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [email, storedEmail, router, getTimeLeft, setExpiryTime, setEmail]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = async () => {
    if (isResending || timeLeft > 0) return;

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification code");
      }

      setExpiryTime(data.expiryTime);
      setError(null);
      setOtp(new Array(6).fill(""));
      toast({
        title: "Success",
        description: "Verification code resent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPComplete = async (otpString: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      // Artificial delay to show verification state
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsVerifying(false);
        setError(
          "The entered code is incorrect. Please try again and check for typos."
        );
        setOtp(new Array(6).fill(""));
        return;
      }

      setIsSuccess(true);

      // Add delay before redirect
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Success",
        description: "Email verified successfully",
      });

      router.push("/login");
    } catch (error) {
      setIsVerifying(false);
      setError(
        "The entered code is incorrect. Please try again and check for typos."
      );
      setOtp(new Array(6).fill(""));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <OTPInput
          length={6}
          onComplete={handleOTPComplete}
          email={email}
          error={error}
          otp={otp}
          setOtp={setOtp}
          isVerifying={isVerifying}
          isSuccess={isSuccess}
        />

        <div className="flex flex-col items-center gap-4 mt-2">
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={isResending || (timeLeft && timeLeft > 0)}
          >
            {!isMounted
              ? "Loading..."
              : isResending
              ? "Sending a new OTP..."
              : timeLeft && timeLeft > 0
              ? `OTP expires in ${formatTime(timeLeft)}`
              : "Resend code"}
          </Button>

          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-500 hover:text-blue-600 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
