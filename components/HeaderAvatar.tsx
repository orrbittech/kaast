import { Pressable } from "react-native";
import { Link } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { UserAvatar } from "./UserAvatar";

/**
 * Header avatar - used in drawer/screen headers. Links to profile.
 */
export function HeaderAvatar() {
  const { user } = useUser();
  const imageUrl = user?.imageUrl ?? null;
  const fallbackInitial =
    user?.firstName?.[0] ??
    user?.emailAddresses?.[0]?.emailAddress?.[0] ??
    "?";

  return (
    <Link href="/profile" asChild>
      <Pressable className="mr-4 active:opacity-80">
        <UserAvatar
          imageUrl={imageUrl}
          fallbackInitial={fallbackInitial}
          size={40}
        />
      </Pressable>
    </Link>
  );
}
