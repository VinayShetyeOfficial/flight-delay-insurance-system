"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  popular?: boolean;
  index: number; // We’ll pass this in from the parent if needed
  hoveredCardIndex?: number; // We'll manage this in the parent
  onHover?: (index: number) => void; // We'll manage this in the parent
  onHoverLeave?: () => void; // We'll manage this in the parent
}

export function PricingCard({
  title,
  description,
  price,
  features,
  popular,
  index,
  hoveredCardIndex,
  onHover,
  onHoverLeave,
}: PricingCardProps) {
  // Is this card being hovered?
  const isHovered = hoveredCardIndex === index;

  // Decide if this card should have the "active" styling
  // 1) It's hovered
  // 2) Or it's the "popular" card and nothing else is hovered
  const shouldShowActiveStyles =
    isHovered || (popular && hoveredCardIndex == null);

  return (
    <Card
      className={`relative w-full self-stretch flex flex-col transform transition-all duration-300 
        ${
          shouldShowActiveStyles
            ? "border-2 border-primary shadow-xl"
            : "border-2 border-transparent hover:border-primary hover:shadow-xl"
        } 
        group cursor-pointer
      `}
      onMouseEnter={() => onHover?.(index)}
      onMouseLeave={() => onHoverLeave?.()}
    >
      {/* Badge logic */}
      {popular && shouldShowActiveStyles ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1">
          <p className="text-sm font-medium text-primary-foreground">
            Most Popular
          </p>
        </div>
      ) : !popular && isHovered ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1">
          <p className="text-sm font-medium text-primary-foreground">
            Select Plan
          </p>
        </div>
      ) : null}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-sm text-muted-foreground">/month</span>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <ul className="grid gap-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="p-6">
        <Button className="w-full" variant="default">
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
}
