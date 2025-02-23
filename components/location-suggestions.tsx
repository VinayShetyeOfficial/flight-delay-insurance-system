import { useEffect, useState } from "react";

interface Location {
  id: string;
  type: "city" | "airport";
  code: string;
  name: string;
  city_code?: string;
  city_name?: string;
  country_name: string;
  main_airport_name: string | null;
  weight?: number;
}

interface LocationSuggestionsProps {
  searchTerm: string;
  onSelect: (location: { code: string; name: string }) => void;
  isEnabled: boolean;
  onSearchStateChange: (enabled: boolean) => void;
}

export function LocationSuggestions({
  searchTerm,
  onSelect,
  isEnabled,
  onSearchStateChange,
}: LocationSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  const filterAndSortLocations = (
    locations: Location[],
    searchTerm: string
  ): Location[] => {
    const searchTermLower = searchTerm.toLowerCase();

    // Filter to only include locations with "Airport" in their name or main_airport_name
    const filteredLocations = locations.filter((location) => {
      const hasAirport =
        (location.type === "airport" && location.name.includes("Airport")) ||
        (location.type === "city" &&
          location.main_airport_name?.includes("Airport"));
      return hasAirport;
    });

    return filteredLocations.sort((a, b) => {
      const aName = (a.city_name || a.name).toLowerCase();
      const bName = (b.city_name || b.name).toLowerCase();

      // First priority: City name starts with search term
      const aStartsWithName = aName.startsWith(searchTermLower);
      const bStartsWithName = bName.startsWith(searchTermLower);
      if (aStartsWithName && !bStartsWithName) return -1;
      if (!aStartsWithName && bStartsWithName) return 1;

      // Second priority: City name contains search term
      const aContainsName = aName.includes(searchTermLower);
      const bContainsName = bName.includes(searchTermLower);
      if (aContainsName && !bContainsName) return -1;
      if (!aContainsName && bContainsName) return 1;

      // Third priority: IATA code starts with search term
      const aCodeMatch = a.code.toLowerCase().startsWith(searchTermLower);
      const bCodeMatch = b.code.toLowerCase().startsWith(searchTermLower);
      if (aCodeMatch && !bCodeMatch) return -1;
      if (!aCodeMatch && bCodeMatch) return 1;

      // Fourth priority: Weight/popularity
      return (b.weight || 0) - (a.weight || 0);
    });
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isEnabled || !searchTerm || searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const formattedTerm = searchTerm.replace(/\s+/g, "");
        const response = await fetch(
          `https://autocomplete.travelpayouts.com/places2?locale=en&types[]=airport&types[]=city&term=${formattedTerm}`
        );
        const data: Location[] = await response.json();

        // Filter and sort results
        const processedData = filterAndSortLocations(data, formattedTerm);
        setSuggestions(processedData);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, isEnabled]);

  const formatLocationName = (location: Location): string => {
    if (location.type === "city" && location.main_airport_name) {
      return `${location.main_airport_name} (${location.code})`;
    }
    if (location.type === "airport") {
      return `${location.name} (${location.code})`;
    }
    return `${location.name}, ${location.country_name} (${location.code})`;
  };

  const formatSubtext = (location: Location): string => {
    if (location.type === "city" && location.main_airport_name) {
      return `${location.name}, ${location.country_name}`;
    }
    if (location.type === "airport" && location.city_name) {
      return `${location.city_name}, ${location.country_name}`;
    }
    return location.country_name;
  };

  if (!suggestions.length && !loading) {
    return null;
  }

  return (
    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
      {loading ? (
        <div className="p-2 text-sm text-muted-foreground">Loading...</div>
      ) : (
        <ul className="py-1">
          {suggestions.map((location) => (
            <li
              key={location.id}
              className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
              onClick={() => {
                onSelect({
                  code: location.code,
                  name: formatLocationName(location),
                });
                onSearchStateChange(false);
                setSuggestions([]);
              }}
            >
              <div className="font-medium">{formatLocationName(location)}</div>
              <div className="text-xs text-muted-foreground">
                {formatSubtext(location)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
