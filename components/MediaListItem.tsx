import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Play } from 'lucide-react-native';
import { Text } from './ui/Text';
import type { MediaItemDisplay } from '../lib/hooks';

interface MediaListItemProps {
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
function getMediaType(mediaUrl: string): 'video' | 'audio' | 'image' | 'media' {
    try {
        const ext = mediaUrl.split('.').pop()?.toLowerCase() ?? '';
        const path = mediaUrl.toLowerCase();
        if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext) || path.includes('video')) return 'video';
        if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext) || path.includes('audio')) return 'audio';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) || path.includes('image')) return 'image';
        return 'media';
    } catch {
        return 'media';
    }
}

/** Format duration in seconds to mm:ss */
function formatDuration(seconds?: number): string {
    if (seconds == null || seconds < 0) return '—';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

/** Format date to readable string */
function formatDate(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString();
}

/** Size display: duration for video/audio, "—" for others */
function getSizeDisplay(item: MediaItemDisplay): string {
    const type = getMediaType(item.mediaUrl);
    if (type === 'video' || type === 'audio') {
        return formatDuration(item.duration);
    }
    return '—';
}

/**
 * Media list item - compact row for list view:
 * Media type icon, name, and below it size and creation date.
 */
export function MediaListItem({ item, onPress }: MediaListItemProps) {
    const title = getDisplayTitle(item);
    const mediaType = getMediaType(item.mediaUrl);
    const sizeDisplay = getSizeDisplay(item);
    const dateDisplay = formatDate(item.createdAt);

    const iconSize = 24;
    const iconColor = '#ef4444';

    const content = (
        <View className="flex-row items-center gap-3 p-3 rounded-xl bg-zinc-800">
            <View className="w-10 h-10 rounded-lg bg-zinc-700/80 items-center justify-center">
                {mediaType === 'video' ? (
                    <Play size={iconSize} color={iconColor} fill={iconColor} />
                ) : (
                    <Ionicons
                        name={
                            mediaType === 'audio'
                                ? 'musical-notes-outline'
                                : mediaType === 'image'
                                  ? 'image-outline'
                                  : 'document-outline'
                        }
                        size={iconSize}
                        color={iconColor}
                    />
                )}
            </View>
            <View className="flex-1 min-w-0">
                <Text
                    className="font-sans-semibold text-white text-base"
                    numberOfLines={1}
                >
                    {title}
                </Text>
                <Text className="text-zinc-500 text-sm mt-0.5">
                    {sizeDisplay} · {dateDisplay}
                </Text>
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
