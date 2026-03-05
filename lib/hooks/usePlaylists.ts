import {
    useQuery,
    useMutation,
    useQueryClient,
    useQueries,
} from '@tanstack/react-query';
import {
    playlistsApi,
    playlistKeys,
    type Playlist,
    type CreatePlaylist,
    type UpdatePlaylist,
    type CreatePlaylistItem,
    type UpdatePlaylistItem,
} from '../api';
import { showSuccessNotification } from '../notifications/successNotification';

export type { Playlist, PlaylistItem } from '../api';

/** List playlists for a location. Refetches on app focus and uses 30s stale time. */
export function usePlaylists(locationId: string | undefined) {
    return useQuery({
        queryKey: playlistKeys.list(locationId ?? ''),
        queryFn: () => playlistsApi.list(locationId!),
        enabled: !!locationId,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    });
}

/** Single playlist with items. Used for playlist detail and media aggregation. */
export function usePlaylist(id: string | undefined) {
    return useQuery({
        queryKey: playlistKeys.detail(id ?? ''),
        queryFn: () => playlistsApi.getById(id!),
        enabled: !!id,
        staleTime: 15_000,
        refetchOnWindowFocus: true,
    });
}

/** Create playlist. Invalidates list. */
export function useCreatePlaylist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CreatePlaylist) => playlistsApi.create(body),
        onSuccess: (data) => {
            if (data.locationId) {
                queryClient.setQueryData(
                    playlistKeys.list(data.locationId),
                    (old: Playlist[] | undefined) =>
                        old ? [...old, data] : [data],
                );
            }
            queryClient.invalidateQueries({ queryKey: playlistKeys.all });
            showSuccessNotification('Playlist created', data.name);
        },
    });
}

/** Update playlist. Optimistically updates list and detail. */
export function useUpdatePlaylist(locationId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            body,
        }: {
            id: string;
            body: UpdatePlaylist;
        }) => playlistsApi.update(id, body),
        onSuccess: (data, variables) => {
            if (locationId) {
                queryClient.setQueryData(
                    playlistKeys.list(locationId),
                    (old: Playlist[] | undefined) =>
                        old
                            ? old.map((p) =>
                                  p.id === variables.id ? { ...p, ...data } : p,
                              )
                            : [],
                );
            }
            queryClient.setQueryData(
                playlistKeys.detail(variables.id),
                (old: Playlist | undefined) =>
                    old ? { ...old, ...data } : undefined,
            );
            queryClient.invalidateQueries({ queryKey: playlistKeys.all });
            showSuccessNotification('Playlist updated', data.name);
        },
    });
}

/** Delete playlist. Removes detail, invalidates list. */
export function useDeletePlaylist(locationId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => playlistsApi.delete(id),
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: playlistKeys.detail(id) });
            if (locationId) {
                queryClient.setQueryData(
                    playlistKeys.list(locationId),
                    (old: Playlist[] | undefined) =>
                        old ? old.filter((p) => p.id !== id) : [],
                );
            }
            queryClient.invalidateQueries({ queryKey: playlistKeys.all });
            showSuccessNotification('Playlist deleted');
        },
    });
}

/** Add item to playlist. Invalidates playlist detail. */
export function useAddPlaylistItem(playlistId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CreatePlaylistItem) =>
            playlistsApi.addItem(playlistId!, body),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: playlistKeys.detail(playlistId ?? ''),
            });
            queryClient.invalidateQueries({ queryKey: playlistKeys.all });
            const itemLabel = variables.mediaUrl ?? variables.title ?? 'Item';
            showSuccessNotification('Added to playlist', itemLabel);
        },
    });
}

/** Update playlist item. Invalidates playlist detail. */
export function useUpdatePlaylistItem(playlistId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            itemId,
            body,
        }: {
            itemId: string;
            body: UpdatePlaylistItem;
        }) => playlistsApi.updateItem(playlistId!, itemId, body),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: playlistKeys.detail(playlistId ?? ''),
            });
            queryClient.invalidateQueries({ queryKey: playlistKeys.all });
        },
    });
}

/** Batch update playlist items (e.g. media in multiple playlists). */
export function useBatchUpdatePlaylistItems() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            updates: {
                playlistId: string;
                itemId: string;
                body: UpdatePlaylistItem;
            }[],
        ) => {
            await Promise.all(
                updates.map((u) =>
                    playlistsApi.updateItem(u.playlistId, u.itemId, u.body),
                ),
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: playlistKeys.all });
            showSuccessNotification('Media updated');
        },
    });
}

/** Batch remove playlist items (e.g. remove media from all playlists). */
export function useBatchRemovePlaylistItems() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            items: { playlistId: string; itemId: string }[],
        ) => {
            await Promise.all(
                items.map((i) =>
                    playlistsApi.removeItem(i.playlistId, i.itemId),
                ),
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: playlistKeys.all });
            showSuccessNotification('Removed from playlists');
        },
    });
}

/** Remove item from playlist. Invalidates playlist detail. */
export function useRemovePlaylistItem(playlistId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemId: string) =>
            playlistsApi.removeItem(playlistId!, itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: playlistKeys.detail(playlistId ?? ''),
            });
            queryClient.invalidateQueries({ queryKey: playlistKeys.all });
            showSuccessNotification('Removed from playlist');
        },
    });
}

/** Assign playlist to device. Invalidates playlist queries. */
export function useAssignPlaylist(playlistId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (deviceId: string) =>
            playlistsApi.assign(playlistId!, deviceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: playlistKeys.all });
        },
    });
}

/** Unassign playlist from device. Invalidates playlist queries. */
export function useUnassignPlaylist(playlistId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (deviceId: string) =>
            playlistsApi.unassign(playlistId!, deviceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: playlistKeys.all });
        },
    });
}
