import { create } from "zustand";

export interface TravelPayoutsLocation {
  type: string;
  code: string;
  name: string;
  city_name?: string;
  main_airport_name?: string;
}

export interface FlightSegment {
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  terminal?: {
    departure: string;
    arrival: string;
  };
  aircraft?: string;
  baggage?: {
    includedCheckedBags: number;
    includedCabinBags: number;
  };
  locationDetails?: { [key: string]: TravelPayoutsLocation };
}

interface Passenger {
  name: string;
  type: string;
}

interface FlightStore {
  selectedFlight: {
    segments: FlightSegment[];
    isLayover: boolean;
    layoverDuration: number;
    price: number;
    totalPrice: number;
    currency: string;
    cabinClass: string;
    totalDuration: number;
    locationDetails?: { [key: string]: TravelPayoutsLocation };
    passengers?: Passenger[];
  } | null;
  setSelectedFlight: (flight: any) => void;
  clearSelectedFlight: () => void;
}

export const useFlightStore = create<FlightStore>((set) => ({
  selectedFlight: null,
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
  clearSelectedFlight: () => set({ selectedFlight: null }),
}));
