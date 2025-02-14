export const airportCodes: { [key: string]: string } = {
  Boston: "BOS",
  "New York": "JFK",
  "Los Angeles": "LAX",
  Chicago: "ORD",
  Dallas: "DFW",
  Houston: "IAH",
  Miami: "MIA",
  Atlanta: "ATL",
  Denver: "DEN",
  "San Francisco": "SFO",
  Seattle: "SEA",
  "Las Vegas": "LAS",
  Phoenix: "PHX",
  Orlando: "MCO",
  Texas: "DFW", // Default to Dallas for Texas
  Massachusetts: "BOS", // Default to Boston for Massachusetts
  // Add more mappings as needed
};

export const getCityName = (code: string): string => {
  const cityMap: { [key: string]: string } = {
    BOS: "Boston",
    JFK: "New York",
    LAX: "Los Angeles",
    ORD: "Chicago",
    DFW: "Dallas",
    IAH: "Houston",
    MIA: "Miami",
    ATL: "Atlanta",
    DEN: "Denver",
    SFO: "San Francisco",
    SEA: "Seattle",
    LAS: "Las Vegas",
    PHX: "Phoenix",
    MCO: "Orlando",
  };
  return cityMap[code] || code;
};
