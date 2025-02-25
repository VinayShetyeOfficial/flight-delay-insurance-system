import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OTPStore {
  expiryTime: number | null;
  email: string | null;
  setExpiryTime: (time: number | null) => void;
  setEmail: (email: string | null) => void;
  reset: () => void;
  isExpired: () => boolean;
  getTimeLeft: () => number;
}

export const useOTPStore = create<OTPStore>()(
  persist(
    (set, get) => ({
      expiryTime: null,
      email: null,
      setExpiryTime: (time) => set({ expiryTime: time }),
      setEmail: (email) => set({ email }),
      reset: () => set({ expiryTime: null, email: null }),
      isExpired: () => {
        const expiryTime = get().expiryTime;
        return !expiryTime || Date.now() >= expiryTime;
      },
      getTimeLeft: () => {
        const expiryTime = get().expiryTime;
        if (!expiryTime) return 0;
        const timeLeft = Math.max(
          0,
          Math.floor((expiryTime - Date.now()) / 1000)
        );
        return timeLeft;
      },
    }),
    {
      name: "otp-store",
    }
  )
);
