import { create } from "zustand";
import { LocalStorageService, STORAGE_KEYS } from "@/lib/localStorage";
import type {
  BookingFormData,
  FlightDetails,
  PassengerData,
} from "@/types/booking";
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
  insuranceBeneficiary?: boolean;
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
  bookings: BookingFormData[];
  setBookings: (bookings: BookingFormData[]) => void;
  addBooking: (booking: BookingFormData) => void;
  updateBookingStatus: (flightNumber: string, status: string) => void;
  temporaryBooking: TemporaryBookingState;
  updatePassengers: (passengers: PassengerInfo[]) => void;
  updateAddOns: (addOnIds: string[]) => void;
  updateInsurance: (insuranceId: string | null) => void;
  setBasePrice: (price: number, currency: string) => void;
  calculateTotalPrice: () => number;
  resetTemporaryBooking: () => void;
  insuranceDetails: {
    selected: boolean;
    coverageAmount: number;
    premium: number;
    delayThreshold: number; // in hours
  };
  calculateInsurancePremium: (flightDetails: FlightDetails) => number;
  selectedFlight: {
    segments: Array<{
      airline: string;
      airlineCode: string;
      aircraft: string;
      origin: string;
      destination: string;
      departureTime: string;
      arrivalTime: string;
      originDetails?: string;
      destinationDetails?: string;
    }>;
    pricing: {
      basePrice: number;
      totalPrice: number;
      currency: string;
    };
    class: string;
    duration: number;
  } | null;
  setSelectedFlight: (
    flight: {
      segments: Array<{
        airline: string;
        airlineCode: string;
        aircraft: string;
        origin: string;
        destination: string;
        departureTime: string;
        arrivalTime: string;
        originDetails?: string;
        destinationDetails?: string;
      }>;
      pricing: {
        basePrice: number;
        totalPrice: number;
        currency: string;
      };
      class: string;
      duration: number;
    } | null
  ) => void;
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
  insuranceDetails: {
    selected: false,
    coverageAmount: 0,
    premium: 0,
    delayThreshold: 2,
  },
  calculateInsurancePremium: (flightDetails) => {
    // Premium calculation logic based on flight details
    const basePremium = flightDetails.price * 0.05; // 5% of flight price
    return Math.round(basePremium * 100) / 100;
  },
  selectedFlight: null,
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
}));
