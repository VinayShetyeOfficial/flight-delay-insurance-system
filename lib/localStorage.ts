export const STORAGE_KEYS = {
  BOOKING_FORM: "bookingFormData",
  SELECTED_FLIGHT: "selectedFlightData",
  PASSENGER_INFO: "passengerData",
  ADDONS: "addonsData",
  INSURANCE: "selectedInsurance",
  INSURANCE_DETAILS: "insuranceDetails",
} as const;

export class LocalStorageService {
  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage: ${error}`);
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${error}`);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage: ${error}`);
    }
  }

  static clearBookingData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      this.removeItem(key);
    });
  }

  static saveInsuranceDetails(details: any): void {
    if (typeof window !== "undefined") {
      this.setItem(STORAGE_KEYS.INSURANCE_DETAILS, details);
    }
  }

  static getInsuranceDetails(): any {
    if (typeof window !== "undefined") {
      return this.getItem(STORAGE_KEYS.INSURANCE_DETAILS);
    }
    return null;
  }

  static clearInsuranceDetails(): void {
    if (typeof window !== "undefined") {
      this.removeItem(STORAGE_KEYS.INSURANCE_DETAILS);
    }
  }
}
