import { View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";
import {
  useOrganizations,
  useLocations,
  useDevices,
} from "../../lib/hooks";
import { Text } from "../../components/ui/Text";
import { DRAWER_HEADER_HEIGHT } from "../../lib/constants";

/**
 * Devices page - list all devices by location.
 */
export default function DevicesScreen() {
  const insets = useSafeAreaInsets();
  const { data: orgs, isLoading: orgsLoading } = useOrganizations();
  const firstOrgId = orgs?.[0]?.id;
  const { data: locations, isLoading: locationsLoading } =
    useLocations(firstOrgId);
  const firstLocationId = locations?.[0]?.id;
  const { data: devices, isLoading: devicesLoading } =
    useDevices(firstLocationId);

  const isLoading = orgsLoading || locationsLoading || devicesLoading;

  const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;

  if (isLoading) {
    return (
      <View
        className="flex-1 bg-base justify-center items-center"
        style={{ paddingTop: contentTopPadding }}
      >
        <Text className="text-zinc-400">Loading devices...</Text>
      </View>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <View
        className="flex-1 bg-base justify-center items-center px-6"
        style={{ paddingTop: contentTopPadding }}
      >
        <Text className="text-xl font-sans-semibold text-white text-center mb-2">
          No devices yet
        </Text>
        <Text className="text-zinc-400 text-center">
          Pair a TV device to control media playback from your phone.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-base"
      contentContainerStyle={{
        padding: 24,
        paddingTop: contentTopPadding,
        paddingBottom: 48,
      }}
    >
      <Text className="text-lg font-sans-semibold text-white mb-4">
        {locations?.[0]?.name ?? "Devices"}
      </Text>
      <View className="gap-3">
        {devices.map((device) => (
          <Link key={device.id} href={`/control/${device.deviceId}`} asChild>
            <Pressable className="p-4 rounded-xl bg-zinc-800 active:opacity-90">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="font-sans-medium text-white">
                    {device.name}
                  </Text>
                  <Text className="text-sm text-zinc-400">
                    {device.status} • {device.deviceId}
                  </Text>
                </View>
                <Text className="text-other">→</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}
