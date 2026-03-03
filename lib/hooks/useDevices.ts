import { useQuery } from '@tanstack/react-query';
import { devicesApi, type Device } from '../api';

export type { Device };

export function useDevices(locationId: string | undefined) {
    return useQuery({
        queryKey: ['devices', locationId],
        queryFn: () => devicesApi.list(locationId!),
        enabled: !!locationId,
    });
}
