"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { OctagonAlert } from "lucide-react";
import { ClassicSpinner } from "react-spinners-kit";

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  email?: string;
  error?: string | null;
  otp: string[];
  setOtp: (otp: string[]) => void;
  isVerifying?: boolean;
  isSuccess?: boolean;
}

export function OTPInput({
  length = 6,
  onComplete = () => {},
  email = "",
  error = null,
  otp,
  setOtp,
  isVerifying = false,
  isSuccess = false,
}: OTPInputProps) {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Handle input change
  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Verify OTP when all fields are filled
    const otpString = newOtp.join("");
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  // Handle backspace
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      if (isNaN(Number(pastedData[i]))) continue;
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    const otpString = newOtp.join("");
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  // Check if we should show the message box
  const shouldShowMessage = isVerifying || isSuccess || error;

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-semibold text-center">Verification</h1>

      {/* Main verification box */}
      <div className="w-full max-w-[400px] p-6">
        <p className="text-center text-muted-foreground text-sm">
          If you have an account, we have sent a code to
          <br />
          <span className="font-medium text-foreground">{email}</span>. Enter it
          below.
        </p>

        <div className="flex justify-center gap-2 mt-4">
          {otp.map((value, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              ref={(ref) => ref && (inputRefs.current[index] = ref)}
              value={value}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              disabled={isVerifying || isSuccess}
              className={cn(
                "w-12 h-12 text-center text-lg font-semibold rounded-md border",
                "focus:outline-none",
                "dark:bg-zinc-900 dark:border-zinc-700",
                error && "border-red-500",
                isSuccess && "border-green-500",
                (isVerifying || isSuccess) && "opacity-50"
              )}
              maxLength={1}
            />
          ))}
        </div>

        {shouldShowMessage && (
          <div className="h-5 flex items-center justify-center text-sm mt-6">
            {isVerifying && !isSuccess && (
              <div className="flex items-center gap-2">
                Verifying
                <ClassicSpinner size={20} color="#000" loading={true} />
              </div>
            )}

            {isSuccess && (
              <div className="text-green-500">
                Verified successfully. Redirecting...
              </div>
            )}

            {error && !isVerifying && !isSuccess && (
              <div className="flex items-center text-red-500">
                <OctagonAlert className="w-4 h-4 mr-1.5 flex-shrink-0 self-start mt-[2.5px]" />
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
