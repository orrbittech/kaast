import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../../../components/ui/Text";
import { DRAWER_HEADER_HEIGHT } from "../../../lib/constants";
import {
  useAdminCollectKeys,
  useAdminCompleteWash,
  useAdminReleaseConfirm,
  useAdminReleaseRequest,
  useAdminStartWash,
  useBookings,
} from "../../../lib/hooks";
import {
  formatBookingDateShort,
  formatBookingVehicleColor,
  formatBookingVehicleTitle,
  showKeyCustodyAfterWash,
} from "../../../lib/formatting/bookingDisplay";
import { expoReceiptPrinter } from "../../../lib/printing/ExpoReceiptPrinter";

export default function JobDetailScreen() {
  const params = useLocalSearchParams<{ "booking-id"?: string }>();
  const bookingId = params["booking-id"];
  const insets = useSafeAreaInsets();
  const { data: bookings } = useBookings();
  const collectKeys = useAdminCollectKeys();
  const startWash = useAdminStartWash();
  const completeWash = useAdminCompleteWash();
  const requestRelease = useAdminReleaseRequest();
  const confirmRelease = useAdminReleaseConfirm();
  const [keyTag, setKeyTag] = useState("");
  const [lockerSlot, setLockerSlot] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [pin, setPin] = useState("");

  const booking = useMemo(
    () => bookings?.find((row) => row.id === bookingId),
    [bookingId, bookings],
  );

  const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;

  useEffect(() => {
    if (!booking) return;
    setKeyTag(booking.keyTag ?? "");
  }, [booking?.id, booking?.keyTag]);

  if (!booking) {
    return (
      <View className="flex-1 items-center justify-center bg-base px-6">
        <Text className="text-center text-zinc-400">Booking not found.</Text>
      </View>
    );
  }

  const showKeyCustody = showKeyCustodyAfterWash(booking.visitStatus);
  const vehicleTitle = formatBookingVehicleTitle(booking.vehicle);
  const vehicleColor = formatBookingVehicleColor(booking.vehicle);

  return (
    <ScrollView
      className="flex-1 bg-base"
      contentContainerStyle={{ padding: 24, paddingTop: contentTopPadding, paddingBottom: 40 }}
    >
      <Text className="text-2xl font-sans-semibold text-white">Job {booking.bookingCode}</Text>
      <Text className="mt-1 text-zinc-400">
        {booking.visitStatus} · {booking.paymentStatus}
      </Text>

      <View className="mt-5 rounded-xl bg-zinc-800 p-4">
        <Text className="font-sans-medium text-white">Service</Text>
        <Text className="mt-1 text-zinc-400">{formatBookingDateShort(booking.scheduledAt)}</Text>
        {vehicleTitle ? (
          <Text className="mt-1 text-zinc-300">{vehicleTitle}</Text>
        ) : (
          <Text className="mt-1 text-zinc-400">Vehicle not linked</Text>
        )}
        {vehicleColor ? <Text className="text-zinc-300">{vehicleColor}</Text> : null}
        <Text className="mt-2 text-zinc-300">{booking.washPackageName ?? "Wash package"}</Text>
        <Text className="mt-2 text-zinc-300">
          Due: R {((booking.totalDueCents ?? 0) / 100).toFixed(2)} · Outstanding: R{" "}
          {((booking.outstandingCents ?? 0) / 100).toFixed(2)}
        </Text>
      </View>

      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={() => startWash.mutate(booking.id)}
          className="flex-1 rounded-lg bg-approve px-4 py-3 active:opacity-90"
        >
          <Text className="text-center font-sans-medium text-white">Start Wash</Text>
        </Pressable>
        <Pressable
          onPress={() => completeWash.mutate(booking.id)}
          className="flex-1 rounded-lg bg-approve px-4 py-3 active:opacity-90"
        >
          <Text className="text-center font-sans-medium text-white">Complete Wash</Text>
        </Pressable>
      </View>

      {showKeyCustody ? (
        <View className="mt-4 rounded-xl bg-zinc-800 p-4">
          <Text className="font-sans-medium text-white">Key custody</Text>
          <TextInput
            value={keyTag}
            onChangeText={setKeyTag}
            placeholder="Key tag"
            placeholderTextColor="#a1a1aa"
            className="mt-2 rounded-lg bg-zinc-700 px-4 py-3 text-white"
            style={{ fontFamily: "Urbanist_400Regular" }}
          />
          <TextInput
            value={lockerSlot}
            onChangeText={setLockerSlot}
            placeholder="Locker slot"
            placeholderTextColor="#a1a1aa"
            className="mt-2 rounded-lg bg-zinc-700 px-4 py-3 text-white"
            style={{ fontFamily: "Urbanist_400Regular" }}
          />
          <Pressable
            onPress={() =>
              collectKeys.mutate({ bookingId: booking.id, body: { keyTag, keyLockerSlot: lockerSlot } })
            }
            className="mt-3 rounded-lg bg-pending px-4 py-3 active:opacity-90"
          >
            <Text className="text-center font-sans-medium text-black">Collect Keys</Text>
          </Pressable>
        </View>
      ) : null}

      {Number(booking.outstandingCents ?? 0) > 0 ? (
        <Link href={`/pay/${booking.id}`} asChild>
          <Pressable className="mt-4 rounded-lg bg-pending px-4 py-3 active:opacity-90">
            <Text className="text-center font-sans-semibold text-black">Collect Payment</Text>
          </Pressable>
        </Link>
      ) : null}

      <View className="mt-4 rounded-xl bg-zinc-800 p-4">
        <Text className="font-sans-medium text-white">Release verification</Text>
        <TextInput
          value={bookingCode}
          onChangeText={setBookingCode}
          placeholder="Booking code"
          placeholderTextColor="#a1a1aa"
          className="mt-2 rounded-lg bg-zinc-700 px-4 py-3 text-white"
          style={{ fontFamily: "Urbanist_400Regular" }}
        />
        <TextInput
          value={pin}
          onChangeText={setPin}
          placeholder="Pickup PIN"
          placeholderTextColor="#a1a1aa"
          keyboardType="number-pad"
          className="mt-2 rounded-lg bg-zinc-700 px-4 py-3 text-white"
          style={{ fontFamily: "Urbanist_400Regular" }}
        />
        <Pressable
          onPress={() => requestRelease.mutate({ bookingId: booking.id, bookingCode })}
          className="mt-3 rounded-lg bg-pending px-4 py-3 active:opacity-90"
        >
          <Text className="text-center font-sans-medium text-black">Validate Claim Code</Text>
        </Pressable>
        <Pressable
          onPress={() => confirmRelease.mutate({ bookingId: booking.id, bookingCode, pin })}
          className="mt-3 rounded-lg bg-approve px-4 py-3 active:opacity-90"
        >
          <Text className="text-center font-sans-medium text-white">Release Keys</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() =>
          expoReceiptPrinter.print({
            bookingCode: booking.bookingCode,
            plate: booking.vehicle?.registration || "N/A",
            washPackageName: booking.washPackageName ?? "Wash",
            amountPaidCents: booking.amountPaidCents ?? 0,
            outstandingCents: booking.outstandingCents ?? 0,
          })
        }
        className="mt-4 rounded-lg bg-zinc-700 px-4 py-3 active:opacity-90"
      >
        <Text className="text-center font-sans-medium text-white">Print Receipt</Text>
      </Pressable>
    </ScrollView>
  );
}
