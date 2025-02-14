"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { PricingCard } from "@/components/PricingCard";

export default function HomePage() {
  // Track which card is being hovered
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  // Your pricing data
  const plans = [
    {
      title: "Basic Coverage",
      description: "For short delays",
      price: "$20",
      features: [
        "Covers up to 2 hours of delay",
        "24/7 customer support",
        "Instant claim processing",
        "Mobile app access",
      ],
      popular: false,
    },
    {
      title: "Standard Coverage",
      description: "For medium delays",
      price: "$40",
      features: [
        "Covers up to 4 hours of delay",
        "Priority customer support",
        "Instant claim processing",
        "Mobile app access",
        "Real-time flight tracking",
      ],
      popular: true, // This is the "Most Popular" plan
    },
    {
      title: "Premium Coverage",
      description: "Complete protection",
      price: "$60",
      features: [
        "Covers any delay and cancellation",
        "VIP customer support",
        "Instant claim processing",
        "Mobile app access",
        "Real-time flight tracking",
        "Hotel booking assistance",
      ],
      popular: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[1024px] mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-bold tracking-tight leading-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Flight Delay Insurance
          </h1>
        </div>

        <div className="max-w-[800px] mx-auto">
          <Card className="mb-12 border shadow-sm transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-2xl">Protect Your Journey</CardTitle>
              <CardDescription className="text-base">
                Get compensation for flight delays and cancellations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Why Choose Us?</h3>
                  <ul className="space-y-3">
                    {[
                      "Instant coverage",
                      "Easy claim process",
                      "24/7 support",
                      "Competitive rates",
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-4 justify-center">
                  <Link href="/booking" className="w-full">
                    <Button variant="default" size="lg" className="w-full">
                      Book a Flight
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full">
                    <Button variant="outline" size="lg" className="w-full">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan for your travel needs
          </p>
        </div>

        {/* Render all plans in a loop, passing hover state down */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1024px] mx-auto">
          {plans.map((plan, idx) => (
            <PricingCard
              key={idx}
              index={idx}
              hoveredCardIndex={hoveredCardIndex}
              onHover={(i) => setHoveredCardIndex(i)}
              onHoverLeave={() => setHoveredCardIndex(null)}
              {...plan}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
