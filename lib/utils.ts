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

/**
 * Formats a duration in minutes into a human-readable string
 * @param minutes Total duration in minutes
 * @returns Formatted string like "2h 30m" or "45m"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return remainingMinutes === 0
    ? `${hours}h`
    : `${hours}h ${remainingMinutes}m`;
}

export function generateOTP(length: number = 6): string {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

/**
 * Formats a number as currency with the appropriate symbol and thousands separators
 * @param amount Number to format
 * @param currency Currency code (e.g. 'USD', 'EUR')
 * @returns Formatted currency string (e.g. "$1,234.56")
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace(currency, symbol);
}

// Add this function to your utils file
export const formatCustomDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  const suffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${month} ${day}${suffix(day)}, ${year}`;
};
