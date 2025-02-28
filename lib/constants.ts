import { Luggage, Utensils, Wifi, Headphones, Car, Sofa } from "lucide-react";

export const addOns = [
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

// Currency conversion rates
export const CURRENCY_RATES = {
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
