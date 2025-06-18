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
    checkedBagWeight?: number | null;
    checkedBagWeightUnit?: string | null;
  };
  locationDetails?: { [key: string]: TravelPayoutsLocation };
  status?: string;
  departureDatetime: string;
  arrivalDatetime: string;
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
    userId?: string;
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
    const currentUser = JSON.parse(
      localStorage.getItem("current_user") || "{}"
    );

    const formattedFlight = {
      ...flight,
      userId: currentUser.id,
      segments: flight.segments.map((segment: FlightSegment) => ({
        ...segment,
        departureDatetime: new Date(segment.departureDatetime).toISOString(),
        arrivalDatetime: new Date(segment.arrivalDatetime).toISOString(),
        baggage: segment.baggage || flight.baggage,
      })),
    };

    if (
      formattedFlight &&
      formattedFlight.segments &&
      formattedFlight.segments.length > 1
    ) {
      // Calculate layover times when setting the flight
      const layoverTimes = [];
      for (let i = 0; i < formattedFlight.segments.length - 1; i++) {
        const layoverTime = calculateLayoverTime(
          formattedFlight.segments[i],
          formattedFlight.segments[i + 1]
        );
        layoverTimes.push(layoverTime);
      }

      const flightToSave = { ...formattedFlight, layoverTimes };
      set({ selectedFlight: flightToSave });

      // Store in localStorage if user is logged in
      if (currentUser.id) {
        localStorage.setItem(
          `user_data_${currentUser.id}_selectedFlight`,
          JSON.stringify(flightToSave)
        );
      }
    } else {
      set({ selectedFlight: formattedFlight });

      // Store in localStorage if user is logged in
      if (currentUser.id) {
        localStorage.setItem(
          `user_data_${currentUser.id}_selectedFlight`,
          JSON.stringify(formattedFlight)
        );
      }
    }
  },
  clearSelectedFlight: () => {
    const currentUser = JSON.parse(
      localStorage.getItem("current_user") || "{}"
    );

    // Remove from localStorage if user is logged in
    if (currentUser.id) {
      localStorage.removeItem(`user_data_${currentUser.id}_selectedFlight`);
    }

    set({ selectedFlight: null });
  },
  calculateLayoverTime: calculateLayoverTime,
}));
