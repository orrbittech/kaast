import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStripe } from "@stripe/stripe-react-native";
import { Text } from "../../../components/ui/Text";
import { DRAWER_HEADER_HEIGHT } from "../../../lib/constants";
import { useBookingPaymentIntent, useBookings, useSyncBookingPayment } from "../../../lib/hooks";

export default function PayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ "booking-id"?: string }>();
  const bookingId = params["booking-id"];
  const insets = useSafeAreaInsets();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const getIntent = useBookingPaymentIntent();
  const syncPayment = useSyncBookingPayment();
  const { data: bookings } = useBookings();
  const booking = useMemo(() => bookings?.find((item) => item.id === bookingId), [bookings, bookingId]);

  const payNow = async () => {
    if (!bookingId) return;
    const paymentIntent = await getIntent.mutateAsync(bookingId);
    const initialized = await initPaymentSheet({
      paymentIntentClientSecret: paymentIntent.clientSecret,
      merchantDisplayName: "KARR",
    });
    if (initialized.error) return;
    const paid = await presentPaymentSheet();
    if (paid.error) return;
    await syncPayment.mutateAsync(bookingId);
    router.replace(`/jobs/${bookingId}`);
  };

  return (
    <View
      className="flex-1 bg-base px-6"
      style={{ paddingTop: insets.top + DRAWER_HEADER_HEIGHT + 24 }}
    >
      <Text className="text-2xl font-sans-semibold text-white">Collect Payment</Text>
      <Text className="mt-2 text-zinc-400">
        Booking {booking?.bookingCode ?? bookingId} · Outstanding R{" "}
        {((booking?.outstandingCents ?? 0) / 100).toFixed(2)}
      </Text>
      <Pressable
        onPress={payNow}
        className="mt-6 rounded-lg bg-approve px-4 py-4 active:opacity-90"
      >
        <Text className="text-center font-sans-semibold text-white">Pay with Card</Text>
      </Pressable>
    </View>
  );
}
