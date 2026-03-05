import { useState } from 'react';
import {
    View,
    ScrollView,
    Pressable,
    Modal,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
    useOrganizations,
    useLocations,
    useMediaItems,
    usePlaylists,
    useAddPlaylistItem,
    useBatchUpdatePlaylistItems,
    useBatchRemovePlaylistItems,
} from '../../lib/hooks';
import type { MediaItemDisplay } from '../../lib/hooks';
import { Text } from '../../components/ui/Text';
import { ConfirmModal } from '../../components/ConfirmModal';
import { MediaCard } from '../../components/MediaCard';
import { MediaListItem } from '../../components/MediaListItem';
import { DRAWER_HEADER_HEIGHT } from '../../lib/constants';
import { getUserFriendlyMessage } from '../../lib/api';

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

/** Infer media type from URL for filtering (video, audio, image, or generic) */
function getMediaTypeForFilter(mediaUrl: string): 'video' | 'audio' | 'image' | 'media' {
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

/**
 * Media page - browse media derived from playlist items.
 * Duplicates devices layout: title + actions, empty states, cards, pull-to-refresh.
 */
export default function MediaScreen() {
    const insets = useSafeAreaInsets();
    const contentTopPadding = insets.top + DRAWER_HEADER_HEIGHT + 12;

    const { data: orgs } = useOrganizations();
    const firstOrg = orgs?.[0];
    const clerkOrgId = firstOrg?.clerkOrgId ?? firstOrg?.id;
    const { data: locations } = useLocations(clerkOrgId);
    const firstLocationId = locations?.[0]?.id;
    const { data: playlists } = usePlaylists(firstLocationId);

    const {
        data: mediaItems,
        isLoading,
        error,
        refetch,
        isRefetching,
    } = useMediaItems(firstLocationId);

    const [addModalVisible, setAddModalVisible] = useState(false);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [addMediaUrl, setAddMediaUrl] = useState('');
    const [addTitle, setAddTitle] = useState('');
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
        null,
    );
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [typeFilter, setTypeFilter] = useState<'all' | 'video' | 'audio' | 'image'>('all');
    const [editMediaItem, setEditMediaItem] = useState<MediaItemDisplay | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editUrl, setEditUrl] = useState('');
    const [confirmRemoveItem, setConfirmRemoveItem] = useState<MediaItemDisplay | null>(null);

    const addItem = useAddPlaylistItem(selectedPlaylistId ?? undefined);
    const batchUpdate = useBatchUpdatePlaylistItems();
    const batchRemove = useBatchRemovePlaylistItems();

    /** Filter media by type (video, audio, image) */
    const typeFilteredMediaItems = mediaItems
        ? mediaItems.filter((item) => {
              if (typeFilter === 'all') return true;
              return getMediaTypeForFilter(item.mediaUrl) === typeFilter;
          })
        : [];

    /** Filter media by search query (title, URL, playlist names) - applied to type-filtered list */
    const filteredMediaItems = typeFilteredMediaItems.filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const title = (item.title ?? '').toLowerCase();
        const url = item.mediaUrl.toLowerCase();
        const playlists = item.playlistNames.join(' ').toLowerCase();
        return (
            title.includes(q) || url.includes(q) || playlists.includes(q)
        );
    });

    const openEditModal = (item: MediaItemDisplay) => {
        setEditMediaItem(item);
        setEditTitle(item.title ?? '');
        setEditUrl(item.mediaUrl);
    };

    const handleEditMedia = async () => {
        if (!editMediaItem || !editUrl.trim()) return;
        try {
            await batchUpdate.mutateAsync(
                editMediaItem.items.map((ref) => ({
                    playlistId: ref.playlistId,
                    itemId: ref.itemId,
                    body: {
                        mediaUrl: editUrl.trim(),
                        title: editTitle.trim() || null,
                    },
                })),
            );
            setEditMediaItem(null);
        } catch {
            // Global NetworkErrorHandler shows error
        }
    };

    const handleRemoveMedia = (item: MediaItemDisplay) => {
        setEditMediaItem(null);
        setConfirmRemoveItem(item);
    };

    const onConfirmRemoveMedia = async () => {
        if (!confirmRemoveItem) return;
        try {
            await batchRemove.mutateAsync(
                confirmRemoveItem.items.map((ref) => ({
                    playlistId: ref.playlistId,
                    itemId: ref.itemId,
                })),
            );
            setConfirmRemoveItem(null);
        } catch {
            // Global NetworkErrorHandler shows error
        }
    };

    const handleAddMedia = async () => {
        const playlistId = selectedPlaylistId ?? playlists?.[0]?.id;
        if (!addMediaUrl.trim() || !playlistId) return;
        try {
            await addItem.mutateAsync({
                mediaUrl: addMediaUrl.trim(),
                title: addTitle.trim() || undefined,
            });
            setAddModalVisible(false);
            setAddMediaUrl('');
            setAddTitle('');
            setSelectedPlaylistId(null);
        } catch {
            // Global NetworkErrorHandler shows error
        }
    };

    const openAddModal = () => {
        setSelectedPlaylistId(playlists?.[0]?.id ?? null);
        setAddModalVisible(true);
    };

    return (
        <View className="flex-1 bg-base" style={{ paddingTop: contentTopPadding }}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching && !isLoading}
                        onRefresh={() => refetch()}
                        tintColor="#ef4444"
                    />
                }
            >
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-xl font-sans-semibold text-white">
                        Media
                    </Text>
                    <View className="flex-row gap-2 items-center">
                        <Pressable
                            onPress={() => setSearchModalVisible(true)}
                            className="w-10 h-10 rounded-xl bg-zinc-700 items-center justify-center active:opacity-90"
                            accessibilityLabel="Search media"
                        >
                            <Ionicons
                                name="search-outline"
                                size={20}
                                color="#ffffff"
                            />
                        </Pressable>
                        <Pressable
                            onPress={() => setFilterModalVisible(true)}
                            className="w-10 h-10 rounded-xl bg-zinc-700 items-center justify-center active:opacity-90"
                            accessibilityLabel="Filter by type"
                        >
                            <Ionicons
                                name="filter-outline"
                                size={20}
                                color="#ffffff"
                            />
                        </Pressable>
                        <Pressable
                            onPress={() =>
                                setViewMode((m) => (m === 'card' ? 'list' : 'card'))
                            }
                            className="w-10 h-10 rounded-xl bg-zinc-700 items-center justify-center active:opacity-90"
                            accessibilityLabel={
                                viewMode === 'card' ? 'Switch to list view' : 'Switch to card view'
                            }
                        >
                            <Ionicons
                                name={viewMode === 'card' ? 'list-outline' : 'grid-outline'}
                                size={20}
                                color="#ffffff"
                            />
                        </Pressable>
                        <Pressable
                            onPress={() =>
                                firstOrg && firstLocationId && openAddModal()
                            }
                            disabled={!firstOrg || !firstLocationId}
                            className={`w-10 h-10 rounded-xl items-center justify-center ${
                                firstOrg && firstLocationId
                                    ? 'bg-approve active:opacity-90'
                                    : 'bg-zinc-800 opacity-50'
                            }`}
                            accessibilityLabel="Add media"
                        >
                            <Ionicons name="add" size={20} color="#ffffff" />
                        </Pressable>
                    </View>
                </View>

                {!firstOrg && !isLoading && (
                    <View className="py-6 px-4 rounded-xl bg-zinc-800 mb-4">
                        <Text className="text-zinc-400 text-center">
                            Create or join an organization first.
                        </Text>
                    </View>
                )}

                {isLoading && (
                    <View className="py-12 items-center">
                        <ActivityIndicator size="large" color="#ef4444" />
                    </View>
                )}

                {error && (
                    <View className="py-6 px-4 rounded-xl bg-zinc-800 mb-4">
                        <Text className="text-primary font-sans-medium mb-2">
                            {getUserFriendlyMessage(error)}
                        </Text>
                        <Pressable
                            onPress={() => refetch()}
                            className="self-start py-2 px-4 rounded-lg bg-zinc-700"
                        >
                            <Text className="text-white font-sans-medium">
                                Retry
                            </Text>
                        </Pressable>
                    </View>
                )}

                {firstOrg && !firstLocationId && !isLoading && (
                    <View className="py-12 items-center">
                        <Text className="text-zinc-400 text-center">
                            Create a location to view media.
                        </Text>
                    </View>
                )}

                {!isLoading && !error && mediaItems && firstLocationId && (
                    <View className="gap-4">
                        {typeFilteredMediaItems.length === 0 ? (
                            <View className="py-12 items-center">
                                <Text className="text-zinc-400 text-center mb-4">
                                    {mediaItems.length === 0
                                        ? 'Add media to playlists to see it here.'
                                        : `No ${typeFilter === 'all' ? '' : typeFilter} media found.`}
                                </Text>
                                {mediaItems.length === 0 && (
                                    <Pressable
                                        onPress={openAddModal}
                                        disabled={!playlists?.length}
                                        className={`py-3 px-6 rounded-xl ${
                                            playlists?.length
                                                ? 'bg-approve active:opacity-90'
                                                : 'bg-zinc-700 opacity-50'
                                        }`}
                                    >
                                        <Text className="font-sans-medium text-white">
                                            Add Media to Playlist
                                        </Text>
                                    </Pressable>
                                )}
                            </View>
                        ) : viewMode === 'card' ? (
                            typeFilteredMediaItems.map((item) => (
                                <MediaCard
                                    key={item.mediaUrl}
                                    item={item}
                                    onPress={() => openEditModal(item)}
                                />
                            ))
                        ) : (
                            typeFilteredMediaItems.map((item) => (
                                <MediaListItem
                                    key={item.mediaUrl}
                                    item={item}
                                    onPress={() => openEditModal(item)}
                                />
                            ))
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Search Modal */}
            <Modal
                visible={searchModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setSearchModalVisible(false)}
            >
                <Pressable
                    className="flex-1 bg-black/60 justify-center items-center px-6"
                    onPress={() => setSearchModalVisible(false)}
                >
                    <Pressable
                        className="w-full max-w-md max-h-[80%] rounded-2xl bg-zinc-800 p-6"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text className="text-lg font-sans-semibold text-white mb-4">
                            Search Media
                        </Text>
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search by name, URL, or playlist..."
                            placeholderTextColor="#71717a"
                            style={{ fontFamily: 'Urbanist_400Regular' }}
                            className="bg-zinc-700 rounded-xl px-4 py-3 text-white mb-4"
                            autoFocus
                        />
                        <ScrollView
                            className="mb-4"
                            style={{
                                maxHeight: Math.min(400, Dimensions.get('window').height * 0.5),
                            }}
                            contentContainerStyle={{ paddingBottom: 8 }}
                            showsVerticalScrollIndicator
                            nestedScrollEnabled
                            bounces
                        >
                            <View className="gap-2">
                                {filteredMediaItems.length === 0 ? (
                                    <Text className="text-zinc-400 text-center py-4">
                                        {searchQuery.trim()
                                            ? 'No media found.'
                                            : 'Type to search.'}
                                    </Text>
                                ) : (
                                    filteredMediaItems.map((item) => (
                                        <MediaListItem
                                            key={item.mediaUrl}
                                            item={item}
                                            onPress={() => {
                                                setSearchModalVisible(false);
                                                openEditModal(item);
                                            }}
                                        />
                                    ))
                                )}
                            </View>
                        </ScrollView>
                        <Pressable
                            onPress={() => setSearchModalVisible(false)}
                            className="py-3 rounded-xl bg-red-500 items-center active:opacity-90"
                        >
                            <Text className="font-sans-medium text-white">
                                Close
                            </Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Filter Modal */}
            <Modal
                visible={filterModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <Pressable
                    className="flex-1 bg-black/60 justify-end"
                    onPress={() => setFilterModalVisible(false)}
                >
                    <Pressable
                        className="bg-zinc-800 rounded-t-2xl p-6 pb-12"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text className="text-lg font-sans-semibold text-white mb-4">
                            Filter by type
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {(['all', 'video', 'audio', 'image'] as const).map((opt) => (
                                <Pressable
                                    key={opt}
                                    onPress={() => {
                                        setTypeFilter(opt);
                                        setFilterModalVisible(false);
                                    }}
                                    className={`px-4 py-3 rounded-xl ${
                                        typeFilter === opt ? 'bg-approve' : 'bg-zinc-700'
                                    }`}
                                >
                                    <Text className="font-sans-medium text-white capitalize">
                                        {opt}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Add Media Modal */}
            <Modal
                visible={addModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAddModalVisible(false)}
            >
                <Pressable
                    className="flex-1 bg-black/60 justify-center items-center px-6"
                    onPress={() => setAddModalVisible(false)}
                >
                    <Pressable
                        className="w-full max-w-md rounded-2xl bg-zinc-800 p-6"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text className="text-lg font-sans-semibold text-white mb-4">
                            Add Media to Playlist
                        </Text>
                        <KeyboardAvoidingView
                            behavior={
                                Platform.OS === 'ios' ? 'padding' : undefined
                            }
                        >
                            <Text className="text-zinc-400 text-sm mb-2">
                                Media URL
                            </Text>
                            <TextInput
                                value={addMediaUrl}
                                onChangeText={setAddMediaUrl}
                                placeholder="https://..."
                                placeholderTextColor="#71717a"
                                style={{ fontFamily: 'Urbanist_400Regular' }}
                                className="bg-zinc-700 rounded-xl px-4 py-3 text-white mb-4"
                            />
                            <Text className="text-zinc-400 text-sm mb-2">
                                Title (optional)
                            </Text>
                            <TextInput
                                value={addTitle}
                                onChangeText={setAddTitle}
                                placeholder="Display name"
                                placeholderTextColor="#71717a"
                                style={{ fontFamily: 'Urbanist_400Regular' }}
                                className="bg-zinc-700 rounded-xl px-4 py-3 text-white mb-4"
                            />
                            <Text className="text-zinc-400 text-sm mb-2">
                                Playlist
                            </Text>
                            <View className="flex-row flex-wrap gap-2 mb-6">
                                {playlists?.map((p) => (
                                    <Pressable
                                        key={p.id}
                                        onPress={() =>
                                            setSelectedPlaylistId(p.id)
                                        }
                                        className={`px-3 py-2 rounded-lg ${
                                            selectedPlaylistId === p.id
                                                ? 'bg-approve'
                                                : 'bg-zinc-700'
                                        }`}
                                    >
                                        <Text className="font-sans-medium text-white text-sm">
                                            {p.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </KeyboardAvoidingView>
                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={() => setAddModalVisible(false)}
                                className="flex-1 py-3 rounded-xl bg-red-500 items-center"
                            >
                                <Text className="font-sans-medium text-white">
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={handleAddMedia}
                                disabled={
                                    !addMediaUrl.trim() ||
                                    !selectedPlaylistId ||
                                    addItem.isPending
                                }
                                className="flex-1 py-3 rounded-xl bg-approve items-center disabled:opacity-50"
                            >
                                {addItem.isPending ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#ffffff"
                                    />
                                ) : (
                                    <Text className="font-sans-medium text-white">
                                        Add
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Edit Media Modal */}
            <Modal
                visible={!!editMediaItem}
                transparent
                animationType="fade"
                onRequestClose={() => setEditMediaItem(null)}
            >
                <Pressable
                    className="flex-1 bg-black/60 justify-center items-center px-6"
                    onPress={() => setEditMediaItem(null)}
                >
                    <Pressable
                        className="w-full max-w-md rounded-2xl bg-zinc-800 p-6"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text className="text-lg font-sans-semibold text-white mb-4">
                            Edit Media
                        </Text>
                        <KeyboardAvoidingView
                            behavior={
                                Platform.OS === 'ios' ? 'padding' : undefined
                            }
                        >
                            <Text className="text-zinc-400 text-sm mb-2">
                                Title (optional)
                            </Text>
                            <TextInput
                                value={editTitle}
                                onChangeText={setEditTitle}
                                placeholder="Display name"
                                placeholderTextColor="#71717a"
                                style={{ fontFamily: 'Urbanist_400Regular' }}
                                className="bg-zinc-700 rounded-xl px-4 py-3 text-white mb-4"
                            />
                            <Text className="text-zinc-400 text-sm mb-2">
                                Media URL
                            </Text>
                            <TextInput
                                value={editUrl}
                                onChangeText={setEditUrl}
                                placeholder="https://..."
                                placeholderTextColor="#71717a"
                                style={{ fontFamily: 'Urbanist_400Regular' }}
                                className="bg-zinc-700 rounded-xl px-4 py-3 text-white mb-6"
                            />
                        </KeyboardAvoidingView>
                        <View className="flex-row gap-3 mb-3">
                            <Pressable
                                onPress={() => setEditMediaItem(null)}
                                className="flex-1 py-3 rounded-xl bg-zinc-700 items-center"
                            >
                                <Text className="font-sans-medium text-white">
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={handleEditMedia}
                                disabled={
                                    !editUrl.trim() || batchUpdate.isPending
                                }
                                className="flex-1 py-3 rounded-xl bg-approve items-center disabled:opacity-50"
                            >
                                {batchUpdate.isPending ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#ffffff"
                                    />
                                ) : (
                                    <Text className="font-sans-medium text-white">
                                        Save
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                        {editMediaItem && (
                            <Pressable
                                onPress={() => handleRemoveMedia(editMediaItem)}
                                className="py-3 rounded-xl items-center active:opacity-90"
                            >
                                <Text className="font-sans-medium text-red-500">
                                    Remove from all playlists
                                </Text>
                            </Pressable>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>

            <ConfirmModal
                visible={!!confirmRemoveItem}
                title="Remove Media"
                message={
                    confirmRemoveItem
                        ? `Remove "${getDisplayTitle(confirmRemoveItem)}" from all playlists? This cannot be undone.`
                        : ''
                }
                confirmText="Remove"
                cancelText="Cancel"
                confirmStyle="destructive"
                onConfirm={onConfirmRemoveMedia}
                onCancel={() => setConfirmRemoveItem(null)}
            />
        </View>
    );
}
