import type { ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { DRAWER_HEADER_HEIGHT } from "../../lib/constants";
import { useWalkInStore } from "../../lib/stores/walkInStore";

function field(label: string, value: string | null | undefined): ReactNode {
  const text = value?.trim() ? value : "—";
  return (
    <View className="mt-3">
      <Text className="text-xs uppercase tracking-wide text-zinc-500">{label}</Text>
      <Text className="mt-1 text-white">{text}</Text>
    </View>
  );
}

export default function WalkInConfirmVehicleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scannedVehicle = useWalkInStore((s) => s.scannedVehicle);

  const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;

  if (!scannedVehicle?.registration) {
    return (
      <View className="flex-1 items-center justify-center bg-base px-6">
        <Text className="text-center text-zinc-400">No plate loaded. Go back to scan.</Text>
        <Pressable
          onPress={() => router.replace("/scan")}
          className="mt-4 rounded-lg bg-zinc-700 px-4 py-3 active:opacity-90"
        >
          <Text className="font-sans-medium text-white">Back to scan</Text>
        </Pressable>
      </View>
    );
  }

  const hasProfile =
    Boolean(scannedVehicle.make) ||
    Boolean(scannedVehicle.model) ||
    Boolean(scannedVehicle.vehicleId);

  return (
    <ScrollView
      className="flex-1 bg-base"
      contentContainerStyle={{ padding: 24, paddingTop: contentTopPadding, paddingBottom: 40 }}
    >
      <Text className="text-2xl font-sans-semibold text-white">Confirm vehicle</Text>
      <Text className="mt-2 text-zinc-400">
        Check with the customer that this matches the vehicle before continuing.
      </Text>

      <View className="mt-5 rounded-xl bg-zinc-800 p-4">
        <Text className="font-sans-medium text-white">Registration</Text>
        <Text className="mt-1 text-lg text-white">{scannedVehicle.registration}</Text>

        {!hasProfile ? (
          <Text className="mt-4 text-sm text-zinc-400">
            No saved vehicle profile for this plate yet. You can still create a walk-in; details
            will be captured on the next screen.
          </Text>
        ) : (
          <>
            {field("Make", scannedVehicle.make)}
            {field("Model", scannedVehicle.model)}
            {field("Color", scannedVehicle.color)}
            {field("Class", scannedVehicle.vehicleClass)}
            {field(
              "Loyalty points",
              scannedVehicle.loyaltyPoints !== undefined
                ? String(scannedVehicle.loyaltyPoints)
                : undefined,
            )}
          </>
        )}
      </View>

      <View className="mt-6 flex-row gap-3">
        <Pressable
          onPress={() => router.back()}
          className="flex-1 rounded-lg bg-zinc-700 px-4 py-3 active:opacity-90"
        >
          <Text className="text-center font-sans-medium text-white">Back</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/walk-in")}
          className="flex-1 rounded-lg bg-approve px-4 py-3 active:opacity-90"
        >
          <Text className="text-center font-sans-medium text-white">Looks correct</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
