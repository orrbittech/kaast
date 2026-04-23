import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Text } from "../../../components/ui/Text";
import { DRAWER_HEADER_HEIGHT } from "../../../lib/constants";

/**
 * Media control UI - play/pause/seek/volume controls.
 * Connects WebSocket, sends control:command on button press.
 */
export default function ControlScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ "device-id"?: string }>();
  const deviceId = params["device-id"];
  const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;

  return (
    <View
      className="flex-1 bg-base justify-center items-center px-6"
      style={{ paddingTop: contentTopPadding }}
    >
      <Text className="text-xl font-sans-semibold text-white text-center mb-2">
        Control: {deviceId ?? "Unknown"}
      </Text>
      <Text className="text-zinc-400 text-center mb-8">
        Media control UI - WebSocket integration pending
      </Text>

      <View className="gap-4 items-center">
        <View className="flex-row gap-4 justify-center">
          <Pressable className="w-16 h-16 rounded-full bg-zinc-700 items-center justify-center active:opacity-80">
            <Text className="text-2xl text-white">⏮</Text>
          </Pressable>
          <Pressable className="w-20 h-20 rounded-full bg-approve items-center justify-center active:opacity-90">
            <Text className="text-3xl text-white">▶</Text>
          </Pressable>
          <Pressable className="w-16 h-16 rounded-full bg-zinc-700 items-center justify-center active:opacity-80">
            <Text className="text-2xl text-white">⏭</Text>
          </Pressable>
        </View>

        <View className="flex-row gap-4 justify-center">
          <Pressable className="px-6 py-3 rounded-lg bg-zinc-700 active:opacity-80">
            <Text className="font-sans-medium text-white">Vol -</Text>
          </Pressable>
          <Pressable className="px-6 py-3 rounded-lg bg-zinc-700 active:opacity-80">
            <Text className="font-sans-medium text-white">Vol +</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
