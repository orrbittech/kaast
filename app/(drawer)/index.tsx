import { View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import {
  useOrganizations,
  useLocations,
  useDevices,
  useMediaSession,
} from "../../lib/hooks";
import { Text } from "../../components/ui/Text";
import { DRAWER_HEADER_HEIGHT } from "../../lib/constants";

/**
 * Dashboard - overview of devices, media, playlists, and now playing.
 * Card-based layout with greeting, now-playing, devices, and quick links.
 */
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { data: orgs } = useOrganizations();
  const firstOrgId = orgs?.[0]?.id;
  const { data: locations } = useLocations(firstOrgId);
  const firstLocationId = locations?.[0]?.id;
  const { data: devices } = useDevices(firstLocationId);
  const firstDeviceId = devices?.[0]?.deviceId;
  const { data: session } = useMediaSession(firstDeviceId);

  const greeting = user?.firstName
    ? `Hi, ${user.firstName}`
    : "Welcome back";

  return (
    <ScrollView
      className="flex-1 bg-base"
      contentContainerStyle={{
        flexGrow: 1,
        padding: 24,
        paddingTop: insets.top + DRAWER_HEADER_HEIGHT + 24,
      }}
    >
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-sans-semibold text-white">
          {greeting}
        </Text>
      </View>

      {/* Now Playing */}
      <View className="mb-6">
        <Text className="text-lg font-sans-semibold text-white mb-3">
          Now Playing
        </Text>
        <View className="p-4 rounded-xl bg-zinc-800">
          {session?.playing ? (
            <>
              <Text className="font-sans-medium text-white">
                {session.mediaUrl
                  ? new URL(session.mediaUrl).pathname.split("/").pop() ?? "Media"
                  : "Unknown"}
              </Text>
              <Text className="text-sm text-zinc-400 mt-1">
                {devices?.[0]?.name ?? "Device"} •{" "}
                {Math.floor(session.position / 60)}:
                {String(Math.floor(session.position % 60)).padStart(2, "0")} /{" "}
                {Math.floor(session.duration / 60)}:
                {String(Math.floor(session.duration % 60)).padStart(2, "0")}
              </Text>
              <Link href={`/control/${firstDeviceId}`} asChild>
                <Pressable className="mt-3 py-2 px-4 rounded-lg bg-approve self-start active:opacity-90">
                  <Text className="font-sans-medium text-white">Control</Text>
                </Pressable>
              </Link>
            </>
          ) : (
            <View className="items-center py-4">
              <Text className="text-zinc-400 text-center">
                Nothing playing. Select a device to start.
              </Text>
              <Link href="/devices" asChild>
                <Pressable className="mt-3 py-2 px-4 rounded-lg bg-approve active:opacity-90">
                  <Text className="font-sans-medium text-white">View Devices</Text>
                </Pressable>
              </Link>
            </View>
          )}
        </View>
      </View>

      {/* Devices Overview */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-sans-semibold text-white">
            Devices
          </Text>
          <Link href="/devices" asChild>
            <Pressable>
              <Text className="text-other text-sm">See all</Text>
            </Pressable>
          </Link>
        </View>
        <View className="gap-3">
          {devices?.slice(0, 3).map((device) => (
            <Link key={device.id} href={`/control/${device.deviceId}`} asChild>
              <Pressable className="p-4 rounded-xl bg-zinc-800 active:opacity-90">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="font-sans-medium text-white">
                      {device.name}
                    </Text>
                    <Text className="text-sm text-zinc-400">
                      {locations?.[0]?.name ?? "Location"} • {device.status}
                    </Text>
                  </View>
                  <Text className="text-other">→</Text>
                </View>
              </Pressable>
            </Link>
          ))}
          {(!devices || devices.length === 0) && (
            <View className="p-4 rounded-xl bg-zinc-800 items-center">
              <Text className="text-zinc-400 text-center">
                No devices yet. Pair a TV to get started.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Media & Playlists */}
      <View className="gap-3">
        <Link href="/media" asChild>
          <Pressable className="p-4 rounded-xl bg-zinc-800 active:opacity-90">
            <View className="flex-row justify-between items-center">
              <Text className="font-sans-medium text-white">Media</Text>
              <Text className="text-other">→</Text>
            </View>
            <Text className="text-sm text-zinc-400 mt-1">
              Browse and manage your media
            </Text>
          </Pressable>
        </Link>
        <Link href="/playlists" asChild>
          <Pressable className="p-4 rounded-xl bg-zinc-800 active:opacity-90">
            <View className="flex-row justify-between items-center">
              <Text className="font-sans-medium text-white">Playlists</Text>
              <Text className="text-other">→</Text>
            </View>
            <Text className="text-sm text-zinc-400 mt-1">
              Create and organize playlists
            </Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}
