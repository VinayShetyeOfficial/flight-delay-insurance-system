import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseISODuration(duration: string): {
  hours: number;
  minutes: number;
} {
  const matches = duration.match(/PT(\d+H)?(\d+M)?/);
  const hours = matches?.[1] ? parseInt(matches[1]) : 0;
  const minutes = matches?.[2] ? parseInt(matches[2]) : 0;
  return { hours, minutes };
}
