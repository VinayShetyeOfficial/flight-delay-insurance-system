import axios from "axios";

const AIRLINE_NAMES: { [key: string]: string } = {
  UA: "United Airlines",
  AA: "American Airlines",
  DL: "Delta Air Lines",
  B6: "JetBlue Airways",
  WN: "Southwest Airlines",
  F9: "Frontier Airlines",
  NK: "Spirit Airlines",
  AS: "Alaska Airlines",
  HA: "Hawaiian Airlines",
  AC: "Air Canada",
  BA: "British Airways",
  LH: "Lufthansa",
  AF: "Air France",
  KL: "KLM Royal Dutch Airlines",
  EK: "Emirates",
  QR: "Qatar Airways",
  EY: "Etihad Airways",
  SQ: "Singapore Airlines",
};

class AmadeusService {
  private baseURL = "https://test.api.amadeus.com/v1";
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  // Add a cache for airline names
  private airlineCache: { [key: string]: string } = AIRLINE_NAMES;

  private async getAccessToken() {
    // Check if token is still valid (with 1-minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        "https://test.api.amadeus.com/v1/security/oauth2/token",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.AMADEUS_API_KEY!,
          client_secret: process.env.AMADEUS_API_SECRET!,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
      return this.accessToken;
    } catch (error) {
      console.error("Failed to get Amadeus access token:", error);
      throw new Error("Failed to authenticate with Amadeus");
    }
  }

  async searchFlights(params: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    travelClass?: string;
    currencyCode?: string;
    maxPrice?: number;
    max?: number;
    nonStop?: boolean;
  }) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        "https://test.api.amadeus.com/v2/shopping/flight-offers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            ...params,
            // Convert travel class to Amadeus format
            travelClass: params.travelClass?.toUpperCase().replace(" ", "_"),
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Failed to search flights:", error);
      throw error;
    }
  }

  async getLocationDetails(iataCode: string) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseURL}/reference-data/locations`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            subType: "CITY",
            keyword: iataCode,
            "page[limit]": 1,
            view: "LIGHT",
          },
        }
      );

      return response.data.data[0]?.address?.cityName || iataCode;
    } catch (error) {
      console.error(`Error fetching location details for ${iataCode}:`, error);
      return iataCode; // Fallback to IATA code if lookup fails
    }
  }

  async getAirlineDetails(airlineCode: string) {
    try {
      // Check cache first
      if (this.airlineCache[airlineCode]) {
        return this.airlineCache[airlineCode];
      }

      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseURL}/reference-data/airlines`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            airlineCodes: airlineCode,
          },
        }
      );

      const airline = response.data.data[0];
      if (airline?.commonName || airline?.businessName) {
        const airlineName = (airline.commonName || airline.businessName)
          .split(" ")
          .map(
            (word: string) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");

        // Cache the result
        this.airlineCache[airlineCode] = airlineName;
        return airlineName;
      }

      return airlineCode;
    } catch (error) {
      console.error(
        `Error fetching airline details for ${airlineCode}:`,
        error
      );
      return airlineCode;
    }
  }

  // Add a new method to fetch multiple airline details at once
  async batchGetAirlineDetails(airlineCodes: string[]) {
    try {
      // Remove duplicates and filter out empty codes
      const uniqueCodes = Array.from(new Set(airlineCodes)).filter(Boolean);

      console.log(
        `Fetching details for ${uniqueCodes.length} airlines:`,
        uniqueCodes
      );

      // Filter out codes we already have in cache
      const codesToFetch = uniqueCodes.filter(
        (code) => !this.airlineCache[code]
      );

      if (codesToFetch.length === 0) {
        console.log("All airline codes found in cache:", this.airlineCache);
        return this.airlineCache;
      }

      console.log("Fetching details for airlines:", codesToFetch);

      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseURL}/reference-data/airlines`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            airlineCodes: codesToFetch.join(","),
          },
        }
      );

      // Log the API response
      console.log(
        "Airline API Response:",
        JSON.stringify(response.data, null, 2)
      );

      // Process and cache all results
      response.data.data.forEach((airline: any) => {
        const airlineName = (airline.commonName || airline.businessName)
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");

        this.airlineCache[airline.iataCode] = airlineName;
        console.log(`Cached airline: ${airline.iataCode} => ${airlineName}`);
      });

      // Log any codes that weren't found
      const missingCodes = codesToFetch.filter(
        (code) => !response.data.data.find((a: any) => a.iataCode === code)
      );
      if (missingCodes.length > 0) {
        console.warn("Airlines not found:", missingCodes);
      }

      return this.airlineCache;
    } catch (error) {
      console.error("Error fetching batch airline details:", error);
      return this.airlineCache;
    }
  }
}

export const amadeusService = new AmadeusService();
