"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/utils";
import { useFlightStore } from "@/store/flightStore";
import { useBookingStore } from "@/store/bookingStore";
import { addOns, CURRENCY_RATES, insuranceOptions } from "@/lib/constants";
import {
  Shield,
  ShieldCheck,
  ShieldPlus,
  ChevronDown,
  Check,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AddOns() {
  const selectedFlight = useFlightStore((state) => state.selectedFlight);
  const { updateAddOns, calculateTotalPrice, temporaryBooking } =
    useBookingStore();
  const { selectedInsurance, currency } = temporaryBooking;

  // Initialize selectedAddOns from the store's state
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(
    temporaryBooking.selectedAddOns || []
  );

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showFeaturesForCard, setShowFeaturesForCard] = useState<string | null>(
    null
  );

  const convertPrice = (basePrice: number, targetCurrency: string): number => {
    const rate =
      CURRENCY_RATES[targetCurrency as keyof typeof CURRENCY_RATES] || 1;
    return Math.round(basePrice * rate);
  };

  // Initialize base price and sync with store when component mounts
  useEffect(() => {
    if (selectedFlight) {
      useBookingStore
        .getState()
        .setBasePrice(
          selectedFlight.totalPrice || selectedFlight.price,
          selectedFlight.currency
        );
      calculateTotalPrice();
    }
  }, [selectedFlight]);

  // Keep local state in sync with store state
  useEffect(() => {
    setSelectedAddOns(temporaryBooking.selectedAddOns);
  }, [temporaryBooking.selectedAddOns]);

  const toggleAddOn = (id: string) => {
    const newSelectedAddOns = selectedAddOns.includes(id)
      ? selectedAddOns.filter((item) => item !== id)
      : [...selectedAddOns, id];

    setSelectedAddOns(newSelectedAddOns);
    updateAddOns(newSelectedAddOns);
    calculateTotalPrice();
  };

  const handleInsuranceSelection = (insuranceId: string) => {
    useBookingStore
      .getState()
      .updateInsurance(selectedInsurance === insuranceId ? null : insuranceId);
    calculateTotalPrice();
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
              className="flex"
            >
              <Card
                className={`flex-1 flex flex-col ${
                  selectedAddOns.includes(addon.id) ? "border-primary" : ""
                }`}
              >
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex flex-col flex-1">
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

      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight">Insurance Options</h2>
        <p className="text-muted-foreground mb-4">
          Choose the perfect plan for your travel needs
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {insuranceOptions.map((option) => {
            const convertedPrice = convertPrice(option.basePrice, currency);
            const isSelected = selectedInsurance === option.id;

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex"
              >
                <Card
                  className={cn(
                    "flex flex-col flex-1",
                    isSelected ? "border-primary" : ""
                  )}
                  onClick={() => handleInsuranceSelection(option.id)}
                >
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex flex-col flex-1">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {option.icon === "basic" && (
                            <Shield className="h-5 w-5 text-primary" />
                          )}
                          {option.icon === "standard" && (
                            <ShieldCheck className="h-5 w-5 text-primary" />
                          )}
                          {option.icon === "premium" && (
                            <ShieldPlus className="h-5 w-5 text-primary" />
                          )}
                          <h3 className="font-semibold">{option.name}</h3>
                        </div>
                        <CardDescription>{option.description}</CardDescription>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-semibold text-lg">
                        {formatCurrency(convertedPrice, currency)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
