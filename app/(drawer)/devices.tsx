import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { DRAWER_HEADER_HEIGHT } from '../../lib/constants';

/**
 * Devices page - placeholder (matches Media layout).
 * Device pairing and list will be implemented later.
 */
export default function DevicesScreen() {
    const insets = useSafeAreaInsets();
    const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;

    return (
        <View
            className="flex-1 bg-base justify-center items-center px-6"
            style={{ paddingTop: contentTopPadding }}
        >
            <Text className="text-xl font-sans-semibold text-white text-center mb-2">
                Devices
            </Text>
            <Text className="text-zinc-400 text-center">
                Manage your paired devices. Device pairing coming soon.
            </Text>
        </View>
    );
}
