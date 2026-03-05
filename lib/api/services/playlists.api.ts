import { apiClient } from '../client';
import type {
    Playlist,
    PlaylistItem,
    CreatePlaylist,
    UpdatePlaylist,
    CreatePlaylistItem,
    UpdatePlaylistItem,
} from '../types';

export const playlistsApi = {
    /** GET /playlists?locationId - List playlists for location */
    list: async (locationId: string): Promise<Playlist[]> => {
        const { data } = await apiClient.get<Playlist[]>(
            `/playlists?locationId=${locationId}`,
        );
        return data;
    },

    /** POST /playlists - Create playlist */
    create: async (body: CreatePlaylist): Promise<Playlist> => {
        const { data } = await apiClient.post<Playlist>('/playlists', body);
        return data;
    },

    /** GET /playlists/:id - Get playlist with items */
    getById: async (id: string): Promise<Playlist> => {
        const { data } = await apiClient.get<Playlist>(`/playlists/${id}`);
        return data;
    },

    /** PATCH /playlists/:id - Update playlist */
    update: async (
        id: string,
        body: UpdatePlaylist,
    ): Promise<Playlist> => {
        const { data } = await apiClient.patch<Playlist>(
            `/playlists/${id}`,
            body,
        );
        return data;
    },

    /** DELETE /playlists/:id - Delete playlist */
    delete: async (id: string): Promise<{ deleted: boolean }> => {
        const { data } = await apiClient.delete<{ deleted: boolean }>(
            `/playlists/${id}`,
        );
        return data ?? { deleted: true };
    },

    /** POST /playlists/:id/items - Add item to playlist */
    addItem: async (
        playlistId: string,
        body: CreatePlaylistItem,
    ): Promise<PlaylistItem> => {
        const { data } = await apiClient.post<PlaylistItem>(
            `/playlists/${playlistId}/items`,
            body,
        );
        return data;
    },

    /** PATCH /playlists/:id/items/:itemId - Update playlist item */
    updateItem: async (
        playlistId: string,
        itemId: string,
        body: UpdatePlaylistItem,
    ): Promise<PlaylistItem> => {
        const { data } = await apiClient.patch<PlaylistItem>(
            `/playlists/${playlistId}/items/${itemId}`,
            body,
        );
        return data;
    },

    /** DELETE /playlists/:id/items/:itemId - Remove item from playlist */
    removeItem: async (
        playlistId: string,
        itemId: string,
    ): Promise<{ deleted: boolean }> => {
        const { data } = await apiClient.delete<{ deleted: boolean }>(
            `/playlists/${playlistId}/items/${itemId}`,
        );
        return data ?? { deleted: true };
    },

    /** POST /playlists/:id/assign/:deviceId - Assign playlist to device */
    assign: async (
        playlistId: string,
        deviceId: string,
    ): Promise<{ assigned: boolean; playlistId: string; deviceId: string }> => {
        const { data } = await apiClient.post(
            `/playlists/${playlistId}/assign/${deviceId}`,
        );
        return data;
    },

    /** DELETE /playlists/:id/unassign/:deviceId - Unassign playlist from device */
    unassign: async (
        playlistId: string,
        deviceId: string,
    ): Promise<{ unassigned: boolean; deviceId: string }> => {
        const { data } = await apiClient.delete(
            `/playlists/${playlistId}/unassign/${deviceId}`,
        );
        return data;
    },
};
