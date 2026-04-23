import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { useCreateVehicle, useVehicles } from "../../lib/hooks";
import { Text } from "../../components/ui/Text";
import { DRAWER_HEADER_HEIGHT } from "../../lib/constants";

type VehicleClass = "compact" | "suv" | "van" | "luxury" | "truck" | "bike";

const VEHICLE_CLASSES: VehicleClass[] = ["compact", "suv", "van", "luxury", "truck", "bike"];
const VEHICLE_CLASS_META: Record<VehicleClass, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  compact: { label: "compact", icon: "car-outline" },
  suv: { label: "suv", icon: "car-sport-outline" },
  van: { label: "van", icon: "bus-outline" },
  luxury: { label: "luxury", icon: "diamond-outline" },
  truck: { label: "truck", icon: "trail-sign-outline" },
  bike: { label: "bike", icon: "bicycle-outline" },
};
const CAR_BRANDS = [
  "Toyota",
  "Volkswagen",
  "Ford",
  "Nissan",
  "Hyundai",
  "Kia",
  "Suzuki",
  "Mazda",
  "Honda",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Chevrolet",
  "Renault",
  "Peugeot",
  "Citroen",
  "Fiat",
  "Jeep",
  "Land Rover",
  "Volvo",
  "Subaru",
  "Mitsubishi",
  "Isuzu",
  "Mini",
  "Porsche",
  "Lexus",
  "Infiniti",
  "Jaguar",
  "Alfa Romeo",
  "Dodge",
  "RAM",
  "GMC",
  "Cadillac",
  "Chrysler",
  "Opel",
  "Skoda",
  "SEAT",
  "Cupra",
  "Chery",
  "Haval",
  "Mahindra",
  "Tata",
  "BYD",
  "Geely",
  "MG",
  "Tesla",
  "Aston Martin",
  "Bentley",
  "Ferrari",
  "Lamborghini",
  "Maserati",
  "Rolls-Royce",
] as const;

function normalizeRegistration(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return "Could not create vehicle. Please try again.";
}

export default function DevicesScreen() {
  const insets = useSafeAreaInsets();
  const createVehicle = useCreateVehicle();
  const { data: vehicles, isLoading } = useVehicles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [registration, setRegistration] = useState("");
  const [nickname, setNickname] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [vehicleClass, setVehicleClass] = useState<VehicleClass>("compact");
  const [makePickerOpen, setMakePickerOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;
  const isSubmitting = createVehicle.isPending;
  const hasVehicles = (vehicles?.length ?? 0) > 0;

  const vehicleRows = useMemo(
    () =>
      (vehicles ?? []).map((vehicle) => (
        <Pressable key={vehicle.id} className="p-4 rounded-xl bg-zinc-800 active:opacity-90">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="font-sans-medium text-white">{vehicle.registration}</Text>
              <Text className="text-sm text-zinc-400">
                {[vehicle.nickname, vehicle.make, vehicle.model].filter(Boolean).join(" • ") ||
                  "No vehicle details"}
              </Text>
            </View>
            <Text className="text-zinc-400">{vehicle.vehicleClass}</Text>
          </View>
        </Pressable>
      )),
    [vehicles],
  );

  const resetForm = () => {
    setRegistration("");
    setNickname("");
    setMake("");
    setModel("");
    setColor("");
    setVehicleClass("compact");
    setFormError(null);
  };

  const closeDialog = () => {
    if (isSubmitting) {
      return;
    }
    setDialogOpen(false);
    setMakePickerOpen(false);
    setFormError(null);
  };

  const onOpenDialog = () => {
    setDialogOpen(true);
    setFormError(null);
  };

  const onSubmit = async () => {
    setFormError(null);
    const normalizedRegistration = normalizeRegistration(registration);
    if (!normalizedRegistration) {
      setFormError("Registration is required.");
      return;
    }

    try {
      await createVehicle.mutateAsync({
        registration: normalizedRegistration,
        nickname: nickname.trim(),
        make: make.trim() || undefined,
        model: model.trim() || undefined,
        color: color.trim() || undefined,
        vehicleClass,
      });
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <View
        className="flex-1 bg-base justify-center items-center"
        style={{ paddingTop: contentTopPadding }}
      >
        <Text className="text-zinc-400">Loading vehicles...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-base"
        contentContainerStyle={{
          padding: 24,
          paddingTop: contentTopPadding,
          paddingBottom: 48,
          flexGrow: 1,
        }}
      >
        <View className="mb-4 flex-row items-center justify-between gap-3">
          <Text className="text-lg font-sans-semibold text-white">Vehicles</Text>
          <Pressable
            onPress={onOpenDialog}
            className="flex-row items-center gap-2 rounded-lg bg-other px-4 py-2 active:opacity-90"
            accessibilityRole="button"
            accessibilityLabel="Add vehicle"
          >
            <Ionicons name="add-circle-outline" size={16} color="#ffffff" />
            <Text className="font-sans-medium text-base text-white">Add vehicle</Text>
          </Pressable>
        </View>

        {hasVehicles ? (
          <View className="gap-3">{vehicleRows}</View>
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-xl font-sans-semibold text-white text-center mb-2">
              No vehicles yet
            </Text>
            <Text className="text-zinc-400 text-center">
              Add a vehicle to quickly select it when creating bookings.
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={dialogOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDialog}
        statusBarTranslucent
      >
        <View className="flex-1 justify-center bg-black/70 px-5">
          <Pressable
            className="absolute inset-0"
            onPress={closeDialog}
            accessibilityRole="button"
            accessibilityLabel="Close add vehicle dialog"
            disabled={isSubmitting}
          />
          {makePickerOpen ? (
            <View className="max-h-[70%] rounded-2xl border border-zinc-700 bg-zinc-900 p-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-lg font-sans-semibold text-white">Select make</Text>
                <Pressable
                  onPress={() => setMakePickerOpen(false)}
                  className="rounded-md bg-zinc-800 p-2 active:opacity-90"
                  disabled={isSubmitting}
                >
                  <X size={18} color="#ffffff" />
                </Pressable>
              </View>
              <ScrollView className="max-h-[420px]">
                <View className="gap-2">
                  {CAR_BRANDS.map((brand) => {
                    const active = make === brand;
                    return (
                      <Pressable
                        key={brand}
                        onPress={() => {
                          setMake(brand);
                          setMakePickerOpen(false);
                        }}
                        className={`flex-row items-center justify-between rounded-lg border px-4 py-3 ${active ? "border-blue-500 bg-blue-600/20" : "border-zinc-700 bg-zinc-800"}`}
                      >
                        <Text className={active ? "text-blue-300" : "text-zinc-100"}>{brand}</Text>
                        {active ? <Ionicons name="checkmark" size={18} color="#93c5fd" /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : (
            <View className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-xl font-sans-semibold text-white">Add vehicle</Text>
                  <Text className="mt-1 text-zinc-400">Fill out vehicle details below.</Text>
                </View>
                <Pressable
                  onPress={closeDialog}
                  className="rounded-md bg-zinc-800 p-2 active:opacity-90"
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel="Close add vehicle dialog"
                >
                  <X size={18} color="#ffffff" />
                </Pressable>
              </View>

              {formError ? (
                <View className="mt-4 rounded-xl border border-red-500/50 bg-red-950/40 p-3">
                  <Text className="text-red-300">{formError}</Text>
                </View>
              ) : null}

              <View className="mt-4 gap-3">
                <View>
                  <Text className="mb-1 text-zinc-300">Registration *</Text>
                  <TextInput
                    value={registration}
                    onChangeText={setRegistration}
                    placeholder="e.g. AB12CDGP"
                    placeholderTextColor="#a1a1aa"
                    autoCapitalize="characters"
                    className="rounded-lg bg-zinc-800 px-4 py-3 text-white"
                    style={{ fontFamily: "Urbanist_400Regular" }}
                    editable={!isSubmitting}
                  />
                </View>
                <View>
                  <Text className="mb-1 text-zinc-300">Nickname</Text>
                  <TextInput
                    value={nickname}
                    onChangeText={setNickname}
                    placeholder="My daily car"
                    placeholderTextColor="#a1a1aa"
                    className="rounded-lg bg-zinc-800 px-4 py-3 text-white"
                    style={{ fontFamily: "Urbanist_400Regular" }}
                    editable={!isSubmitting}
                  />
                </View>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text className="mb-1 text-zinc-300">Make</Text>
                    <Pressable
                      onPress={() => setMakePickerOpen(true)}
                      className="flex-row items-center justify-between rounded-lg bg-zinc-800 px-4 py-3 active:opacity-90"
                      disabled={isSubmitting}
                      accessibilityRole="button"
                      accessibilityLabel="Select vehicle make"
                    >
                      <Text
                        className={make ? "text-white" : "text-zinc-400"}
                        style={{ fontFamily: "Urbanist_400Regular" }}
                      >
                        {make || "Select make"}
                      </Text>
                      <Ionicons name="chevron-down" size={18} color="#d4d4d8" />
                    </Pressable>
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-zinc-300">Model</Text>
                    <TextInput
                      value={model}
                      onChangeText={setModel}
                      placeholder="Corolla"
                      placeholderTextColor="#a1a1aa"
                      className="rounded-lg bg-zinc-800 px-4 py-3 text-white"
                      style={{ fontFamily: "Urbanist_400Regular" }}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
                <View>
                  <Text className="mb-1 text-zinc-300">Color</Text>
                  <TextInput
                    value={color}
                    onChangeText={setColor}
                    placeholder="White"
                    placeholderTextColor="#a1a1aa"
                    className="rounded-lg bg-zinc-800 px-4 py-3 text-white"
                    style={{ fontFamily: "Urbanist_400Regular" }}
                    editable={!isSubmitting}
                  />
                </View>
                <View>
                  <Text className="mb-2 text-zinc-300">Vehicle class</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {VEHICLE_CLASSES.map((klass) => {
                      const active = vehicleClass === klass;
                      const meta = VEHICLE_CLASS_META[klass];
                      return (
                        <Pressable
                          key={klass}
                          onPress={() => setVehicleClass(klass)}
                          className={`flex-row items-center gap-1 rounded-full border px-3 py-2 ${active ? "border-other bg-other/20" : "border-zinc-600 bg-zinc-800"}`}
                          disabled={isSubmitting}
                        >
                          <Ionicons
                            name={meta.icon}
                            size={14}
                            color={active ? "#3b82f6" : "#d4d4d8"}
                          />
                          <Text className={active ? "text-other" : "text-zinc-300"}>{meta.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View className="mt-5 flex-row gap-2">
                <Pressable
                  onPress={closeDialog}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 active:opacity-90"
                  disabled={isSubmitting}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#ffffff" />
                  <Text className="text-white">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={onSubmit}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 active:opacity-90"
                  disabled={isSubmitting}
                >
                  <Ionicons
                    name={isSubmitting ? "sync-outline" : "checkmark-circle-outline"}
                    size={16}
                    color="#ffffff"
                  />
                  <Text className="font-sans-medium text-base text-white">
                    {isSubmitting ? "Saving..." : "Save vehicle"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}
