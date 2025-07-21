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
            nonStop: params.nonStop,
            travelClass: params.travelClass?.toUpperCase().replace(" ", "_"),
          },
        }
      );

      const getBaggageInfo = (segment: any) => {
        const checkedBags = segment.includedCheckedBags;
        const cabinBags = segment.includedCabinBags;

        return {
          includedCheckedBags: checkedBags
            ? checkedBags.quantity || (checkedBags.weight ? 1 : 0)
            : 0,
          includedCabinBags: cabinBags
            ? cabinBags.quantity || (cabinBags.weight ? 1 : 0)
            : 0,
          checkedBagWeight: checkedBags?.weight || null,
          checkedBagWeightUnit: checkedBags?.weightUnit || null,
          cabinBagWeight: cabinBags?.weight || null,
          cabinBagWeightUnit: cabinBags?.weightUnit || null,
        };
      };

      const transformedFlights = await Promise.all(
        response.data.data.map(async (offer: any) => {
          const segments = offer.itineraries[0].segments;
          const isLayover = segments.length > 1;

          // If nonStop is true and this is a layover flight, skip it
          if (params.nonStop && isLayover) {
            return null;
          }

          // Get cabin class info from all segments
          const fareDetails = offer.travelerPricings[0].fareDetailsBySegment;
          const cabinInfo = fareDetails.map((detail: any) => ({
            cabin: detail.cabin,
            brandedFare: detail.brandedFareLabel || detail.brandedFare,
          }));

          // Get the highest class among segments (FIRST > BUSINESS > PREMIUM_ECONOMY > ECONOMY)
          const cabinClassOrder = [
            "FIRST",
            "BUSINESS",
            "PREMIUM_ECONOMY",
            "ECONOMY",
          ];
          const highestCabinClass = cabinInfo.reduce(
            (highest: string, current: any) => {
              const currentIndex = cabinClassOrder.indexOf(current.cabin);
              const highestIndex = cabinClassOrder.indexOf(highest);
              return currentIndex < highestIndex ? current.cabin : highest;
            },
            "ECONOMY"
          );

          // Get baggage info from the first segment
          const firstSegmentBaggage = fareDetails[0];
          const baggageInfo = getBaggageInfo(firstSegmentBaggage);

          // Get amenities (non-chargeable ones)
          const amenities =
            fareDetails[0].amenities
              ?.filter((amenity: any) => !amenity.isChargeable)
              ?.map((amenity: any) => amenity.description) || [];

          // Common flight data
          const baseFlightData = {
            id: offer.id,
            price: parseFloat(offer.price.total),
            currency: offer.price.currency,
            totalPrice: parseFloat(offer.price.grandTotal),
            cabinClass: highestCabinClass,
            brandedFare: cabinInfo[0].brandedFare,
            baggage: baggageInfo,
            amenities: amenities,
          };

          // Transform segments
          const flightSegments = await Promise.all(
            segments.map(async (segment: any) => ({
              airline: response.data.dictionaries.carriers[segment.carrierCode],
              airlineCode: segment.carrierCode,
              flightNumber: `${segment.carrierCode}${segment.number}`,
              origin: segment.departure.iataCode,
              originCity:
                response.data.dictionaries.locations[segment.departure.iataCode]
                  ?.cityCode || segment.departure.iataCode,
              destination: segment.arrival.iataCode,
              destinationCity:
                response.data.dictionaries.locations[segment.arrival.iataCode]
                  ?.cityCode || segment.arrival.iataCode,
              departureDatetime: segment.departure.at,
              arrivalDatetime: segment.arrival.at,
              departureTime: new Date(
                segment.departure.at
              ).toLocaleTimeString(),
              arrivalTime: new Date(segment.arrival.at).toLocaleTimeString(),
              duration: this.parseDuration(segment.duration),
              terminal: {
                departure: segment.departure.terminal || "-",
                arrival: segment.arrival.terminal || "-",
              },
              aircraft:
                response.data.dictionaries.aircraft[segment.aircraft.code],
              status: "SCHEDULED",
            }))
          );

          // Get location details from the API response
          const locationDetails = response.data.dictionaries.locations || {};

          if (isLayover) {
            const totalDuration = this.parseDuration(
              offer.itineraries[0].duration
            );

            // Calculate actual flight time from segments
            const segmentsDuration = flightSegments.reduce(
              (acc, seg) => acc + seg.duration,
              0
            );

            // Calculate layover time by comparing segment times
            let totalLayoverTime = 0;
            for (let i = 0; i < flightSegments.length - 1; i++) {
              const currentSegment = flightSegments[i];
              const nextSegment = flightSegments[i + 1];

              // Use full datetime strings for accurate calculations
              const currentArrival = new Date(currentSegment.arrivalDatetime);
              const nextDeparture = new Date(nextSegment.departureDatetime);

              // Calculate difference in minutes
              const layoverMinutes =
                (nextDeparture.getTime() - currentArrival.getTime()) /
                (1000 * 60);
              totalLayoverTime += layoverMinutes;
            }

            return {
              ...baseFlightData,
              isLayover: true,
              segments: flightSegments,
              layoverTime: totalLayoverTime,
              locationDetails,
              // Display data for the card
              airline: flightSegments[0].airline,
              airlineCode: flightSegments[0].airlineCode,
              flightNumber: flightSegments[0].flightNumber,
              origin: flightSegments[0].origin,
              originCity: flightSegments[0].originCity,
              destination:
                flightSegments[flightSegments.length - 1].destination,
              destinationCity:
                flightSegments[flightSegments.length - 1].destinationCity,
              departureTime: flightSegments[0].departureTime,
              arrivalTime:
                flightSegments[flightSegments.length - 1].arrivalTime,
              duration: totalDuration,
              aircraft: flightSegments.map((seg) => seg.aircraft).join(" → "),
              status: "SCHEDULED",
              terminal: {
                departure: flightSegments[0].terminal.departure,
                arrival:
                  flightSegments[flightSegments.length - 1].terminal.arrival,
              },
              departureDatetime: segments[0].departure.at,
              arrivalDatetime: segments[segments.length - 1].arrival.at,
            };
          } else {
            return {
              ...baseFlightData,
              ...flightSegments[0],
              locationDetails,
              isLayover: false,
              departureDatetime: segments[0].departure.at,
              arrivalDatetime: segments[0].arrival.at,
            };
          }
        })
      );

      // Filter out null values from skipped flights
      return transformedFlights.filter(Boolean);
    } catch (error) {
      console.error("Failed to search flights:", error);
      throw error;
    }
  }

  // Helper method to parse ISO duration
  private parseDuration(isoDuration: string): number {
    const matches = isoDuration.match(/PT(\d+H)?(\d+M)?/);
    let minutes = 0;

    if (matches) {
      const hours = matches[1] ? parseInt(matches[1]) : 0;
      const mins = matches[2] ? parseInt(matches[2]) : 0;
      minutes = hours * 60 + mins;
    }

    return minutes;
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
      const uniqueCodes = Array.from(new Set(airlineCodes)).filter(Boolean);
      console.log("Fetching details for IATA codes:", uniqueCodes);

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

  // Helper method to get city name (you'll need to implement this)
  private async getCityName(iataCode: string): Promise<string> {
    // Implement city lookup logic here
    // For now, return the code
    return iataCode;
  }

  // Helper method to get airline name
  private async getAirlineName(carrierCode: string): Promise<string> {
    if (this.airlineCache[carrierCode]) {
      return this.airlineCache[carrierCode];
    }

    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseURL}/reference-data/airlines`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { airlineCodes: carrierCode },
        }
      );

      if (response.data.data && response.data.data[0]) {
        const airlineName =
          response.data.data[0].commonName ||
          response.data.data[0].businessName;
        this.airlineCache[carrierCode] = airlineName;
        return airlineName;
      }

      return carrierCode;
    } catch (error) {
      console.error(`Error fetching airline name for ${carrierCode}:`, error);
      return carrierCode;
    }
  }
}

export const amadeusService = new AmadeusService();
