import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";
import { Text } from "../../components/ui/Text";
import { DRAWER_HEADER_HEIGHT } from "../../lib/constants";

/**
 * Settings screen - app preferences and sign out.
 */
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useClerk();
  const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;

  const onSignOut = async () => {
    await signOut?.();
    router.replace("/sign-in");
  };

  return (
    <View
      className="flex-1 bg-base px-6"
      style={{ paddingTop: contentTopPadding }}
    >
      <View className="flex-1 justify-center max-w-md">
        <Text className="text-2xl font-sans-semibold text-white mb-2">Settings</Text>
        <Text className="text-zinc-400 mb-6">
          Manage your account and preferences
        </Text>

        <View className="gap-4">
        <Pressable className="p-4 rounded-xl bg-zinc-800 active:opacity-80">
          <Text className="font-sans-medium text-white">Account</Text>
          <Text className="text-sm text-zinc-400 mt-1">
            Profile and organization
          </Text>
        </Pressable>

        <Pressable className="p-4 rounded-xl bg-zinc-800 active:opacity-80">
          <Text className="font-sans-medium text-white">Notifications</Text>
          <Text className="text-sm text-zinc-400 mt-1">
            Push and device alerts
          </Text>
        </Pressable>

        <Pressable
          onPress={onSignOut}
          className="mt-6 p-4 rounded-xl bg-cancel active:opacity-90"
        >
          <Text className="font-sans-medium text-white text-center">
            Sign Out
          </Text>
        </Pressable>
        </View>
      </View>
    </View>
  );
}
