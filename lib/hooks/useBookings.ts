import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api";
import {
  bookingListSchema,
  bookingSchema,
  createWalkInBookingSchema,
  type Booking,
  type CreateWalkInBookingBody,
} from "../api/schemas";

export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data } = await apiClient.get<Booking[]>("/bookings");
      return bookingListSchema.parse(data);
    },
  });
}

export function useCreateWalkInBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateWalkInBookingBody) => {
      const payload = createWalkInBookingSchema.parse(body);
      const { data } = await apiClient.post<Booking>("/bookings/walk-in", payload);
      return bookingSchema.parse(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
