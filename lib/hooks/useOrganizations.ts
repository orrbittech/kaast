import { useQuery } from '@tanstack/react-query';
import { organizationsApi, type Organization } from '../api';

export type { Organization };

export function useOrganizations() {
    return useQuery({
        queryKey: ['organizations'],
        queryFn: () => organizationsApi.list(),
    });
}
