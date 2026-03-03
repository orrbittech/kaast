import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { DRAWER_HEADER_HEIGHT } from '../../lib/constants';

/**
 * Playlists page - manage playlists (client-side for MVP).
 * Can be extended with backend Playlist entity later.
 */
export default function PlaylistsScreen() {
    const insets = useSafeAreaInsets();
    const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;

    return (
        <View
            className="flex-1 bg-base justify-center items-center px-6"
            style={{ paddingTop: contentTopPadding }}
        >
            <Text className="text-xl font-sans-semibold text-white text-center mb-2">
                Playlists
            </Text>
            <Text className="text-zinc-400 text-center">
                Create and organize playlists for seamless viewing. Coming soon.
            </Text>
        </View>
    );
}
