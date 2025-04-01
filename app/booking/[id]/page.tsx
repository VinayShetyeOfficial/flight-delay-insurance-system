"use client";

import { useState } from "react";
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

import PassengerForm from "./passenger-form";
import AddOns from "./add-ons";
import Review from "./review";
import Payment from "./payment";

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

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read passenger counts from query parameters
  const adults = parseInt(searchParams.get("adults") || "1", 10);
  const children = parseInt(searchParams.get("children") || "0", 10);
  const infants = parseInt(searchParams.get("infants") || "0", 10);

  const [currentStep, setCurrentStep] = useState(0);
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(true);
  const progress = (currentStep / (steps.length - 1)) * 100;

  const goToNextStep = () => {
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

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="container mx-auto px-4 py-8">
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
                      : // ? "bg-[#e7e7e9]" // Active step
                      index < currentStep
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
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {currentStep === 0 ? "Back to Flights" : "Previous Step"}
            </Button>
            <Button
              onClick={goToNextStep}
              disabled={currentStep === 0 && !isCurrentStepValid}
            >
              {currentStep === steps.length - 1
                ? "Complete Booking"
                : "Next Step"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
