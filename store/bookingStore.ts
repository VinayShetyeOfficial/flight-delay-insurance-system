import { create } from "zustand";
import type { Booking } from "@/types/booking";
import { addOns, CURRENCY_RATES } from "@/lib/constants";

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
  basePrice: number;
  currency: string;
  totalPrice: number;
}

interface BookingState {
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (flightNumber: string, status: string) => void;
  temporaryBooking: TemporaryBookingState;
  updatePassengers: (passengers: PassengerInfo[]) => void;
  updateAddOns: (addOnIds: string[]) => void;
  setBasePrice: (price: number, currency: string) => void;
  calculateTotalPrice: () => number;
  resetTemporaryBooking: () => void;
}

const initialTemporaryState: TemporaryBookingState = {
  passengers: [],
  selectedAddOns: [],
  basePrice: 0,
  currency: "USD",
  totalPrice: 0,
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
    const { basePrice, selectedAddOns, currency } = state.temporaryBooking;

    // Calculate add-ons total with currency conversion
    const addOnsTotal = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find((a) => a.id === addOnId);
      if (addOn) {
        const rate =
          CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;
        return total + addOn.basePrice * rate;
      }
      return total;
    }, 0);

    const totalPrice = basePrice + addOnsTotal;

    set((state) => ({
      temporaryBooking: {
        ...state.temporaryBooking,
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
