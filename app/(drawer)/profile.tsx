import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Text } from '../../components/ui/Text';
import { UserAvatar } from '../../components/UserAvatar';
import { DRAWER_HEADER_HEIGHT } from '../../lib/constants';

function formatDate(value?: Date | null) {
    if (!value) return 'Not available';
    return value.toLocaleString();
}

function formatValue(value?: string | null) {
    return value?.trim() || 'Not available';
}

/**
 * Profile page - user info from Clerk and backend.
 */
export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const user = useUser()?.user;
    const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;
    const allEmails =
        user?.emailAddresses?.map((email) => email.emailAddress).filter(Boolean) ??
        [];
    const allPhones =
        user?.phoneNumbers
            ?.map((phone) => phone.phoneNumber)
            .filter(Boolean) ?? [];
    const primaryEmail = user?.primaryEmailAddress?.emailAddress;
    const primaryPhone = user?.primaryPhoneNumber?.phoneNumber;

    return (
        <ScrollView
            className="flex-1 bg-base"
            contentContainerStyle={{
                paddingTop: contentTopPadding,
                paddingHorizontal: 24,
                paddingBottom: 32,
            }}
        >
            <View className="items-center mb-6">
                <UserAvatar
                    imageUrl={user?.imageUrl}
                    fallbackInitial={
                        user?.firstName?.[0] ??
                        user?.emailAddresses?.[0]?.emailAddress?.[0] ??
                        '?'
                    }
                    size={80}
                    className="mb-4"
                />
                <Text className="text-2xl font-sans-semibold text-white text-center mb-1">
                    {user?.fullName ?? 'User'}
                </Text>
                <Text className="text-zinc-400 text-center">
                    {formatValue(primaryEmail)}
                </Text>
            </View>

            <View className="gap-4">
                <View className="rounded-xl bg-zinc-800 p-4">
                    <Text className="text-white font-sans-semibold mb-3">
                        Identity
                    </Text>
                    <Text className="text-zinc-300 mb-1">
                        Full name: {formatValue(user?.fullName)}
                    </Text>
                    <Text className="text-zinc-300 mb-1">
                        First name: {formatValue(user?.firstName)}
                    </Text>
                    <Text className="text-zinc-300 mb-1">
                        Last name: {formatValue(user?.lastName)}
                    </Text>
                    <Text className="text-zinc-300 mb-1">
                        Username: {formatValue(user?.username)}
                    </Text>
                    <Text className="text-zinc-300">
                        User ID: {formatValue(user?.id)}
                    </Text>
                </View>

                <View className="rounded-xl bg-zinc-800 p-4">
                    <Text className="text-white font-sans-semibold mb-3">
                        Contact
                    </Text>
                    <Text className="text-zinc-300 mb-1">
                        Primary email: {formatValue(primaryEmail)}
                    </Text>
                    <Text className="text-zinc-300 mb-1">
                        All emails:{' '}
                        {allEmails.length > 0
                            ? allEmails.join(', ')
                            : 'Not available'}
                    </Text>
                    <Text className="text-zinc-300 mb-1">
                        Primary phone: {formatValue(primaryPhone)}
                    </Text>
                    <Text className="text-zinc-300">
                        All phones:{' '}
                        {allPhones.length > 0
                            ? allPhones.join(', ')
                            : 'Not available'}
                    </Text>
                </View>

                <View className="rounded-xl bg-zinc-800 p-4">
                    <Text className="text-white font-sans-semibold mb-3">
                        Account
                    </Text>
                    <Text className="text-zinc-300 mb-1">
                        Created: {formatDate(user?.createdAt)}
                    </Text>
                    <Text className="text-zinc-300 mb-1">
                        Last sign in: {formatDate(user?.lastSignInAt)}
                    </Text>
                    <Text className="text-zinc-300 mb-1">
                        Last active: {formatDate(user?.lastActiveAt)}
                    </Text>
                    <Text className="text-zinc-300">
                        Image URL: {formatValue(user?.imageUrl)}
                    </Text>
                </View>

                <Pressable
                    onPress={() => router.push('/settings')}
                    className="mt-2 p-4 rounded-xl bg-zinc-700 active:opacity-80"
                >
                    <Text className="font-sans-medium text-white text-center">
                        Edit in Settings
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}
