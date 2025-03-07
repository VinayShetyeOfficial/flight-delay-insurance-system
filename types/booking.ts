import { z } from "zod";
import {
  PassengerType,
  Gender,
  BookingStatus,
  PaymentStatus,
} from "@prisma/client";

// Base schemas
export const PassengerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  gender: z.nativeEnum(Gender),
  type: z.nativeEnum(PassengerType),
  passportNumber: z.string().optional(),
  nationality: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  specialRequests: z.string().optional(),
});

export const FlightSchema = z.object({
  airlineCode: z.string(),
  flightNumber: z.string(),
  aircraft: z.string().optional(),
  cabinClass: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  origin: z.string(),
  destination: z.string(),
  originTerminal: z.string().optional(),
  destTerminal: z.string().optional(),
  duration: z.number(),
  price: z.number(),
  currency: z.string(),
});

export const AddOnSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  currency: z.string(),
});

export const InsuranceSchema = z.object({
  coverageType: z.string(),
  price: z.number(),
  terms: z.string(),
  currency: z.string(),
});

// Main booking schema
export const BookingSchema = z.object({
  flight: FlightSchema,
  passengers: z.array(PassengerSchema),
  addOns: z.array(AddOnSchema).optional(),
  insurance: InsuranceSchema.optional(),
  price: z.number(),
  totalPrice: z.number(),
  currency: z.string(),
});

// Types derived from schemas
export type Passenger = z.infer<typeof PassengerSchema>;
export type Flight = z.infer<typeof FlightSchema>;
export type AddOn = z.infer<typeof AddOnSchema>;
export type Insurance = z.infer<typeof InsuranceSchema>;
export type Booking = z.infer<typeof BookingSchema>;

export interface BookingFormData {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: "ECONOMY" | "BUSINESS" | "FIRST";
  tripType: "ONE_WAY" | "ROUND_TRIP";
}

export interface FlightDetails {
  flightNumber: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  price: number;
  cabinClass: string;
  availableSeats: number;
}

export interface PassengerData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  passportNumber: string;
  nationality: string;
  email: string;
  phone: string;
  specialRequests?: string;
  type: "ADULT" | "CHILD" | "INFANT";
}
