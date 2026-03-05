import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import { Text } from './ui/Text';
import type { MediaItemDisplay } from '../lib/hooks';

interface MediaCardProps {
    item: MediaItemDisplay;
    onPress?: () => void;
}

/** Derive display title from URL pathname or explicit title */
function getDisplayTitle(item: MediaItemDisplay): string {
    if (item.title?.trim()) return item.title;
    try {
        const pathname = new URL(item.mediaUrl).pathname;
        const filename = pathname.split('/').pop();
        return filename ?? item.mediaUrl;
    } catch {
        return item.mediaUrl;
    }
}

/** Infer media type from URL (video, audio, image, or generic) */
function getMediaType(mediaUrl: string): string {
    try {
        const ext = mediaUrl.split('.').pop()?.toLowerCase() ?? '';
        const path = mediaUrl.toLowerCase();
        if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext) || path.includes('video')) return 'Video';
        if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext) || path.includes('audio')) return 'Audio';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) || path.includes('image')) return 'Image';
        return 'Media';
    } catch {
        return 'Media';
    }
}

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

/** Format duration in seconds to mm:ss */
function formatDuration(seconds?: number): string {
    if (seconds == null || seconds < 0) return '—';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

/** Truncate URL for display */
function truncateUrl(url: string, maxLen = 60): string {
    if (url.length <= maxLen) return url;
    return url.slice(0, maxLen - 3) + '...';
}

/**
 * Media card - displays aggregated media from playlist items:
 * Descriptive layout with cover image, title, type, duration, URL, and playlists.
 */
export function MediaCard({ item, onPress }: MediaCardProps) {
    const title = getDisplayTitle(item);
    const mediaType = getMediaType(item.mediaUrl);
    const showCover = isImageUrl(item.mediaUrl);
    const playlistsLabel =
        item.playlistNames.length > 0
            ? item.playlistNames.join(', ')
            : 'In playlists';

    const content = (
        <View className="rounded-2xl bg-zinc-800 overflow-hidden shadow-lg">
            {/* Cover / preview area */}
            <View className="h-32 bg-zinc-700/60">
                {showCover ? (
                    <Image
                        source={{ uri: item.mediaUrl }}
                        className="w-full h-full"
                        contentFit="cover"
                    />
                ) : (
                    <View className="flex-1 items-center justify-center bg-zinc-700/80">
                        <View className="w-14 h-14 rounded-full bg-primary/20 items-center justify-center">
                            <Play size={28} color="#ef4444" fill="#ef4444" />
                        </View>
                    </View>
                )}
            </View>

            {/* Content */}
            <View className="p-4">
                <View className="flex-row items-start mb-3">
                    <View className="flex-1">
                        <Text
                            className="font-sans-semibold text-white text-base"
                            numberOfLines={2}
                        >
                            {title}
                        </Text>
                        <View className="flex-row items-center gap-2 mt-1">
                            <View className="px-2 py-0.5 rounded bg-zinc-700">
                                <Text className="text-zinc-500 text-xs font-sans-medium">
                                    {mediaType}
                                </Text>
                            </View>
                            <Text className="text-zinc-500 text-xs">
                                {formatDuration(item.duration)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Details */}
                <View className="gap-2">
                    <View className="flex-row items-start">
                        <Text className="text-zinc-400 text-sm w-16">URL</Text>
                        <Text
                            className="font-sans-medium text-white text-sm flex-1"
                            numberOfLines={1}
                        >
                            {truncateUrl(item.mediaUrl)}
                        </Text>
                    </View>
                    <View className="flex-row items-start">
                        <Text className="text-zinc-400 text-sm w-16">Playlists</Text>
                        <Text
                            className="font-sans-medium text-white text-sm flex-1"
                            numberOfLines={2}
                        >
                            {playlistsLabel}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    if (onPress) {
        return (
            <Pressable onPress={onPress} className="active:opacity-95">
                {content}
            </Pressable>
        );
    }

    return content;
}
