import { View, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import {
    SkipBack,
    Play,
    Pause,
    SkipForward,
    Volume2,
    VolumeX,
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDevice, useMediaSession } from '../../../lib/hooks';
import { Text } from '../../../components/ui/Text';
import { DRAWER_HEADER_HEIGHT } from '../../../lib/constants';

/** Check if URL is an image (can be used as cover) */
function isImageUrl(url: string): boolean {
    try {
        const ext = url.split('.').pop()?.toLowerCase() ?? '';
        const path = url.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) || path.includes('image');
    } catch {
        return false;
    }
}

/**
 * Media control UI - remote-like layout with play/pause/seek/volume controls.
 * Media preview container above the control section.
 */
export default function ControlScreen() {
    const insets = useSafeAreaInsets();
    const { deviceId: deviceIdParam } = useLocalSearchParams<{
        deviceId: string;
    }>();
    const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 24;

    const { data: device, isLoading, error } = useDevice(deviceIdParam);
    const { data: session } = useMediaSession(device?.deviceId);

    if (isLoading) {
        return (
            <View
                className="flex-1 bg-base justify-center items-center"
                style={{ paddingTop: contentTopPadding }}
            >
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    if (error || !device) {
        return (
            <View
                className="flex-1 bg-base justify-center items-center px-6"
                style={{ paddingTop: contentTopPadding }}
            >
                <Text className="text-zinc-400 text-center">
                    Device not found
                </Text>
            </View>
        );
    }

    const mediaUrl = session?.mediaUrl;
    const showMediaPreview = Boolean(mediaUrl);

    return (
        <View
            className="flex-1 bg-base"
            style={{ paddingTop: contentTopPadding }}
        >
            <View className="flex-1 px-6">
                {/* Media preview container */}
                <View className="rounded-2xl bg-zinc-800 overflow-hidden mb-6">
                    <View className="h-48 bg-zinc-700/60">
                        {showMediaPreview && isImageUrl(mediaUrl!) ? (
                            <Image
                                source={{ uri: mediaUrl! }}
                                className="w-full h-full"
                                contentFit="cover"
                            />
                        ) : showMediaPreview ? (
                            <View className="flex-1 items-center justify-center">
                                <Ionicons name="videocam-outline" size={64} color="#71717a" />
                                <Text className="text-zinc-500 text-sm mt-2">Video playing</Text>
                            </View>
                        ) : (
                            <View className="flex-1 items-center justify-center">
                                <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center">
                                    <Play size={40} color="#ef4444" fill="#ef4444" />
                                </View>
                                <Text className="text-zinc-500 text-sm mt-3">No media playing</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Title */}
                <Text className="text-xl font-sans-semibold text-white text-center mb-2">
                    Control: {device.name}
                </Text>
                <Text className="text-zinc-400 text-center mb-8">
                    Media control UI - WebSocket integration pending
                </Text>

                {/* Remote-like controls */}
                <View className="gap-6 items-center">
                    {/* Playback row */}
                    <View className="flex-row gap-4 justify-center items-center">
                        <Pressable className="w-14 h-14 rounded-full bg-zinc-700 items-center justify-center active:opacity-80">
                            <SkipBack size={24} color="#ffffff" />
                        </Pressable>
                        <Pressable className="w-20 h-20 rounded-full bg-primary items-center justify-center active:opacity-90">
                            {session?.playing ? (
                                <Pause size={32} color="#ffffff" fill="#ffffff" />
                            ) : (
                                <Play size={32} color="#ffffff" fill="#ffffff" />
                            )}
                        </Pressable>
                        <Pressable className="w-14 h-14 rounded-full bg-zinc-700 items-center justify-center active:opacity-80">
                            <SkipForward size={24} color="#ffffff" />
                        </Pressable>
                    </View>

                    {/* Volume row */}
                    <View className="flex-row gap-4 justify-center items-center">
                        <Pressable className="w-14 h-14 rounded-full bg-zinc-700 items-center justify-center active:opacity-80">
                            <VolumeX size={24} color="#ffffff" />
                        </Pressable>
                        <Pressable className="px-8 py-3 rounded-xl bg-zinc-700 active:opacity-80">
                            <Text className="font-sans-medium text-white">Vol -</Text>
                        </Pressable>
                        <Pressable className="px-8 py-3 rounded-xl bg-zinc-700 active:opacity-80">
                            <Text className="font-sans-medium text-white">Vol +</Text>
                        </Pressable>
                        <Pressable className="w-14 h-14 rounded-full bg-zinc-700 items-center justify-center active:opacity-80">
                            <Volume2 size={24} color="#ffffff" />
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}
