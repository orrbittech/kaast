import { useEffect, useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { CameraView, type BarcodeScanningResult, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { DRAWER_HEADER_HEIGHT } from "../../lib/constants";
import { parseDiscPayload } from "../../lib/disc/parseDiscPayload";
import { useAdminVehicleLookup } from "../../lib/hooks";
import { useWalkInStore } from "../../lib/stores/walkInStore";

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [manualPlate, setManualPlate] = useState("");
  const [lastRaw, setLastRaw] = useState("");
  const setScannedVehicle = useWalkInStore((state) => state.setScannedVehicle);
  const plateLookup = useAdminVehicleLookup();

  useEffect(() => {
    plateLookup.reset();
  }, [manualPlate]);

  const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;

  const canScan = useMemo(() => permission?.granted ?? false, [permission?.granted]);

  const applyParsedPayload = (raw: string) => {
    const parsed = parseDiscPayload(raw);
    if (!parsed) return;
    setScannedVehicle({
      registration: parsed.registration,
      vin: parsed.vin,
      make: parsed.make,
      model: parsed.model,
      rawPayload: parsed.raw,
    });
    router.push("/walk-in");
  };

  const onBarcodeScanned = (result: BarcodeScanningResult) => {
    if (!result.data || result.data === lastRaw) return;
    setLastRaw(result.data);
    applyParsedPayload(result.data);
  };

  const submitManualPlate = async () => {
    const registration = manualPlate.trim().toUpperCase().replace(/\s+/g, "");
    if (!registration) return;
    try {
      const data = await plateLookup.mutateAsync(registration);
      if (data.found) {
        const v = data.vehicle;
        setScannedVehicle({
          registration: v.registration,
          vehicleId: v.id,
          make: v.make ?? null,
          model: v.model ?? null,
          color: v.color ?? null,
          vehicleClass: v.vehicleClass,
          loyaltyPoints: v.loyaltyPoints,
        });
      } else {
        setScannedVehicle({ registration });
      }
      router.push("/walk-in-confirm-vehicle");
    } catch {
      // Error surfaced via plateLookup.isError / plateLookup.error below
    }
  };

  const lookupErrorMessage =
    plateLookup.error && typeof plateLookup.error === "object" && "message" in plateLookup.error
      ? String((plateLookup.error as { message: string }).message)
      : plateLookup.error
        ? String(plateLookup.error)
        : "";

  return (
    <View className="flex-1 bg-base px-6" style={{ paddingTop: contentTopPadding }}>
      <Text className="text-2xl font-sans-semibold text-white">Scan Disc</Text>
      <Text className="mt-2 text-zinc-400">
        Scan the license disc code (PDF417/QR). If scanning fails, enter the plate manually.
      </Text>

      {!canScan ? (
        <Pressable
          onPress={requestPermission}
          className="mt-4 rounded-lg bg-pending px-4 py-3 active:opacity-90"
        >
          <Text className="text-center font-sans-medium text-black">Enable Camera</Text>
        </Pressable>
      ) : (
        <View className="mt-5 h-72 overflow-hidden rounded-xl bg-zinc-900">
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={onBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["pdf417", "qr", "code128", "code39"],
            }}
          />
        </View>
      )}

      <View className="mt-6 rounded-xl bg-zinc-800 p-4">
        <Text className="mb-2 font-sans-medium text-white">Manual plate entry</Text>
        <TextInput
          value={manualPlate}
          onChangeText={setManualPlate}
          placeholder="e.g. AB12CDGP"
          placeholderTextColor="#a1a1aa"
          autoCapitalize="characters"
          className="rounded-lg bg-zinc-700 px-4 py-3 text-white"
          style={{ fontFamily: "Urbanist_400Regular" }}
        />
        {plateLookup.isError && lookupErrorMessage ? (
          <Text className="mt-2 text-sm text-red-400">{lookupErrorMessage}</Text>
        ) : null}
        <Pressable
          onPress={() => void submitManualPlate()}
          disabled={plateLookup.isPending}
          className="mt-3 rounded-lg bg-approve px-4 py-3 active:opacity-90 disabled:opacity-50"
        >
          <Text className="text-center font-sans-medium text-white">
            {plateLookup.isPending ? "Looking up…" : "Use Plate"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
