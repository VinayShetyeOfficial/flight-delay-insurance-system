import { create } from "zustand"
import type { Booking } from "@/types/booking"

interface BookingState {
  bookings: Booking[]
  setBookings: (bookings: Booking[]) => void
  addBooking: (booking: Booking) => void
  updateBookingStatus: (flightNumber: string, status: string) => void
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBookingStatus: (flightNumber, status) =>
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.flightNumber === flightNumber ? { ...booking, status } : booking,
      ),
    })),
}))

