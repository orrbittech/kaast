import { useQuery } from '@tanstack/react-query';
import { locationsApi, type Location } from '../api';

export type { Location };

export function useLocations(orgId: string | undefined) {
    return useQuery({
        queryKey: ['locations', orgId],
        queryFn: () => locationsApi.list(orgId!),
        enabled: !!orgId,
    });
}
