"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Package,
  ClipboardCheck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { create } from "zustand";
import { WalletAddressDialog } from "@/components/ui/WalletAddressDialog";
import { UserStorageService } from "@/lib/services/userStorage";
import { useSession } from "next-auth/react";

import PassengerForm from "./passenger-form";
import AddOns from "./add-ons";
import Review from "./review";
import Payment from "./payment";
import { useBookingStore } from "@/store/bookingStore";

// Define the booking steps
const steps = [
  {
    id: "passenger",
    name: "Passenger Information",
    description: "Enter passenger details",
    icon: Users,
    component: PassengerForm,
  },
  {
    id: "add-ons",
    name: "Add-ons",
    description: "Select additional services",
    icon: Package,
    component: AddOns,
  },
  {
    id: "review",
    name: "Review",
    description: "Review your booking",
    icon: ClipboardCheck,
    component: Review,
  },
  {
    id: "payment",
    name: "Payment",
    description: "Complete your purchase",
    icon: CreditCard,
    component: Payment,
  },
] as const;

// Create a store to hold flight details
interface FlightStore {
  selectedFlight: any; // Use the FlightCardProps type
  setSelectedFlight: (flight: any) => void;
}

export const useFlightStore = create<FlightStore>((set) => ({
  selectedFlight: null,
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
}));

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { temporaryBooking } = useBookingStore();
  const { data: session } = useSession();

  // Read passenger counts from query parameters
  const adults = parseInt(searchParams.get("adults") || "1", 10);
  const children = parseInt(searchParams.get("children") || "0", 10);
  const infants = parseInt(searchParams.get("infants") || "0", 10);

  const [currentStep, setCurrentStep] = useState(0);
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(true);
  const progress = (currentStep / (steps.length - 1)) * 100;
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Fetch wallet address from local storage or user profile on mount
  useEffect(() => {
    const user = UserStorageService.getCurrentUser();
    if (user && user.walletAddress) {
      setWalletAddress(user.walletAddress);
    }
    // Also fetch from backend if logged in
    async function fetchWalletFromBackend() {
      if (session) {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const userData = await res.json();
          if (userData.walletAddress) {
            setWalletAddress(userData.walletAddress);
            UserStorageService.setCurrentUser({
              ...user,
              walletAddress: userData.walletAddress,
            });
          }
        }
      }
    }
    fetchWalletFromBackend();
  }, [session]);

  // Helper: check if insurance is selected in add-ons step
  const isInsuranceSelected = () => {
    return (
      steps[currentStep].id === "add-ons" &&
      temporaryBooking.selectedInsurance &&
      temporaryBooking.selectedInsurance !== null
    );
  };

  // Intercept Next Step navigation for Add-ons step
  const goToNextStep = async () => {
    if (
      steps[currentStep].id === "add-ons" &&
      temporaryBooking.selectedInsurance
    ) {
      let localWallet = walletAddress;
      // Always check backend if localWallet is not set
      if (!localWallet && session) {
        try {
          const res = await fetch("/api/user/profile");
          if (res.ok) {
            const userData = await res.json();
            if (
              userData.walletAddress &&
              userData.walletAddress !== "null" &&
              userData.walletAddress !== ""
            ) {
              setWalletAddress(userData.walletAddress);
              localWallet = userData.walletAddress;
              // Also update localStorage
              const user = UserStorageService.getCurrentUser();
              if (user) {
                UserStorageService.setCurrentUser({
                  ...user,
                  walletAddress: userData.walletAddress,
                });
              }
            } else {
              setWalletAddress("");
            }
          }
        } catch {
          setWalletAddress("");
        }
      }
      // Wait for state to update before opening dialog
      setTimeout(() => {
        setWalletDialogOpen(true);
        setPendingNextStep(true);
      }, 100);
      return;
    }
    if (currentStep === 0 && !isCurrentStepValid) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsCurrentStepValid(true);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsCurrentStepValid(true);
    }
  };

  // Handle wallet address confirmation
  const handleWalletConfirm = async (address: string) => {
    setWalletAddress(address);
    setWalletDialogOpen(false);
    // Save to local storage
    const user = UserStorageService.getCurrentUser();
    if (user) {
      UserStorageService.setCurrentUser({ ...user, walletAddress: address });
    }
    // Save to backend
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });
    } catch (e) {
      // Optionally show error toast
    }
    // Only proceed to next step if dialog is closed and user confirmed
    if (pendingNextStep) {
      setPendingNextStep(false);
      setTimeout(() => {
        // Actually go to next step only once
        setWalletDialogOpen(false);
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        setIsCurrentStepValid(true);
      }, 0);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Wallet Address Dialog */}
      <WalletAddressDialog
        open={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        onConfirm={handleWalletConfirm}
        initialAddress={walletAddress || ""}
      />
      <div className="max-w-[1024px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Complete Your Booking
          </h1>
          <p className="text-muted-foreground mt-2">
            Please complete all steps to confirm your flight
          </p>
        </div>

        {/* Progress Bar and Steps */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 bg-primary/10" />
          <div className="mt-4 grid grid-cols-4 gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center text-center p-4 rounded-lg transition-colors",
                    currentStep === index
                      ? "bg-[#e7e7e9]" // Active step
                      : index < currentStep
                      ? "bg-[#e7e7e9]" // Completed steps
                      : "bg-background" // Upcoming steps
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                      currentStep === index
                        ? "bg-primary text-primary-foreground"
                        : index < currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{step.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <Card className="p-6">
          <div className="mb-8">
            {currentStep === 0 ? (
              <CurrentStepComponent
                adults={adults}
                children={children}
                infants={infants}
                onValidityChange={setIsCurrentStepValid}
              />
            ) : (
              <CurrentStepComponent />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={
                currentStep === 0 ? () => router.back() : goToPreviousStep
              }
              // Only disable Previous Step button on payment step if payment is complete
              disabled={currentStep === 3 && temporaryBooking.isPaymentComplete}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {currentStep === 0 ? "Back to Flights" : "Previous Step"}
            </Button>

            {/* Only show Next Step button if not on the last step (payment) */}
            {currentStep < steps.length - 1 && (
              <Button
                onClick={goToNextStep}
                disabled={currentStep === 0 && !isCurrentStepValid}
              >
                Next Step
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
