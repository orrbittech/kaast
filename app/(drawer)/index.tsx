import type { ComponentProps } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useBookings, useLocations, useWashPackages } from "../../lib/hooks";
import { Text } from "../../components/ui/Text";
import { DRAWER_HEADER_HEIGHT } from "../../lib/constants";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

function QuickActionTile({
  href,
  icon,
  label,
}: {
  href: string;
  icon: IoniconName;
  label: string;
}) {
  return (
    <View className="flex-1">
      <Link href={href} asChild>
        <Pressable
          className="rounded-xl bg-zinc-800 p-4 active:opacity-90 flex-1 justify-center"
          style={{ minHeight: 96 }}
        >
          <View className="flex-row items-center justify-center gap-2 px-1">
            <Ionicons name={icon} size={20} color="#ffffff" />
            <Text className="font-sans-medium text-white shrink" numberOfLines={1}>
              {label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#ffffff" />
          </View>
        </Pressable>
      </Link>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { data: locations } = useLocations();
  const { data: washPackages } = useWashPackages();
  const { data: bookings } = useBookings();
  const queueJobs = (bookings ?? []).filter((item) => item.visitStatus === "ARRIVED").length;
  const processingJobs = (bookings ?? []).filter((item) => item.visitStatus === "IN_SERVICE").length;
  const doneJobs = (bookings ?? []).filter((item) => item.visitStatus === "COMPLETED").length;

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
      <View className="mb-6">
        <Text className="text-2xl font-sans-semibold text-white">
          {greeting}
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-sans-semibold text-white mb-3">
          Quick actions
        </Text>
        <View className="gap-3">
          <View className="flex-row gap-3">
            <QuickActionTile href="/scan" icon="scan-outline" label="Scan" />
            <QuickActionTile href="/walk-in" icon="add-circle-outline" label="Book In" />
          </View>
          <View className="flex-row gap-3">
            <QuickActionTile href="/devices" icon="car-outline" label="Vehicles" />
            <QuickActionTile href="/jobs" icon="list-outline" label="Jobs" />
          </View>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-sans-semibold text-white mb-3">
          Jobs summary
        </Text>
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-xl bg-zinc-800 p-3">
            <Text className="text-zinc-400 text-xs">Queue</Text>
            <Text className="mt-1 text-xl font-sans-semibold text-white">{queueJobs}</Text>
          </View>
          <View className="flex-1 rounded-xl bg-zinc-800 p-3">
            <Text className="text-zinc-400 text-xs">Processing</Text>
            <Text className="mt-1 text-xl font-sans-semibold text-white">{processingJobs}</Text>
          </View>
          <View className="flex-1 rounded-xl bg-zinc-800 p-3">
            <Text className="text-zinc-400 text-xs">Done</Text>
            <Text className="mt-1 text-xl font-sans-semibold text-white">{doneJobs}</Text>
          </View>
        </View>
      </View>

      <View className="rounded-xl bg-zinc-800 p-4">
        <Text className="font-sans-medium text-white">Workspace snapshot</Text>
        <Text className="mt-1 text-zinc-400">
          Locations: {locations?.length ?? 0} · Wash packages: {washPackages?.length ?? 0}
        </Text>
      </View>
    </ScrollView>
  );
}
