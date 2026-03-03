import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { Text } from "../../components/ui/Text";
import { UserAvatar } from "../../components/UserAvatar";
import { DRAWER_HEADER_HEIGHT } from "../../lib/constants";

/**
 * Profile page - user info from Clerk and backend.
 */
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;

  return (
    <View
      className="flex-1 bg-base justify-center items-center px-6"
      style={{ paddingTop: contentTopPadding }}
    >
      <UserAvatar
        imageUrl={user?.imageUrl}
        fallbackInitial={
          user?.firstName?.[0] ??
          user?.emailAddresses?.[0]?.emailAddress?.[0] ??
          "?"
        }
        size={80}
        className="mb-4"
      />
      <Text className="text-xl font-sans-semibold text-white text-center mb-1">
        {user?.fullName ?? "User"}
      </Text>
      <Text className="text-zinc-400 text-center">
        {user?.primaryEmailAddress?.emailAddress}
      </Text>
    </View>
  );
}
