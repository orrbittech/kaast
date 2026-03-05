import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { playlistsApi, playlistKeys } from '../api';
import { usePlaylists } from './usePlaylists';

/** Playlist item reference for update/remove operations */
export interface MediaItemRef {
    playlistId: string;
    itemId: string;
}

/** Aggregated media item for display (deduplicated by mediaUrl) */
export interface MediaItemDisplay {
    mediaUrl: string;
    title?: string;
    duration?: number;
    createdAt?: string;
    playlistIds: string[];
    playlistNames: string[];
    items: MediaItemRef[];
}

/**
 * Fetches playlists for location, then fetches each playlist with items,
 * and aggregates media URLs deduplicated by URL.
 */
export function useMediaItems(locationId: string | undefined) {
    const { data: playlists, ...playlistsQuery } = usePlaylists(locationId);
    const playlistIds = playlists?.map((p) => p.id) ?? [];
    const playlistNamesMap = useMemo(
        () => new Map(playlists?.map((p) => [p.id, p.name]) ?? []),
        [playlists],
    );

    const playlistQueries = useQueries({
        queries: playlistIds.map((id) => ({
            queryKey: playlistKeys.detail(id),
            queryFn: () => playlistsApi.getById(id),
            enabled: !!locationId && playlistIds.length > 0,
        })),
    });

    const mediaItems = useMemo((): MediaItemDisplay[] => {
        const map = new Map<
            string,
            {
                mediaUrl: string;
                title?: string;
                duration?: number;
                createdAt?: string;
                playlistIds: string[];
                playlistNames: string[];
                items: MediaItemRef[];
            }
        >();

        playlistQueries.forEach((q, i) => {
            const playlist = q.data;
            const playlistId = playlistIds[i];
            if (!playlist?.items || !playlistId) return;

            const playlistName = playlistNamesMap.get(playlistId) ?? playlist.name;

            for (const item of playlist.items) {
                const itemCreatedAt = item.createdAt;
                const itemRef: MediaItemRef = { playlistId, itemId: item.id };
                const existing = map.get(item.mediaUrl);
                if (existing) {
                    existing.items.push(itemRef);
                    if (!existing.playlistIds.includes(playlistId)) {
                        existing.playlistIds.push(playlistId);
                        existing.playlistNames.push(playlistName);
                    }
                    if (itemCreatedAt && (!existing.createdAt || itemCreatedAt < existing.createdAt)) {
                        existing.createdAt = itemCreatedAt;
                    }
                } else {
                    map.set(item.mediaUrl, {
                        mediaUrl: item.mediaUrl,
                        title: item.title ?? undefined,
                        duration: item.duration ?? undefined,
                        createdAt: itemCreatedAt ?? undefined,
                        playlistIds: [playlistId],
                        playlistNames: [playlistName],
                        items: [itemRef],
                    });
                }
            }
        });

        return Array.from(map.values());
    }, [playlistQueries, playlistIds, playlistNamesMap]);

    const isLoading =
        playlistsQuery.isLoading ||
        playlistQueries.some((q) => q.isLoading);
    const isRefetching =
        playlistsQuery.isRefetching ||
        playlistQueries.some((q) => q.isRefetching);
    const error = playlistsQuery.error ?? playlistQueries.find((q) => q.error)?.error;

    const refetch = async () => {
        await playlistsQuery.refetch();
        await Promise.all(playlistQueries.map((q) => q.refetch()));
    };

    return {
        data: mediaItems,
        isLoading,
        isRefetching,
        error,
        refetch,
    };
}
