"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOTPStore } from "@/lib/store/otpStore";
import { ForgotPassword } from "./forgot-password";
import { UserStorageService } from "@/lib/services/userStorage";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [showVerificationOptions, setShowVerificationOptions] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { isExpired, setExpiryTime } = useOTPStore();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    setShowVerificationOptions(false);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error?.includes("database server")) {
        setError("Unable to connect to the server. Please try again later.");
        setIsLoading(false);
        toast({
          title: "Connection Error",
          description:
            "We're experiencing technical difficulties. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      if (result?.error === "UNVERIFIED_EMAIL") {
        setError("Please verify your email address.");
        setShowVerificationOptions(true);
        setIsLoading(false);
        return;
      }

      if (result?.error === "CredentialsSignin") {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // Get user info from session
      const response = await fetch("/api/user/profile");
      const userData = await response.json();

      // Debug log
      console.log("User Profile Data:", userData);

      // Store user info in localStorage with ID
      UserStorageService.setCurrentUser({
        id: userData.id, // e.g., "cm7qjv3r90000u3r0b4qzaqn7"
        email: userData.email, // Keep email for display purposes only
      });

      // Debug log
      console.log("Stored User Data:", UserStorageService.getCurrentUser());

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setError(
        "Unable to connect to the service. Please check your internet connection."
      );
      toast({
        title: "Connection Error",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleResendVerification = async (email: string) => {
    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification code");
      }

      setExpiryTime(data.expiryTime);

      router.push(`/verify?email=${encodeURIComponent(email)}`);

      toast({
        title: "Verification Code Sent",
        description: "Please check your email for the verification code",
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
        <ForgotPassword onCancel={() => setShowForgotPassword(false)} />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            {error && !showVerificationOptions && (
              <div className="text-sm text-red-500">{error}</div>
            )}
            {error && showVerificationOptions && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-500">
                  Please verify your email address.
                </span>
                {isExpired() && (
                  <button
                    type="button"
                    onClick={() => handleResendVerification(watch("email"))}
                    disabled={isResending}
                    className="text-blue-500 hover:underline disabled:opacity-50"
                  >
                    {isResending ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-primary hover:underline"
          >
            Forgot your password?
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
