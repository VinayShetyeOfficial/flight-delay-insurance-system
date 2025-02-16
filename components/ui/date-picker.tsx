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
  date?: Date;
  setDate: (date: Date | undefined) => void;
  disablePastDates?: boolean;
  minDate?: Date;
  defaultMonth?: Date;
}

export function DatePicker({
  date,
  setDate,
  disablePastDates = true,
  minDate,
  defaultMonth,
}: DatePickerProps) {
  const disableDate = (date: Date) => {
    if (disablePastDates) {
      // Set time to midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return true;
    }

    if (minDate) {
      minDate.setHours(0, 0, 0, 0);
      return date < minDate;
    }

    return false;
  };

  // If no date is selected and minDate is provided, use it as initial value
  React.useEffect(() => {
    if (!date && minDate && !disableDate(minDate)) {
      setDate(minDate);
    }
  }, [minDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={disableDate}
          initialFocus
          defaultMonth={defaultMonth || minDate || new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
