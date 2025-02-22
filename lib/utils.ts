import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseISODuration(duration: string): {
  hours: number;
  minutes: number;
} {
  const matches = duration.match(/PT(\d+H)?(\d+M)?/);
  const hours = matches?.[1] ? parseInt(matches[1]) : 0;
  const minutes = matches?.[2] ? parseInt(matches[2]) : 0;
  return { hours, minutes };
}

// Add this currency symbol mapping
export const CURRENCY_SYMBOLS: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "Fr",
  CNY: "¥",
  INR: "₹",
  AED: "د.إ",
  // Add more currencies as needed
};

// Add a helper function to get currency symbol
export const getCurrencySymbol = (currency: string) => {
  return CURRENCY_SYMBOLS[currency] || currency;
};
