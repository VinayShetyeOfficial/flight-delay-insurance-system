// Map of airline names to their logo paths
export const airlineLogos: { [key: string]: string } = {
  "American Airlines": "/assets/airlines/airline-american.png",
  "Delta Air Lines": "/assets/airlines/airline-delta.png",
  "JetBlue Airways": "/assets/airlines/airline-jetblue.png",
  "Southwest Airlines": "/assets/airlines/airline-southwest.png",
  "United Airlines": "/assets/airlines/airline-united.png",
  Lufthansa: "/assets/airlines/airline-lufthansa.png",
  Emirates: "/assets/airlines/airline-emirates.png",
  "Qatar Airways": "/assets/airlines/airline-qatar.png",
  "British Airways": "/assets/airlines/airline-british.png",
};

// Utility function to get logo path by airline name
export const getAirlineLogo = (airlineName: string): string => {
  const logo = airlineLogos[airlineName];
  return logo || "/assets/airlines/airline-default.png"; // Fallback to default if not found
};

// Utility function to get airline name from code
export const getAirlineNameFromCode = (code: string): string => {
  const airlineCodes: { [key: string]: string } = {
    AA: "American Airlines",
    DL: "Delta Air Lines",
    B6: "JetBlue Airways",
    WN: "Southwest Airlines",
    UA: "United Airlines",
    LH: "Lufthansa",
    EK: "Emirates",
    QR: "Qatar Airways",
    BA: "British Airways",
  };
  return airlineCodes[code] || code;
};

// Export all airlines data
export const airlines = [
  {
    code: "AA",
    name: "American Airlines",
    logo: "/assets/airlines/airline-american.png",
  },
  {
    code: "DL",
    name: "Delta Air Lines",
    logo: "/assets/airlines/airline-delta.png",
  },
  {
    code: "B6",
    name: "JetBlue Airways",
    logo: "/assets/airlines/airline-jetblue.png",
  },
  {
    code: "WN",
    name: "Southwest Airlines",
    logo: "/assets/airlines/airline-southwest.png",
  },
  {
    code: "UA",
    name: "United Airlines",
    logo: "/assets/airlines/airline-united.png",
  },
  {
    code: "LH",
    name: "Lufthansa",
    logo: "/assets/airlines/airline-lufthansa.png",
  },
  {
    code: "EK",
    name: "Emirates",
    logo: "/assets/airlines/airline-emirates.png",
  },
  {
    code: "QR",
    name: "Qatar Airways",
    logo: "/assets/airlines/airline-qatar.png",
  },
  {
    code: "BA",
    name: "British Airways",
    logo: "/assets/airlines/airline-british.png",
  },
];
