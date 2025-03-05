"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Luggage, Utensils, Wifi, Headphones, Car, Sofa } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useFlightStore } from "@/store/flightStore";

// Base prices in USD
const addOns = [
  {
    id: "extra-baggage",
    name: "Extra Baggage",
    description: "Add an extra 23kg to your luggage allowance",
    basePrice: 50,
    icon: Luggage,
  },
  {
    id: "gourmet-meal",
    name: "Gourmet Meal",
    description: "Enjoy a premium dining experience at 30,000 feet",
    basePrice: 25,
    icon: Utensils,
  },
  {
    id: "wifi-access",
    name: "Wi-Fi Access",
    description: "Stay connected throughout your flight",
    basePrice: 15,
    icon: Wifi,
  },
  {
    id: "entertainment",
    name: "Entertainment Package",
    description: "Access to premium movies, TV shows, and games",
    basePrice: 20,
    icon: Headphones,
  },
  {
    id: "airport-transfer",
    name: "Airport Transfer",
    description: "Comfortable ride from the airport to your hotel",
    basePrice: 40,
    icon: Car,
  },
  {
    id: "lounge-access",
    name: "Lounge Access",
    description: "Relax in our premium airport lounge before your flight",
    basePrice: 35,
    icon: Sofa,
  },
];

// Currency conversion rates (as of a recent date)
const CURRENCY_RATES = {
  USD: 1, // Base currency
  EUR: 0.92, // Euro
  GBP: 0.79, // British Pound
  JPY: 150.41, // Japanese Yen
  AUD: 1.52, // Australian Dollar
  CAD: 1.35, // Canadian Dollar
  CHF: 0.88, // Swiss Franc
  CNY: 7.19, // Chinese Yuan
  INR: 83.12, // Indian Rupee
  AED: 3.67, // UAE Dirham
};

export default function AddOns() {
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const selectedFlight = useFlightStore((state) => state.selectedFlight);
  const currency = selectedFlight?.currency || "USD";

  const convertPrice = (basePrice: number, targetCurrency: string): number => {
    const rate =
      CURRENCY_RATES[targetCurrency as keyof typeof CURRENCY_RATES] || 1;
    return Math.round(basePrice * rate);
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Add-ons & Services
        </h2>
        <p className="text-muted-foreground">
          Enhance your travel experience with these additional services
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {addOns.map((addon, index) => {
          const convertedPrice = convertPrice(addon.basePrice, currency);

          return (
            <motion.div
              key={addon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={
                  selectedAddOns.includes(addon.id) ? "border-primary" : ""
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <addon.icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{addon.name}</h3>
                      </div>
                      <CardDescription>{addon.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="font-semibold">
                      {formatCurrency(convertedPrice, currency)}
                    </p>
                    <Switch
                      checked={selectedAddOns.includes(addon.id)}
                      onCheckedChange={() => toggleAddOn(addon.id)}
                      className="shadow-[rgba(50,_50,_93,_0.25)_0px_30px_60px_-12px_inset,_rgba(0,_0,_0,_0.3)_0px_18px_36px_-18px_inset]"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
