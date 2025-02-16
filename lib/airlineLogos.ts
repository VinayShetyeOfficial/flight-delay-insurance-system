// Base URL for airline logos
const AVIASALES_BASE_URL = "http://pics.avs.io";
const DEFAULT_SIZE = 64; // Increased from 32 to 64 for better quality
const USE_RETINA = true; // Enable retina quality

// Utility function to generate logo URL
export const generateLogoUrl = (
  iataCode: string,
  useRetina: boolean = true // Default to retina
): string => {
  const retinaPrefix = useRetina ? "@2x" : "";
  return `${AVIASALES_BASE_URL}/${DEFAULT_SIZE}/${DEFAULT_SIZE}/${iataCode}${retinaPrefix}.png`;
};

// Airline codes mapping
export const airlineCodes: { [key: string]: string } = {
  "American Airlines": "AA",
  "Delta Air Lines": "DL",
  "JetBlue Airways": "B6",
  "Southwest Airlines": "WN",
  "United Airlines": "UA",
  Lufthansa: "LH",
  Emirates: "EK",
  "Qatar Airways": "QR",
  "British Airways": "BA",
};

// Utility function to get logo URL by airline name
export const getAirlineLogo = (airlineName: string): string => {
  const iataCode = airlineCodes[airlineName];
  if (!iataCode) {
    console.warn(`No IATA code found for airline: ${airlineName}`);
    return generateLogoUrl("XX"); // Default fallback code
  }
  return generateLogoUrl(iataCode);
};

// Utility function to get airline name from code
export const getAirlineNameFromCode = (code: string): string => {
  const airlines = Object.entries(airlineCodes);
  const airline = airlines.find(([_, iataCode]) => iataCode === code);
  return airline ? airline[0] : code;
};

// Export all airlines data
export const airlines = Object.entries(airlineCodes).map(([name, code]) => ({
  code,
  name,
  logo: generateLogoUrl(code),
}));

// Types
export interface Airline {
  code: string;
  name: string;
  logo: string;
}
