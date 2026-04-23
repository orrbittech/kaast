import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApiError } from "../../lib/api";
import { Modal, Pressable, ScrollView, TextInput, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { DRAWER_HEADER_HEIGHT } from "../../lib/constants";
import { useLocations, useWashPackages, useAdminCreateWalkInBooking } from "../../lib/hooks";
import { notifyWalkInBookedIn } from "../../lib/notifications/local";
import { useWalkInStore } from "../../lib/stores/walkInStore";

function queryErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    return typeof message === "string" ? message : "Request failed.";
  }
  return "Something went wrong.";
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as ApiError).code === "string" &&
    "message" in error
  );
}

function createWalkInErrorMessage(error: unknown): string {
  if (isApiError(error) && error.status === 403) {
    return "Admin access required. Add your Clerk user id to ADMIN_CLERK_USER_IDS on the server, or grant an admin role in Clerk (see server .env.example).";
  }
  if (isApiError(error)) {
    return error.message;
  }
  return queryErrorMessage(error);
}

type WashPackageLineDraft = { washPackageId: string; quantity: number };

export default function WalkInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const {
    data: locations,
    isPending: locationsPending,
    isError: locationsError,
    error: locationsErr,
  } = useLocations();
  const {
    data: washPackages,
    isPending: washPackagesPending,
    isError: washPackagesError,
    error: washPackagesErr,
  } = useWashPackages();
  const createWalkIn = useAdminCreateWalkInBooking();
  const {
    scannedVehicle,
    vehicleRegistration,
    paymentTiming,
    locationId,
    customerCellNumber,
    notes,
    setVehicleRegistration,
    setPaymentTiming,
    setLocationId,
    setCustomerCellNumber,
    setNotes,
    reset,
  } = useWalkInStore();
  const [washPackageLineItems, setWashPackageLineItems] = useState<WashPackageLineDraft[]>([]);
  const [washPackageModalOpen, setWashPackageModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;
  const selectedLocation = useMemo(
    () => locations?.find((location) => location.id === locationId) ?? null,
    [locationId, locations],
  );

  const catalogIdSet = useMemo(
    () => new Set((washPackages ?? []).map((pkg) => pkg.id)),
    [washPackages],
  );

  const orderedValidWashLines = useMemo(
    () =>
      washPackageLineItems.filter(
        (line) => catalogIdSet.has(line.washPackageId) && line.quantity >= 1,
      ),
    [washPackageLineItems, catalogIdSet],
  );

  const washPackageTriggerSummary = useMemo(() => {
    const n = orderedValidWashLines.length;
    if (n === 0) {
      return { mode: "empty" as const };
    }
    if (n === 1) {
      const pkg = (washPackages ?? []).find((p) => p.id === orderedValidWashLines[0].washPackageId);
      if (!pkg) {
        return { mode: "empty" as const };
      }
      return { mode: "single" as const, pkg };
    }
    let totalCents = 0;
    let hasMissingPrice = false;
    for (const line of orderedValidWashLines) {
      const pkg = (washPackages ?? []).find((p) => p.id === line.washPackageId);
      if (!pkg) {
        continue;
      }
      if (pkg.priceCents == null) {
        hasMissingPrice = true;
        break;
      }
      totalCents += pkg.priceCents * line.quantity;
    }
    return {
      mode: "multi" as const,
      count: n,
      totalCents: hasMissingPrice ? null : totalCents,
    };
  }, [orderedValidWashLines, washPackages]);

  const clearForm = useCallback(() => {
    reset();
    setWashPackageLineItems([]);
    setWashPackageModalOpen(false);
    setLocationModalOpen(false);
    setCreateError(null);
  }, [reset]);

  useEffect(() => () => clearForm(), [clearForm]);

  const onCreate = async () => {
    setCreateError(null);
    const normalizedPlate = vehicleRegistration.trim().toUpperCase().replace(/\s+/g, "");
    if (!normalizedPlate) {
      setCreateError("Vehicle plate is required.");
      return;
    }
    if (orderedValidWashLines.length < 1) {
      setCreateError("Please choose at least one wash package.");
      return;
    }
    if (!customerCellNumber.trim()) {
      setCreateError("Customer cell number is required.");
      return;
    }
    if (!selectedLocation?.id) {
      setCreateError("Please choose one location.");
      return;
    }
    const normalizedCellNumber = customerCellNumber.replace(/[^\d+]/g, "").trim();
    if (normalizedCellNumber.length < 7) {
      setCreateError("Customer cell number looks invalid.");
      return;
    }

    const compiledNotes = [
      notes.trim(),
      scannedVehicle?.vin ? `VIN: ${scannedVehicle.vin}` : "",
      scannedVehicle?.make ? `Make: ${scannedVehicle.make}` : "",
      scannedVehicle?.model ? `Model: ${scannedVehicle.model}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      const created = await createWalkIn.mutateAsync({
        customerCellNumber: normalizedCellNumber,
        vehicleRegistration: normalizedPlate,
        paymentTiming,
        locationId: selectedLocation?.id,
        notes: compiledNotes || undefined,
        washPackageLineItems: orderedValidWashLines,
      });
      await notifyWalkInBookedIn({
        bookingCode: created.bookingCode,
        plate: normalizedPlate,
      });
      clearForm();
      await router.push(`/jobs/${created.id}`);
    } catch (err) {
      setCreateError(createWalkInErrorMessage(err));
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-base"
      contentContainerStyle={{ padding: 24, paddingTop: contentTopPadding, paddingBottom: 40 }}
    >
      <Text className="text-2xl font-sans-semibold text-white">Create Walk-In</Text>
      <Text className="mt-2 text-zinc-400">
        Prefilled from scan. Confirm details and create the booking.
      </Text>

      {createError ? (
        <View className="mt-4 rounded-xl border border-red-500/40 bg-red-950/40 p-4">
          <Text className="text-red-300">{createError}</Text>
        </View>
      ) : null}

      <View className="mt-5 rounded-xl bg-zinc-800 p-4">
        <Text className="font-sans-medium text-white">Vehicle plate</Text>
        <TextInput
          value={vehicleRegistration}
          onChangeText={setVehicleRegistration}
          placeholder="e.g. AB12CDGP"
          placeholderTextColor="#a1a1aa"
          autoCapitalize="characters"
          className="mt-2 rounded-lg bg-zinc-700 px-4 py-3 text-white"
          style={{ fontFamily: "Urbanist_400Regular" }}
        />
        {scannedVehicle?.make || scannedVehicle?.model ? (
          <Text className="mt-2 text-zinc-300">
            {[scannedVehicle.make, scannedVehicle.model].filter(Boolean).join(" · ")}
          </Text>
        ) : null}
        {scannedVehicle?.color ? (
          <Text className="mt-1 text-sm text-zinc-400">Color: {scannedVehicle.color}</Text>
        ) : null}
        {scannedVehicle?.vehicleClass ? (
          <Text className="mt-1 text-sm text-zinc-400">Class: {scannedVehicle.vehicleClass}</Text>
        ) : null}
        {scannedVehicle?.loyaltyPoints !== undefined ? (
          <Text className="mt-1 text-sm text-zinc-400">
            Loyalty points: {scannedVehicle.loyaltyPoints}
          </Text>
        ) : null}
      </View>

      <View className="mt-4 rounded-xl bg-zinc-800 p-4">
        <Text className="font-sans-medium text-white">Customer cell number</Text>
        <TextInput
          value={customerCellNumber}
          onChangeText={setCustomerCellNumber}
          placeholder="+27..."
          keyboardType="phone-pad"
          placeholderTextColor="#a1a1aa"
          className="mt-2 rounded-lg bg-zinc-700 px-4 py-3 text-white"
          style={{ fontFamily: "Urbanist_400Regular" }}
        />
      </View>

      <View className="mt-4 rounded-xl bg-zinc-800 p-4">
        <Text className="font-sans-medium text-white">Wash package</Text>
        {washPackagesPending ? (
          <Text className="mt-2 text-zinc-400">Loading…</Text>
        ) : washPackagesError ? (
          <Text className="mt-2 text-red-400">{queryErrorMessage(washPackagesErr)}</Text>
        ) : (washPackages?.length ?? 0) === 0 ? (
          <Text className="mt-2 text-zinc-400">No wash packages configured.</Text>
        ) : (
          <>
            <Pressable
              onPress={() => setWashPackageModalOpen(true)}
              className="mt-2 flex-row items-center rounded-lg bg-zinc-700 px-4 py-3 active:opacity-90"
            >
              <View className="min-w-0 flex-1">
                {washPackageTriggerSummary.mode === "single" ? (
                  <>
                    <Text
                      className="font-sans-medium text-white"
                      numberOfLines={1}
                      style={{ fontFamily: "Urbanist_400Regular" }}
                    >
                      {washPackageTriggerSummary.pkg.name}
                    </Text>
                    <Text className="mt-0.5 text-zinc-300" numberOfLines={1}>
                      R {(washPackageTriggerSummary.pkg.priceCents ?? 0) / 100} ·{" "}
                      {washPackageTriggerSummary.pkg.vehicleClass}
                    </Text>
                  </>
                ) : washPackageTriggerSummary.mode === "multi" ? (
                  <>
                    <Text
                      className="font-sans-medium text-white"
                      numberOfLines={1}
                      style={{ fontFamily: "Urbanist_400Regular" }}
                    >
                      {washPackageTriggerSummary.count} packages
                    </Text>
                    {washPackageTriggerSummary.totalCents != null ? (
                      <Text className="mt-0.5 text-zinc-300" numberOfLines={1}>
                        Total R {washPackageTriggerSummary.totalCents / 100}
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <Text className="text-zinc-400" style={{ fontFamily: "Urbanist_400Regular" }}>
                    Choose wash packages
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-down" size={22} color="#a1a1aa" />
            </Pressable>

            <Modal
              visible={washPackageModalOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setWashPackageModalOpen(false)}
            >
              <View className="flex-1 justify-center px-6">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss wash package picker"
                  className="absolute inset-0 bg-black/60"
                  onPress={() => setWashPackageModalOpen(false)}
                />
                <View
                  className="overflow-hidden rounded-2xl bg-zinc-800"
                  style={{ maxHeight: windowHeight * 0.7 }}
                >
                  <View className="flex-row items-center justify-between border-b border-zinc-700 px-4 py-3">
                    <Text className="font-sans-semibold text-lg text-white">Wash package</Text>
                    <Pressable
                      onPress={() => setWashPackageModalOpen(false)}
                      hitSlop={12}
                      accessibilityRole="button"
                      accessibilityLabel="Close"
                    >
                      <Ionicons name="close" size={26} color="#fafafa" />
                    </Pressable>
                  </View>
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    className="px-3 py-3"
                    contentContainerClassName="gap-2 pb-2"
                    style={{ maxHeight: windowHeight * 0.48 }}
                  >
                    {(washPackages ?? []).map((washPackage) => {
                      const isSelected = washPackageLineItems.some(
                        (line) => line.washPackageId === washPackage.id,
                      );
                      return (
                        <Pressable
                          key={washPackage.id}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          accessibilityLabel={`${washPackage.name}, ${isSelected ? "selected" : "not selected"}`}
                          onPress={() => {
                            setWashPackageLineItems((prev) => {
                              if (prev.some((line) => line.washPackageId === washPackage.id)) {
                                return prev.filter((line) => line.washPackageId !== washPackage.id);
                              }
                              return [...prev, { washPackageId: washPackage.id, quantity: 1 }];
                            });
                          }}
                          className={`rounded-lg p-3 ${isSelected ? "bg-approve" : "bg-zinc-700"}`}
                        >
                          <Text className="font-sans-medium text-white">{washPackage.name}</Text>
                          <Text className="text-zinc-300">
                            R {(washPackage.priceCents ?? 0) / 100} · {washPackage.vehicleClass}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                  <View className="border-t border-zinc-700 px-3 pb-3 pt-3">
                    <Pressable
                      onPress={() => setWashPackageModalOpen(false)}
                      accessibilityRole="button"
                      accessibilityLabel="Done"
                      className="rounded-lg bg-approve px-4 py-4 active:opacity-90"
                    >
                      <Text className="text-center font-sans-semibold text-white">Done</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>

      <View className="mt-4">
        <Text className="mb-2 font-sans-medium text-white">Location</Text>
        {locationsPending ? (
          <Text className="text-zinc-400">Loading…</Text>
        ) : locationsError ? (
          <Text className="text-red-400">{queryErrorMessage(locationsErr)}</Text>
        ) : (locations?.length ?? 0) === 0 ? (
          <Text className="text-zinc-400">No locations configured.</Text>
        ) : (
          <>
            <Pressable
              onPress={() => setLocationModalOpen(true)}
              className="flex-row items-center rounded-lg bg-zinc-800 px-4 py-3 active:opacity-90"
            >
              <View className="min-w-0 flex-1">
                {selectedLocation ? (
                  <Text
                    className="font-sans-medium text-white"
                    numberOfLines={1}
                    style={{ fontFamily: "Urbanist_400Regular" }}
                  >
                    {selectedLocation.name}
                  </Text>
                ) : (
                  <Text className="text-zinc-400" style={{ fontFamily: "Urbanist_400Regular" }}>
                    Choose one location
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-down" size={22} color="#a1a1aa" />
            </Pressable>

            <Modal
              visible={locationModalOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setLocationModalOpen(false)}
            >
              <View className="flex-1 justify-center px-6">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss location picker"
                  className="absolute inset-0 bg-black/60"
                  onPress={() => setLocationModalOpen(false)}
                />
                <View
                  className="overflow-hidden rounded-2xl bg-zinc-800"
                  style={{ maxHeight: windowHeight * 0.7 }}
                >
                  <View className="flex-row items-center justify-between border-b border-zinc-700 px-4 py-3">
                    <Text className="font-sans-semibold text-lg text-white">Location</Text>
                    <Pressable
                      onPress={() => setLocationModalOpen(false)}
                      hitSlop={12}
                      accessibilityRole="button"
                      accessibilityLabel="Close"
                    >
                      <Ionicons name="close" size={26} color="#fafafa" />
                    </Pressable>
                  </View>
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    className="px-3 py-3"
                    contentContainerClassName="gap-2 pb-2"
                    style={{ maxHeight: windowHeight * 0.48 }}
                  >
                    {(locations ?? []).map((location) => {
                      const isSelected = locationId === location.id;
                      return (
                        <Pressable
                          key={location.id}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          accessibilityLabel={`${location.name}, ${isSelected ? "selected" : "not selected"}`}
                          onPress={() => {
                            setLocationId(location.id);
                            setLocationModalOpen(false);
                          }}
                          className={`rounded-lg p-3 ${isSelected ? "bg-approve" : "bg-zinc-700"}`}
                        >
                          <Text className="font-sans-medium text-white">{location.name}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>

      <View className="mt-4">
        <Text className="mb-2 font-sans-medium text-white">Payment timing</Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => setPaymentTiming("PAY_NOW")}
            className={`rounded-lg px-4 py-3 ${
              paymentTiming === "PAY_NOW" ? "bg-approve" : "bg-zinc-800"
            }`}
          >
            <Text className="text-white">Pay now</Text>
          </Pressable>
          <Pressable
            onPress={() => setPaymentTiming("PAY_AT_PICKUP")}
            className={`rounded-lg px-4 py-3 ${
              paymentTiming === "PAY_AT_PICKUP" ? "bg-pending" : "bg-zinc-800"
            }`}
          >
            <Text className={paymentTiming === "PAY_AT_PICKUP" ? "text-black" : "text-white"}>
              Pay at collection
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-4 rounded-xl bg-zinc-800 p-4">
        <Text className="font-sans-medium text-white">Extra notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional notes for staff"
          placeholderTextColor="#a1a1aa"
          multiline
          className="mt-2 rounded-lg bg-zinc-700 px-4 py-3 text-white"
          style={{ fontFamily: "Urbanist_400Regular", minHeight: 80, textAlignVertical: "top" }}
        />
      </View>

      <Pressable
        disabled={createWalkIn.isPending}
        onPress={onCreate}
        className="mt-6 rounded-lg bg-approve px-4 py-4 active:opacity-90 disabled:opacity-50"
      >
        <Text className="text-center font-sans-semibold text-white">
          {createWalkIn.isPending ? "Creating..." : "Book In"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
