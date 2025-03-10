import { create } from "zustand";
import type { Booking } from "@/types/booking";
import { addOns, insuranceOptions, CURRENCY_RATES } from "@/lib/constants";

interface PassengerInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  passportNumber?: string;
  nationality?: string;
  email?: string;
  phone?: string;
  specialRequests?: string;
  type: "ADULT" | "CHILD" | "INFANT";
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  basePrice: number;
}

interface TemporaryBookingState {
  passengers: PassengerInfo[];
  selectedAddOns: string[];
  selectedInsurance: string | null;
  basePrice: number;
  currency: string;
  totalPrice: number;
  addOnsTotal: number;
}

interface BookingState {
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (flightNumber: string, status: string) => void;
  temporaryBooking: TemporaryBookingState;
  updatePassengers: (passengers: PassengerInfo[]) => void;
  updateAddOns: (addOnIds: string[]) => void;
  updateInsurance: (insuranceId: string | null) => void;
  setBasePrice: (price: number, currency: string) => void;
  calculateTotalPrice: () => number;
  resetTemporaryBooking: () => void;
}

const initialTemporaryState: TemporaryBookingState = {
  passengers: [],
  selectedAddOns: [],
  selectedInsurance: null,
  basePrice: 0,
  currency: "USD",
  totalPrice: 0,
  addOnsTotal: 0,
};

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) =>
    set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBookingStatus: (flightNumber, status) =>
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.flightNumber === flightNumber ? { ...booking, status } : booking
      ),
    })),
  temporaryBooking: initialTemporaryState,
  updatePassengers: (passengers) =>
    set((state) => ({
      temporaryBooking: {
        ...state.temporaryBooking,
        passengers,
      },
    })),
  updateAddOns: (addOnIds) =>
    set((state) => ({
      temporaryBooking: {
        ...state.temporaryBooking,
        selectedAddOns: addOnIds,
      },
    })),
  updateInsurance: (insuranceId: string | null) =>
    set((state) => ({
      temporaryBooking: {
        ...state.temporaryBooking,
        selectedInsurance: insuranceId,
      },
    })),
  setBasePrice: (price, currency) =>
    set((state) => ({
      temporaryBooking: {
        ...state.temporaryBooking,
        basePrice: price,
        currency,
      },
    })),
  calculateTotalPrice: () => {
    const state = get();
    const { basePrice, selectedAddOns, selectedInsurance, currency } =
      state.temporaryBooking;

    const rate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;

    // Calculate regular add-ons total with currency conversion
    const regularAddOnsTotal = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find((a) => a.id === addOnId);
      if (addOn) {
        return total + addOn.basePrice * rate;
      }
      return total;
    }, 0);

    // Calculate insurance cost with currency conversion
    const insuranceTotal = selectedInsurance
      ? (insuranceOptions.find((i) => i.id === selectedInsurance)?.basePrice ||
          0) * rate
      : 0;

    // Combined total of add-ons and insurance
    const totalAddOnsPrice = regularAddOnsTotal + insuranceTotal;

    // Final total price
    const totalPrice = basePrice + totalAddOnsPrice;

    set((state) => ({
      temporaryBooking: {
        ...state.temporaryBooking,
        addOnsTotal: totalAddOnsPrice,
        totalPrice,
      },
    }));

    return totalPrice;
  },
  resetTemporaryBooking: () =>
    set({
      temporaryBooking: initialTemporaryState,
    }),
}));
