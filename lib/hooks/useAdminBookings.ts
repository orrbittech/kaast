import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api";
import {
  adminWalkInBookingSchema,
  bookingSchema,
  releaseConfirmBodySchema,
  releaseRequestBodySchema,
  reserveKeysBodySchema,
  type AdminWalkInBookingBody,
} from "../api/schemas";

function useRefreshBookings() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["bookings"] }),
      queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
    ]);
  };
}

export function useAdminCreateWalkInBooking() {
  const refresh = useRefreshBookings();
  return useMutation({
    mutationFn: async (body: AdminWalkInBookingBody) => {
      const payload = adminWalkInBookingSchema.parse(body);
      const { data } = await apiClient.post("/admin/bookings/walk-in", payload);
      return bookingSchema.parse(data);
    },
    onSuccess: refresh,
  });
}

export function useAdminCollectKeys() {
  const refresh = useRefreshBookings();
  return useMutation({
    mutationFn: async ({
      bookingId,
      body,
    }: {
      bookingId: string;
      body: { keyTag?: string; keyLockerSlot?: string };
    }) => {
      const payload = reserveKeysBodySchema.parse(body);
      const { data } = await apiClient.post(
        `/admin/bookings/${bookingId}/keys/collect`,
        payload,
      );
      return bookingSchema.parse(data);
    },
    onSuccess: refresh,
  });
}

export function useAdminStartWash() {
  const refresh = useRefreshBookings();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await apiClient.post(`/admin/bookings/${bookingId}/start`);
      return bookingSchema.parse(data);
    },
    onSuccess: refresh,
  });
}

export function useAdminCompleteWash() {
  const refresh = useRefreshBookings();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await apiClient.post(`/admin/bookings/${bookingId}/complete`);
      return bookingSchema.parse(data);
    },
    onSuccess: refresh,
  });
}

export function useAdminReleaseRequest() {
  const refresh = useRefreshBookings();
  return useMutation({
    mutationFn: async ({
      bookingId,
      bookingCode,
    }: {
      bookingId: string;
      bookingCode: string;
    }) => {
      const payload = releaseRequestBodySchema.parse({ bookingCode });
      const { data } = await apiClient.post(
        `/admin/bookings/${bookingId}/keys/release-request`,
        payload,
      );
      return bookingSchema.parse(data);
    },
    onSuccess: refresh,
  });
}

export function useAdminReleaseConfirm() {
  const refresh = useRefreshBookings();
  return useMutation({
    mutationFn: async ({
      bookingId,
      bookingCode,
      pin,
    }: {
      bookingId: string;
      bookingCode: string;
      pin: string;
    }) => {
      const payload = releaseConfirmBodySchema.parse({ bookingCode, pin });
      const { data } = await apiClient.post(
        `/admin/bookings/${bookingId}/keys/release-confirm`,
        payload,
      );
      return bookingSchema.parse(data);
    },
    onSuccess: refresh,
  });
}

export function useBookingPaymentIntent() {
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await apiClient.post(
        `/admin/bookings/${bookingId}/payment-intent`,
      );
      return data as { clientSecret: string; amountCents: number; currency: "zar" };
    },
  });
}

export function useSyncBookingPayment() {
  const refresh = useRefreshBookings();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await apiClient.post(
        `/admin/bookings/${bookingId}/payment/sync`,
        {},
      );
      return bookingSchema.parse(data);
    },
    onSuccess: refresh,
  });
}
