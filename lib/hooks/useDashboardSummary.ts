import { useMemo } from 'react';
import { useOrganizations } from './useOrganizations';
import { useLocations } from './useLocations';
import { useDevices } from './useDevices';
import { usePlaylists } from './usePlaylists';
import { useMediaItems } from './useMediaItems';

export interface DashboardSummary {
    totalDevices: number;
    activeDevices: number;
    inactiveDevices: number;
    mediaFileCount: number;
    totalPlayTimeSec: number;
    totalPlaylists: number;
    activePlaylistCount: number;
    clerkOrgId: string | undefined;
    firstLocationId: string | undefined;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Aggregates org, location, devices, playlists, and media for dashboard summary.
 * Computes total/active/inactive devices, media count, play time, and active playlists.
 */
export function useDashboardSummary(): DashboardSummary {
    const { data: orgs } = useOrganizations();
    const firstOrg = orgs?.[0];
    const clerkOrgId = firstOrg?.clerkOrgId ?? firstOrg?.id;
    const { data: locations } = useLocations(clerkOrgId);
    const firstLocationId = locations?.[0]?.id;
    const { data: devices, isLoading: devicesLoading } = useDevices(clerkOrgId);
    const { data: playlists, isLoading: playlistsLoading } =
        usePlaylists(firstLocationId);
    const { data: mediaItems, isLoading: mediaLoading } =
        useMediaItems(firstLocationId);

    const summary = useMemo(() => {
        const totalDevices = devices?.length ?? 0;
        const activeDevices =
            devices?.filter((d) => d.status === 'online').length ?? 0;
        const inactiveDevices = totalDevices - activeDevices;
        const mediaFileCount = mediaItems?.length ?? 0;
        const totalPlayTimeSec =
            mediaItems?.reduce((acc, i) => acc + (i.duration ?? 0), 0) ?? 0;
        const totalPlaylists = playlists?.length ?? 0;
        const activePlaylistIds = new Set(
            devices
                ?.filter((d) => d.activePlaylistId)
                .map((d) => d.activePlaylistId)
                .filter((id): id is string => !!id) ?? [],
        );
        const activePlaylistCount = activePlaylistIds.size;

        return {
            totalDevices,
            activeDevices,
            inactiveDevices,
            mediaFileCount,
            totalPlayTimeSec,
            totalPlaylists,
            activePlaylistCount,
        };
    }, [devices, mediaItems, playlists]);

    const isLoading = devicesLoading || playlistsLoading || mediaLoading;
    const error = null; // Individual hooks handle errors; dashboard could surface if needed

    return {
        ...summary,
        clerkOrgId,
        firstLocationId,
        isLoading,
        error,
    };
}
