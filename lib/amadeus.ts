import axios from "axios";

class AmadeusService {
  private baseURL = "https://test.api.amadeus.com/v2";
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

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
        `${this.baseURL}/shopping/flight-offers`,
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
}

export const amadeusService = new AmadeusService();
