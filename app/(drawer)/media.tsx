import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { DRAWER_HEADER_HEIGHT } from "../../lib/constants";

/**
 * Media page - browse media (client-side for now).
 * Backend has MediaSession; media library can be extended later.
 */
export default function MediaScreen() {
  const insets = useSafeAreaInsets();
  const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;

  return (
    <View
      className="flex-1 bg-base justify-center items-center px-6"
      style={{ paddingTop: contentTopPadding }}
    >
      <Text className="text-xl font-sans-semibold text-white text-center mb-2">
        Media
      </Text>
      <Text className="text-zinc-400 text-center">
        Browse and manage your media. Media URLs are set when controlling a
        device.
      </Text>
    </View>
  );
}
