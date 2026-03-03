import { useQuery } from '@tanstack/react-query';
import { mediaApi, type MediaSession } from '../api';

export type { MediaSession };

export function useMediaSession(deviceId: string | undefined) {
    return useQuery({
        queryKey: ['mediaSession', deviceId],
        queryFn: () => mediaApi.getSession(deviceId!),
        enabled: !!deviceId,
        refetchInterval: 5000,
    });
}
