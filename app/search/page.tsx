"use client";

import { useState, useEffect } from "react";
import { FlightCard } from "@/components/flight-card";
import { useSearchParams, useRouter } from "next/navigation";
import { useFlightStore } from "@/store/flightStore";
import { useBookingStore } from "@/store/bookingStore";
// ... other imports

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentFormValues, setCurrentFormValues] = useState({
    adults: parseInt(searchParams.get("adults") || "1", 10),
    children: parseInt(searchParams.get("children") || "0", 10),
    infants: parseInt(searchParams.get("infants") || "0", 10),
  });

  const handleSearch = (formData: {
    adults: number;
    children: number;
    infants: number;
  }) => {
    setCurrentFormValues(formData); // Update state with current form values

    useFlightStore.getState().clearSelectedFlight();
    useBookingStore.getState().resetTemporaryBooking();
    useBookingStore
      .getState()
      .setOriginalPassengerCounts(Object.freeze({ ...formData }));
  };

  const renderFlightCard = (flight: any) => {
    return (
      <FlightCard
        key={flight.id}
        {...flight}
        originalPassengerCounts={currentFormValues}
        id={flight.id}
        isLoading={isLoading}
      />
    );
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = {
            adults: parseInt(
              e.currentTarget.elements.namedItem("adults").value || "1",
              10
            ),
            children: parseInt(
              e.currentTarget.elements.namedItem("children").value || "0",
              10
            ),
            infants: parseInt(
              e.currentTarget.elements.namedItem("infants").value || "0",
              10
            ),
          };
          handleSearch(formData);
        }}
      >
        <input
          type="number"
          name="adults"
          defaultValue={currentFormValues.adults}
          min={1}
          max={9}
        />
        <input
          type="number"
          name="children"
          defaultValue={currentFormValues.children}
          min={0}
          max={9}
        />
        <input
          type="number"
          name="infants"
          defaultValue={currentFormValues.infants}
          min={0}
          max={9}
        />
        <button type="submit">Search Flights</button>
      </form>
      <div className="flight-results">
        {flights.map((flight) => renderFlightCard(flight))}
      </div>
    </div>
  );
}
