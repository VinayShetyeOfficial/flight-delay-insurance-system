"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date | null;
  setDate: (date: Date | null) => void;
  /**
   * Whether to disable all past dates. Default: true
   */
  disablePastDates?: boolean;
  /**
   * If set, disables any date before this day.
   */
  minDate?: Date;
  /**
   * The default month to display if no date is selected.
   */
  defaultMonth?: Date;
  /**
   * Disables the entire picker (button + calendar).
   */
  disabled?: boolean;
  placeholder?: string;
  clearable?: boolean;
}

export function DatePicker({
  date,
  setDate,
  disablePastDates = true,
  minDate,
  defaultMonth,
  disabled = false,
  placeholder = "Pick a date",
  clearable = true,
}: DatePickerProps) {
  /**
   * Function to determine if a given date should be disabled.
   * 1. If `disablePastDates` is true, disable dates before today.
   * 2. If `minDate` is set, disable dates before `minDate`.
   */
  const disableDate = (day: Date) => {
    if (disablePastDates) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (day < today) return true;
    }

    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (day < min) return true;
    }

    return false;
  };

  const handleSelect = (day: Date | undefined) => {
    setDate(day || null);
  };

  /**
   * If no date is selected and `minDate` is valid, set it as the initial date.
   */
  React.useEffect(() => {
    if (!date && minDate && !disableDate(minDate)) {
      setDate(minDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            disabled && "bg-muted cursor-not-allowed opacity-50"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>

      {!disabled && (
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={handleSelect}
            disabled={disableDate}
            initialFocus
            defaultMonth={date || defaultMonth || minDate || new Date()}
          />
        </PopoverContent>
      )}
    </Popover>
  );
}
