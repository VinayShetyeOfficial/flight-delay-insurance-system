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
  airlineCode?: string;
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
  status?: string;
}

interface Passenger {
  name: string;
  type: string;
}

function calculateLayoverTime(
  currentSegment: FlightSegment,
  nextSegment: FlightSegment
): number {
  try {
    // Parse times and handle AM/PM format
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(" ");
      const [hours, minutes] = time.split(":").map(Number);

      let totalMinutes = hours * 60 + minutes;

      // Adjust for PM times (except 12 PM)
      if (period === "PM" && hours !== 12) {
        totalMinutes += 12 * 60;
      }
      // Adjust for 12 AM
      if (period === "AM" && hours === 12) {
        totalMinutes = minutes;
      }

      return totalMinutes;
    };

    const arrivalMinutes = parseTime(currentSegment.arrivalTime);
    const departureMinutes = parseTime(nextSegment.departureTime);

    // Calculate difference considering day wraparound
    let layoverMinutes = departureMinutes - arrivalMinutes;

    // If negative, it means the next flight is on the next day
    if (layoverMinutes < 0) {
      layoverMinutes += 24 * 60; // Add 24 hours worth of minutes
    }

    return layoverMinutes;
  } catch (error) {
    console.error("Error calculating layover time:", error);
    return 0;
  }
}

interface FlightStore {
  selectedFlight: {
    segments: FlightSegment[];
    isLayover: boolean;
    layoverTimes: number[];
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
  calculateLayoverTime: typeof calculateLayoverTime;
}

export const useFlightStore = create<FlightStore>((set) => ({
  selectedFlight: null,
  setSelectedFlight: (flight) => {
    if (flight && flight.segments && flight.segments.length > 1) {
      // Calculate layover times when setting the flight
      const layoverTimes = [];
      for (let i = 0; i < flight.segments.length - 1; i++) {
        const layoverTime = calculateLayoverTime(
          flight.segments[i],
          flight.segments[i + 1]
        );
        layoverTimes.push(layoverTime);
      }
      set({ selectedFlight: { ...flight, layoverTimes } });
    } else {
      set({ selectedFlight: flight });
    }
  },
  clearSelectedFlight: () => set({ selectedFlight: null }),
  calculateLayoverTime: calculateLayoverTime,
}));
