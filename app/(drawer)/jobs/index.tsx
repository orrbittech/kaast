import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../../../components/ui/Text";
import { DRAWER_HEADER_HEIGHT } from "../../../lib/constants";
import {
  formatBookingDateShort,
  formatBookingVehicleSummaryLine,
} from "../../../lib/formatting/bookingDisplay";
import { useBookings } from "../../../lib/hooks";

export default function JobsScreen() {
  const insets = useSafeAreaInsets();
  const { data: bookings, isLoading } = useBookings();
  const activeBookings = (bookings ?? []).filter((booking) => booking.visitStatus !== "COMPLETED");

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-base px-6">
        <Text className="text-zinc-400">Loading jobs...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-base"
      contentContainerStyle={{
        padding: 24,
        paddingTop: insets.top + DRAWER_HEADER_HEIGHT + 24,
        paddingBottom: 40,
      }}
    >
      <Text className="text-2xl font-sans-semibold text-white">Today jobs</Text>
      <View className="mt-5 gap-3">
        {activeBookings.map((booking) => (
          <Link key={booking.id} href={`/jobs/${booking.id}`} asChild>
            <Pressable className="rounded-xl bg-zinc-800 p-4 active:opacity-90">
              <View className="flex-row items-start justify-between gap-2">
                <Text className="min-w-0 flex-1 pr-2 font-sans-medium text-white">{booking.bookingCode}</Text>
                <Text className="max-w-[55%] shrink-0 text-right text-xs text-zinc-400">
                  {booking.visitStatus} · {booking.paymentStatus}
                </Text>
              </View>
              <Text className="mt-2 text-zinc-400">{formatBookingDateShort(booking.scheduledAt)}</Text>
              <Text className="mt-1 text-zinc-300">{formatBookingVehicleSummaryLine(booking.vehicle)}</Text>
              <View className="mt-3 flex-row justify-end">
                <Ionicons name="chevron-forward" size={20} color="#a1a1aa" accessibilityLabel="Open job" />
              </View>
            </Pressable>
          </Link>
        ))}
        {activeBookings.length === 0 ? (
          <View className="rounded-xl bg-zinc-800 p-4">
            <Text className="text-zinc-400">No active jobs.</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
