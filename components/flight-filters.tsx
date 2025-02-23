import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface FlightFiltersProps {
  airlines: string[];
  onFilterChange: (filters: FilterOptions) => void;
  className?: string;
}

export interface FilterOptions {
  sortBy: string;
  airlines: string[];
  maxPrice: number | null;
  nonStop: boolean;
  cabinClass: string[];
}

export function FlightFilters({
  airlines,
  onFilterChange,
  className,
}: FlightFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: "price_low",
    airlines: [],
    maxPrice: null,
    nonStop: false,
    cabinClass: [],
  });

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Filter Flights</SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Sort Options */}
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort By</Label>
            <select
              id="sortBy"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
            >
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="duration_short">Duration: Shortest</option>
              <option value="departure_early">Departure: Earliest</option>
              <option value="arrival_early">Arrival: Earliest</option>
            </select>
          </div>

          <Separator />

          {/* Airlines Filter */}
          <div className="space-y-2">
            <Label>Airlines</Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-4">
              {airlines.map((airline) => (
                <div key={airline} className="flex items-center space-x-2">
                  <Checkbox
                    id={`airline-${airline}`}
                    checked={filters.airlines.includes(airline)}
                    onCheckedChange={(checked) => {
                      const updatedAirlines = checked
                        ? [...filters.airlines, airline]
                        : filters.airlines.filter((a) => a !== airline);
                      handleFilterChange({ airlines: updatedAirlines });
                    }}
                  />
                  <Label htmlFor={`airline-${airline}`} className="text-sm">
                    {airline}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Flight Type */}
          <div className="space-y-2">
            <Label>Flight Type</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nonStop"
                checked={filters.nonStop}
                onCheckedChange={(checked) =>
                  handleFilterChange({ nonStop: checked as boolean })
                }
              />
              <Label htmlFor="nonStop" className="text-sm">
                Non-stop flights only
              </Label>
            </div>
          </div>

          <Separator />

          {/* Cabin Class */}
          <div className="space-y-2">
            <Label>Cabin Class</Label>
            <div className="space-y-2">
              {["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"].map(
                (cabinClass) => (
                  <div key={cabinClass} className="flex items-center space-x-2">
                    <Checkbox
                      id={`class-${cabinClass}`}
                      checked={filters.cabinClass.includes(cabinClass)}
                      onCheckedChange={(checked) => {
                        const updatedClasses = checked
                          ? [...filters.cabinClass, cabinClass]
                          : filters.cabinClass.filter((c) => c !== cabinClass);
                        handleFilterChange({ cabinClass: updatedClasses });
                      }}
                    />
                    <Label
                      htmlFor={`class-${cabinClass}`}
                      className="text-sm capitalize"
                    >
                      {cabinClass.replace("_", " ").toLowerCase()}
                    </Label>
                  </div>
                )
              )}
            </div>
          </div>

          <Separator />

          {/* Reset Button */}
          <Button
            variant="default"
            className="w-full bg-black hover:bg-black/90 text-white"
            onClick={() => {
              const defaultFilters = {
                sortBy: "price_low",
                airlines: [],
                maxPrice: null,
                nonStop: false,
                cabinClass: [],
              };
              setFilters(defaultFilters);
              onFilterChange(defaultFilters);
            }}
          >
            Reset Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
