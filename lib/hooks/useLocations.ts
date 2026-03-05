import { useQuery } from '@tanstack/react-query';
import { locationsApi, locationKeys, type Location } from '../api';

export type { Location };

export function useLocations(orgId: string | undefined) {
    return useQuery({
        queryKey: locationKeys.list(orgId ?? ''),
        queryFn: () => locationsApi.list(orgId!),
        enabled: !!orgId,
    });
}
