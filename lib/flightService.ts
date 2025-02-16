import axios from "axios";

const API_KEY = process.env.FLIGHT_API_KEY;
const BASE_URL = "https://api.flightapi.io";

interface FlightSearchParams {
  origin: string;
  destination: string;
  date: string; // Format: YYYYMMDD
  tripType: "oneway" | "round";
  returnDate?: string;
  cabinClass: string;
  adults: number;
  children: number;
  infants: number;
  currency?: string; // Added currency as optional parameter
}

export const flightService = {
  // Search for flights and pricing
  async searchFlights(params: FlightSearchParams) {
    try {
      // Format URL based on trip type
      let url;
      if (params.tripType === "oneway") {
        url = `${BASE_URL}/onewaytrip/${API_KEY}/${params.origin}/${
          params.destination
        }/${params.date}/${params.adults}/${params.children}/${
          params.infants
        }/${params.cabinClass}${params.currency ? "/" + params.currency : ""}`;
      } else {
        // Maintain existing structure for round trips
        const response = await axios.get(`${BASE_URL}/airline/${API_KEY}`, {
          params: {
            origin: params.origin,
            destination: params.destination,
            date: params.date,
            tripType: params.tripType,
            returnDate: params.returnDate,
            cabinClass: params.cabinClass,
            adults: params.adults,
            children: params.children,
            infants: params.infants,
          },
        });
        return response.data;
      }

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error searching flights:", error);
      throw error;
    }
  },

  // Get airport schedule
  async getAirportSchedule(airportCode: string, date: string) {
    try {
      const response = await axios.get(`${BASE_URL}/schedule/${API_KEY}`, {
        params: {
          airport: airportCode,
          date: date,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting airport schedule:", error);
      throw error;
    }
  },

  // Track specific flight
  async trackFlight(flightNumber: string, date: string, airline: string) {
    try {
      const response = await axios.get(`${BASE_URL}/track/${API_KEY}`, {
        params: {
          num: flightNumber,
          date: date,
          name: airline,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error tracking flight:", error);
      throw error;
    }
  },
};
